import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ReactPlayer from 'react-player';
import Comments from './Comments';
import './VideoPlayer.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function VideoPlayer() {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    loadVideo();
  }, [videoId]);

  const loadVideo = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/videos/${videoId}`);
      setVideo(response.data);
    } catch (error) {
      console.error('Error loading video:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatViews = (views) => {
    return views.toLocaleString();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="video-player-loading">Loading video...</div>;
  }

  if (!video) {
    return <div className="video-player-error">Video not found</div>;
  }

  const videoUrl = `${API_URL}/api/videos/${videoId}/stream`;

  return (
    <div className="video-player-container">
      <div className="video-player-main">
        <div className="player-wrapper">
          <ReactPlayer
            url={videoUrl}
            controls
            width="100%"
            height="100%"
            config={{
              file: {
                attributes: {
                  controlsList: 'nodownload'
                }
              }
            }}
          />
        </div>

        <div className="video-details">
          <h1 className="video-title">{video.title}</h1>

          <div className="video-stats">
            <div className="stats-left">
              <span>{formatViews(video.view_count)} views</span>
              <span className="dot">•</span>
              <span>{formatDate(video.upload_date)}</span>
            </div>
            <div className="stats-right">
              <div className="stat-item">
                <span className="stat-icon">👍</span>
                <span>{video.like_count.toLocaleString()}</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">💬</span>
                <span>{video.comment_count.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="video-description-container">
            <div className={`video-description ${showFullDescription ? 'expanded' : ''}`}>
              {video.description || 'No description available'}
            </div>
            {video.description && video.description.length > 200 && (
              <button
                className="show-more-button"
                onClick={() => setShowFullDescription(!showFullDescription)}
              >
                {showFullDescription ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>

          {video.tags && video.tags.length > 0 && (
            <div className="video-tags">
              {video.tags.map((tag, index) => (
                <span key={index} className="tag">#{tag}</span>
              ))}
            </div>
          )}
        </div>

        <Comments videoId={videoId} commentCount={video.comment_count} />
      </div>
    </div>
  );
}

export default VideoPlayer;
