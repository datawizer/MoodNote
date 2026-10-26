import React from 'react';
import { Sun, BookOpen, Calendar, BarChart3, Settings } from 'lucide-react';

export type TabId = 'today' | 'history' | 'calendar' | 'insights' | 'settings';

interface NavigationProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  navBgClass: string;
  textPrimaryClass: string;
  textSecondaryClass: string;
  navActiveClass: string;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  navBgClass,
  textSecondaryClass,
  navActiveClass,
}) => {
  const tabs = [
    { id: 'today' as TabId, label: 'Today', icon: Sun },
    { id: 'history' as TabId, label: 'History', icon: BookOpen },
    { id: 'calendar' as TabId, label: 'Calendar', icon: Calendar },
    { id: 'insights' as TabId, label: 'Insights', icon: BarChart3 },
    { id: 'settings' as TabId, label: 'Settings', icon: Settings },
  ];

  return (
    <nav
      className={`w-full py-2.5 px-4 flex items-center justify-around z-30 transition-colors ${navBgClass}`}
      aria-label="App Navigation"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectTab(tab.id)}
            className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all cursor-pointer ${
              isActive ? navActiveClass : textSecondaryClass
            } hover:opacity-100`}
            aria-label={tab.label}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon className={`w-4 h-4 transition-transform ${isActive ? 'scale-110 stroke-[2.2]' : 'stroke-[1.8]'}`} />
            <span className={`text-[10px] mt-1 ${isActive ? 'font-semibold' : 'font-normal'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
