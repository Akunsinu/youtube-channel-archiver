import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Header.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSync = async (syncType) => {
    setIsSyncing(true);
    try {
      await axios.post(`${API_URL}/api/sync/trigger`, { syncType });
      alert(`${syncType} sync started! This will run in the background.`);
    } catch (error) {
      console.error('Error triggering sync:', error);
      alert('Failed to trigger sync. Please check the console.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <Link to="/" className="logo">
          <span className="logo-icon">📺</span>
          <span className="logo-text">YouTube Archiver</span>
        </Link>
      </div>

      <div className="header-center">
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            className="search-input"
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="search-button">
            🔍
          </button>
        </form>
      </div>

      <div className="header-right">
        <Link to="/stats" className="nav-button">
          Stats
        </Link>
        <button
          className="nav-button"
          onClick={() => handleSync('incremental')}
          disabled={isSyncing}
        >
          {isSyncing ? 'Syncing...' : 'Sync Now'}
        </button>
        <button
          className="nav-button"
          onClick={() => handleSync('full')}
          disabled={isSyncing}
        >
          Full Sync
        </button>
      </div>
    </header>
  );
}

export default Header;
