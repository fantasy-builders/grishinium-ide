import React from 'react';
import { FileTab } from './FileExplorer';
import './FileTabs.css';

interface FileTabsProps {
  tabs: FileTab[];
  activeTab: string | null;
  onTabSelect: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
}

const FileTabs: React.FC<FileTabsProps> = ({ 
  tabs, 
  activeTab, 
  onTabSelect, 
  onTabClose 
}) => {
  if (tabs.length === 0) return null;

  return (
    <div className="file-tabs">
      <div className="tabs-scroll-container">
        {tabs.map(tab => (
          <div 
            key={tab.id}
            className={`tab ${tab.id === activeTab ? 'active' : ''}`}
            onClick={() => onTabSelect(tab.id)}
          >
            <span className="tab-icon">📄</span>
            <span className="tab-name">{tab.name}</span>
            <button 
              className="tab-close" 
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.id);
              }}
              title="Close"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileTabs; 