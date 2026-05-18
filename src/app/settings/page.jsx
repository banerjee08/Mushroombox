"use client";
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import { useEffect } from 'react';
import './Settings.css';

export default function Settings() {
  const { user, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/auth');
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <div className="settings-page container">
      <h1 className="settings-title">Settings</h1>

      <div className="settings-card">
        <h2 className="settings-section-title">Appearance</h2>

        <div className="settings-row">
          <div className="settings-row-info">
            <div className="settings-row-label">
              {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
              Dark Mode
            </div>
            <p className="settings-row-desc">
              Switch between light and dark theme. Your preference is saved automatically.
            </p>
          </div>
          <button
            className={`theme-toggle-btn ${theme === 'dark' ? 'active' : ''}`}
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
          >
            <span className="toggle-thumb" />
          </button>
        </div>
      </div>
    </div>
  );
}
