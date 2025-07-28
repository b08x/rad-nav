
import React, { useState } from 'react';
import { Role, Tab } from '../types';
import SystemArchitecture from './SystemArchitecture';
import SupportCenter from './SupportCenter';
import KnowledgeEngine from './KnowledgeEngine';
import DatasetGenerator from './DatasetGenerator';
import IntegratedSupportHub from './IntegratedSupportHub';
import { ArrowLeftIcon, BrainCircuitIcon, LifeBuoyIcon, MessageSquareIcon, DatabaseIcon, BookOpenCheckIcon } from './common/Icons';

interface DashboardProps {
  role: Role;
  onBack: () => void;
}

const TABS_INFO: Record<Tab, { id: Tab; icon: React.ReactNode; description: string; }> = {
    [Tab.SystemArchitecture]: { 
        id: Tab.SystemArchitecture, 
        icon: <BrainCircuitIcon className="w-5 h-5 mr-2" />,
        description: "Visually explore system components, data flows, and integration points."
    },
    [Tab.SupportCenter]: { 
        id: Tab.SupportCenter, 
        icon: <LifeBuoyIcon className="w-5 h-5 mr-2" />,
        description: "Use interactive tools to diagnose issues and find escalation procedures."
     },
    [Tab.KnowledgeEngine]: { 
        id: Tab.KnowledgeEngine, 
        icon: <MessageSquareIcon className="w-5 h-5 mr-2" />,
        description: "Ask questions and get answers from the support documentation using AI."
    },
    [Tab.DatasetGenerator]: {
        id: Tab.DatasetGenerator,
        icon: <DatabaseIcon className="w-5 h-5 mr-2" />,
        description: "Generate structured Q&A datasets for model training and validation."
    },
    [Tab.IntegratedSupportHub]: {
        id: Tab.IntegratedSupportHub,
        icon: <BookOpenCheckIcon className="w-5 h-5 mr-2" />,
        description: "A unified view for diagnostics, AI chat, and documentation generation."
    }
};

const Dashboard = ({ role, onBack }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState<Tab>(
    role === Role.SupportEngineer ? Tab.IntegratedSupportHub : Tab.SystemArchitecture
  );

  const renderContent = () => {
    switch (activeTab) {
      case Tab.SystemArchitecture:
        return <SystemArchitecture />;
      case Tab.SupportCenter:
        return <SupportCenter role={role} />;
      case Tab.KnowledgeEngine:
        return <KnowledgeEngine role={role} />;
      case Tab.DatasetGenerator:
        return <DatasetGenerator />;
      case Tab.IntegratedSupportHub:
        return <IntegratedSupportHub role={role} />;
      default:
        return <SystemArchitecture />;
    }
  };
  
  const activeTabInfo = TABS_INFO[activeTab];

  const getVisibleTabs = () => {
    if (role === Role.SupportEngineer) {
      return [TABS_INFO[Tab.IntegratedSupportHub], TABS_INFO[Tab.SystemArchitecture]];
    }
    
    const allTabs = [TABS_INFO[Tab.SystemArchitecture], TABS_INFO[Tab.SupportCenter], TABS_INFO[Tab.KnowledgeEngine], TABS_INFO[Tab.DatasetGenerator]];
    
    return allTabs.filter(tab => {
        if (tab.id === Tab.DatasetGenerator) {
            return role === Role.LMTrainer;
        }
        return tab.id !== Tab.IntegratedSupportHub;
    });
  };

  const visibleTabs = getVisibleTabs();

  return (
    <div className="flex flex-col h-screen bg-brand-bg">
      <header className="flex items-center justify-between p-4 bg-brand-surface shadow-md border-b border-brand-bg">
        <div className="flex items-center">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 transition-colors mr-4">
            <ArrowLeftIcon className="w-5 h-5 text-brand-subtle" />
          </button>
          <h1 className="text-xl font-bold text-brand-text">Knowledge Navigator</h1>
        </div>
        <div className="text-sm text-brand-subtle">
          Role: <span className="font-semibold text-brand-accent">{role}</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <nav className="w-64 bg-brand-surface p-4 border-r border-brand-bg">
          <ul className="space-y-2">
            {visibleTabs.map(({ id, icon }) => (
              <li key={id}>
                <button
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === id
                      ? 'bg-brand-accent/10 text-brand-accent'
                      : 'text-brand-subtle hover:bg-white/5 hover:text-brand-text'
                  }`}
                >
                  {icon}
                  {id}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="mb-6">
              <h2 className="text-2xl font-bold text-brand-text">{activeTabInfo.id}</h2>
              <p className="text-brand-subtle">{activeTabInfo.description}</p>
          </div>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;