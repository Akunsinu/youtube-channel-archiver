import React from 'react';
import { useNavigate } from 'react-router-dom';
import './VideoCard.css';

function VideoCard({ video, formatDuration, formatViews, formatDate }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (video.download_status === 'completed') {
      navigate(`/watch/${video.id}`);
    }
  };

  return (
    <div
      className={`video-card ${video.download_status !== 'completed' ? 'disabled' : ''}`}
      onClick={handleClick}
    >
      <div className="video-thumbnail-container">
        <img
          src={video.thumbnail_url}
          alt={video.title}
          className="video-thumbnail"
        />
        <div className="video-duration">{formatDuration(video.duration)}</div>
        {video.download_status !== 'completed' && (
          <div className="download-overlay">
            {video.download_status === 'pending' && 'Pending Download'}
            {video.download_status === 'downloading' && 'Downloading...'}
            {video.download_status === 'failed' && 'Download Failed'}
          </div>
        )}
      </div>

      <div className="video-info">
        <h3 className="video-title">{video.title}</h3>
        <div className="video-metadata">
          <span>{formatViews(video.view_count)}</span>
          <span className="dot">•</span>
          <span>{formatDate(video.upload_date)}</span>
        </div>
        {video.like_count > 0 && (
          <div className="video-stats">
            <span>👍 {video.like_count.toLocaleString()}</span>
            {video.comment_count > 0 && (
              <>
                <span className="dot">•</span>
                <span>💬 {video.comment_count.toLocaleString()}</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoCard;
