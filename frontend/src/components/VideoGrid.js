import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import VideoCard from './VideoCard';
import './VideoGrid.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function VideoGrid() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const search = searchParams.get('search') || '';
  const searchIn = searchParams.get('searchIn') || 'all';
  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    loadVideos();
  }, [search, searchIn, page]);

  const loadVideos = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/videos`, {
        params: {
          page,
          limit: 20,
          search,
          searchIn,
          sortBy: 'upload_date',
          order: 'DESC'
        }
      });

      setVideos(response.data.videos);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (searchIn !== 'all') params.set('searchIn', searchIn);
    params.set('page', newPage);
    navigate(`/?${params.toString()}`);
  };

  const getSearchInLabel = () => {
    const labels = {
      all: 'all content',
      title: 'titles',
      description: 'descriptions',
      comments: 'comments'
    };
    return labels[searchIn] || 'all content';
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (views) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M views`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K views`;
    }
    return `${views} views`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  if (loading) {
    return (
      <div className="video-grid-container">
        <div className="loading">Loading videos...</div>
      </div>
    );
  }

  return (
    <div className="video-grid-container">
      {search && (
        <div className="search-info">
          Search results for "{search}" in <strong>{getSearchInLabel()}</strong> - {pagination?.totalCount || 0} videos found
        </div>
      )}

      <div className="video-grid">
        {videos.map(video => (
          <VideoCard
            key={video.id}
            video={video}
            formatDuration={formatDuration}
            formatViews={formatViews}
            formatDate={formatDate}
          />
        ))}
      </div>

      {videos.length === 0 && (
        <div className="no-videos">
          {search ? 'No videos found for your search.' : 'No videos available yet. Try running a sync!'}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-button"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            Previous
          </button>

          <span className="pagination-info">
            Page {page} of {pagination.totalPages}
          </span>

          <button
            className="pagination-button"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === pagination.totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default VideoGrid;
