import React from 'react';
import { Home, Map as MapIcon, BarChart2, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const BottomNav = ({ activeTab, setActiveTab }) => {
  const { t } = useTranslation();

  const tabs = [
    { id: 'dashboard', icon: Home, label: t('nav.today') },
    { id: 'map', icon: MapIcon, label: t('nav.map') },
    { id: 'insights', icon: BarChart2, label: t('nav.insights') },
    { id: 'profile', icon: User, label: t('nav.profile') }
  ];

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => (
        <button 
          key={tab.id}
          className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          <tab.icon size={24} />
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
