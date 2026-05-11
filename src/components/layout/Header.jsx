import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sun, CloudRain } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { i18n } = useTranslation();
  const { user } = useAuth();

  const toggleLang = () => {
    const newLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="branding">
          <h1>AgriSense</h1>
          <span className="badge">PRO</span>
        </div>
        <div className="header-actions">
          <button className="lang-toggle" onClick={toggleLang}>
            {i18n.language === 'en' ? 'A/अ' : 'अ/A'}
          </button>
          <div className="weather-chip">
            <Sun size={16} /> 32°C
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
