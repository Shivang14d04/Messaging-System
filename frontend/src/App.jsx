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

  const fetchFolders = async () => {
    try {
      const [foldersData, statsData] = await Promise.all([
        folderService.getFolders(),
        folderService.getStats()
      ]);
      setFolders(foldersData || { defaultFolders: [], userFolders: [] });
      setStats(statsData || {});
    } catch (err) {
      console.error('Failed to load folders:', err);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get('token');
      if (urlToken) {
        localStorage.setItem('token', urlToken);
        window.history.replaceState({}, document.title, window.location.pathname);
      }

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

  const handleLoginSuccess = async () => {
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
      console.error('Failed to load user info after login:', err);
    }
  };

  if (authLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading workspace...</p>
      </div>
    );
  }

  if (!authenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
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
            onFoldersRefresh={fetchFolders}
          />

          <main style={{ flex: 1, height: '100%', overflow: 'hidden' }} onClick={() => setSidebarMobileOpen(false)}>
            <Routes>
              <Route
                path="/"
                element={
                  <Inbox
                    activeFolder={activeFolder}
                    onStatsRefresh={fetchStats}
                    userFolders={folders.userFolders}
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
