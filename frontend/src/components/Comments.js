import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Comments.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function Comments({ videoId, commentCount }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComments();
  }, [videoId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/videos/${videoId}/comments`);
      setComments(response.data);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
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

  const Comment = ({ comment, isReply = false }) => (
    <div className={`comment ${isReply ? 'reply' : ''}`}>
      <img
        src={comment.author_profile_image_url}
        alt={comment.author_name}
        className="comment-avatar"
      />
      <div className="comment-content">
        <div className="comment-header">
          <span className="comment-author">{comment.author_name}</span>
          <span className="comment-date">{formatDate(comment.published_at)}</span>
        </div>
        <div className="comment-text">{comment.text_display}</div>
        {comment.like_count > 0 && (
          <div className="comment-likes">
            <span className="like-icon">👍</span>
            <span>{comment.like_count}</span>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="comments-section">
        <div className="comments-loading">Loading comments...</div>
      </div>
    );
  }

  return (
    <div className="comments-section">
      <div className="comments-header">
        <h2>{commentCount.toLocaleString()} Comments</h2>
      </div>

      {comments.length === 0 ? (
        <div className="no-comments">No comments yet</div>
      ) : (
        <div className="comments-list">
          {comments.map(comment => (
            <div key={comment.id} className="comment-thread">
              <Comment comment={comment} />
              {comment.replies && comment.replies.length > 0 && (
                <div className="replies">
                  {comment.replies.map(reply => (
                    <Comment key={reply.id} comment={reply} isReply={true} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Comments;
