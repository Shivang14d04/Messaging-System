import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Inbox from './pages/Inbox';
import EmailDetail from './pages/EmailDetail';
import Compose from './pages/Compose';
import Login from './pages/Login';
import { authService, folderService } from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const [folders, setFolders] = useState({ defaultFolders: [], userFolders: [] });
  const [stats, setStats] = useState({});
  const [activeFolder, setActiveFolder] = useState('Inbox');

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);

  const handleToggleSidebar = () => {
    if (window.innerWidth <= 768) {
      setSidebarMobileOpen(!sidebarMobileOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await folderService.getStats();
      setStats(statsData || {});
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await authService.getMe();
        if (data.authenticated) {
          setUser(data);
          setAuthenticated(true);
          await Promise.all([
            folderService.getFolders().then(setFolders),
            folderService.getStats().then(setStats)
          ]);
        }
      } catch (err) {
        console.error('User authentication check failed:', err);
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (authLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading workspace...</p>
      </div>
    );
  }

  if (!authenticated) {
    return <Login />;
  }

  return (
    <Router>
      <div className="app-container">
        <Navbar user={user} onToggleSidebar={handleToggleSidebar} />

        <div className="main-content">
          <Sidebar
            folders={folders}
            stats={stats}
            activeFolder={activeFolder}
            onFolderChange={setActiveFolder}
            collapsed={sidebarCollapsed}
            isOpen={sidebarMobileOpen}
          />

          <main style={{ flex: 1, height: '100%', overflow: 'hidden' }} onClick={() => setSidebarMobileOpen(false)}>
            <Routes>
              <Route
                path="/"
                element={
                  <Inbox
                    activeFolder={activeFolder}
                    onStatsRefresh={fetchStats}
                  />
                }
              />
              <Route path="/email/:id" element={<EmailDetail />} />
              <Route
                path="/compose"
                element={<Compose onStatsRefresh={fetchStats} />}
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
