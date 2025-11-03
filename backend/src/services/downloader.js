const youtubedl = require('youtube-dl-exec');
const path = require('path');
const fs = require('fs').promises;

class VideoDownloader {
  constructor(outputDir = '/data/videos') {
    this.outputDir = outputDir;
  }

  /**
   * Ensure output directory exists
   */
  async ensureOutputDir() {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
    } catch (error) {
      console.error('Error creating output directory:', error);
      throw error;
    }
  }

  /**
   * Download a single video
   */
  async downloadVideo(videoId, videoTitle) {
    await this.ensureOutputDir();

    const url = `https://www.youtube.com/watch?v=${videoId}`;
    const sanitizedTitle = this.sanitizeFilename(videoTitle);
    const outputTemplate = path.join(this.outputDir, `${videoId}-${sanitizedTitle}.%(ext)s`);

    console.log(`Starting download for: ${videoTitle} (${videoId})`);

    try {
      const result = await youtubedl(url, {
        output: outputTemplate,
        format: 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
        mergeOutputFormat: 'mp4',
        writeInfoJson: false,
        writeThumbnail: true,
        embedThumbnail: false,
        noPlaylist: true,
        noWarnings: true,
        preferFreeFormats: false,
        addMetadata: true,
      });

      // Construct the actual file path
      const filePath = path.join(this.outputDir, `${videoId}-${sanitizedTitle}.mp4`);

      console.log(`Download completed: ${videoTitle}`);

      return {
        success: true,
        filePath: filePath,
        videoId: videoId
      };
    } catch (error) {
      console.error(`Error downloading video ${videoId}:`, error.message);
      return {
        success: false,
        error: error.message,
        videoId: videoId
      };
    }
  }

  /**
   * Download multiple videos with progress tracking
   */
  async downloadVideos(videos, onProgress = null) {
    const results = [];

    for (let i = 0; i < videos.length; i++) {
      const video = videos[i];
      const result = await this.downloadVideo(video.id, video.title);
      results.push(result);

      if (onProgress) {
        onProgress({
          current: i + 1,
          total: videos.length,
          video: video,
          result: result
        });
      }

      // Small delay between downloads to be respectful
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return results;
  }

  /**
   * Check if a video file exists
   */
  async videoExists(videoId) {
    try {
      const files = await fs.readdir(this.outputDir);
      return files.some(file => file.startsWith(videoId));
    } catch (error) {
      return false;
    }
  }

  /**
   * Get the file path for a downloaded video
   */
  async getVideoFilePath(videoId) {
    try {
      const files = await fs.readdir(this.outputDir);
      const videoFile = files.find(file => file.startsWith(videoId) && file.endsWith('.mp4'));

      if (videoFile) {
        return path.join(this.outputDir, videoFile);
      }
      return null;
    } catch (error) {
      console.error('Error finding video file:', error);
      return null;
    }
  }

  /**
   * Sanitize filename to remove invalid characters
   */
  sanitizeFilename(filename) {
    return filename
      .replace(/[<>:"/\\|?*]/g, '') // Remove invalid chars
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .substring(0, 100); // Limit length
  }

  /**
   * Get disk usage statistics
   */
  async getStorageStats() {
    try {
      const files = await fs.readdir(this.outputDir);
      let totalSize = 0;
      let videoCount = 0;

      for (const file of files) {
        if (file.endsWith('.mp4')) {
          const filePath = path.join(this.outputDir, file);
          const stats = await fs.stat(filePath);
          totalSize += stats.size;
          videoCount++;
        }
      }

      return {
        videoCount,
        totalSizeBytes: totalSize,
        totalSizeGB: (totalSize / (1024 ** 3)).toFixed(2)
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return { videoCount: 0, totalSizeBytes: 0, totalSizeGB: 0 };
    }
  }
}

module.exports = VideoDownloader;
