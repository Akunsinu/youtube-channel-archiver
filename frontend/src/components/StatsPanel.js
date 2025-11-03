import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StatsPanel.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function StatsPanel() {
  const [stats, setStats] = useState(null);
  const [channel, setChannel] = useState(null);
  const [syncLogs, setSyncLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsResponse, syncResponse] = await Promise.all([
        axios.get(`${API_URL}/api/videos/stats/overview`),
        axios.get(`${API_URL}/api/sync/status`)
      ]);

      setStats(statsResponse.data.stats);
      setChannel(statsResponse.data.channel);
      setSyncLogs(syncResponse.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    return parseInt(num || 0).toLocaleString();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatDuration = (start, end) => {
    if (!start || !end) return 'N/A';
    const diff = new Date(end) - new Date(start);
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  if (loading) {
    return <div className="stats-panel-loading">Loading statistics...</div>;
  }

  return (
    <div className="stats-panel">
      <h1 className="stats-title">Channel Statistics</h1>

      {channel && (
        <div className="channel-info-card">
          <img
            src={channel.thumbnail_url}
            alt={channel.title}
            className="channel-avatar"
          />
          <div className="channel-details">
            <h2>{channel.title}</h2>
            <p className="channel-description">{channel.description}</p>
            <div className="channel-stats">
              <div className="stat">
                <span className="stat-value">{formatNumber(channel.subscriber_count)}</span>
                <span className="stat-label">Subscribers</span>
              </div>
              <div className="stat">
                <span className="stat-value">{formatNumber(channel.video_count)}</span>
                <span className="stat-label">Videos</span>
              </div>
              <div className="stat">
                <span className="stat-value">{formatNumber(channel.view_count)}</span>
                <span className="stat-label">Total Views</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📹</div>
            <div className="stat-value">{formatNumber(stats.total_videos)}</div>
            <div className="stat-label">Total Videos</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👁️</div>
            <div className="stat-value">{formatNumber(stats.total_views)}</div>
            <div className="stat-label">Total Views</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👍</div>
            <div className="stat-value">{formatNumber(stats.total_likes)}</div>
            <div className="stat-label">Total Likes</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💬</div>
            <div className="stat-value">{formatNumber(stats.total_comments)}</div>
            <div className="stat-label">Total Comments</div>
          </div>

          <div className="stat-card success">
            <div className="stat-icon">✅</div>
            <div className="stat-value">{formatNumber(stats.downloaded_videos)}</div>
            <div className="stat-label">Downloaded</div>
          </div>

          <div className="stat-card warning">
            <div className="stat-icon">⏳</div>
            <div className="stat-value">{formatNumber(stats.pending_videos)}</div>
            <div className="stat-label">Pending</div>
          </div>

          <div className="stat-card error">
            <div className="stat-icon">❌</div>
            <div className="stat-value">{formatNumber(stats.failed_videos)}</div>
            <div className="stat-label">Failed</div>
          </div>
        </div>
      )}

      <div className="sync-logs">
        <h2>Recent Sync History</h2>
        {syncLogs.length === 0 ? (
          <div className="no-logs">No sync logs available</div>
        ) : (
          <div className="logs-table">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Videos</th>
                  <th>Comments</th>
                  <th>Started</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {syncLogs.map(log => (
                  <tr key={log.id}>
                    <td>
                      <span className="log-type">{log.sync_type.replace('_', ' ')}</span>
                    </td>
                    <td>
                      <span className={`log-status ${log.status}`}>
                        {log.status}
                      </span>
                    </td>
                    <td>{formatNumber(log.videos_processed)}</td>
                    <td>{formatNumber(log.comments_processed)}</td>
                    <td>{formatDate(log.started_at)}</td>
                    <td>{formatDuration(log.started_at, log.completed_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default StatsPanel;
