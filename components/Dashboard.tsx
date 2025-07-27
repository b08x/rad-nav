
import React, { useState } from 'react';
import { Role, Tab } from '../types';
import SystemArchitecture from './SystemArchitecture';
import SupportCenter from './SupportCenter';
import KnowledgeEngine from './KnowledgeEngine';
import DatasetGenerator from './DatasetGenerator';
import { ArrowLeftIcon, BrainCircuitIcon, LifeBuoyIcon, MessageSquareIcon, DatabaseIcon } from './common/Icons';

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
    }
};

const Dashboard = ({ role, onBack }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.SystemArchitecture);

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
      default:
        return <SystemArchitecture />;
    }
  };
  
  const activeTabInfo = TABS_INFO[activeTab];

  const visibleTabs = Object.values(TABS_INFO).filter(tab => {
    if (tab.id === Tab.DatasetGenerator) {
      return role === Role.LMTrainer;
    }
    return true;
  });

  return (
    <div className="flex flex-col h-screen bg-brand-bg">
      <header className="flex items-center justify-between p-4 bg-brand-surface shadow-sm border-b border-gray-200">
        <div className="flex items-center">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 transition-colors mr-4">
            <ArrowLeftIcon className="w-5 h-5 text-brand-subtle" />
          </button>
          <h1 className="text-xl font-bold text-brand-text">Knowledge Navigator</h1>
        </div>
        <div className="text-sm text-brand-subtle">
          Role: <span className="font-semibold text-info">{role}</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <nav className="w-64 bg-brand-surface p-4 border-r border-gray-200">
          <ul className="space-y-2">
            {visibleTabs.map(({ id, icon }) => (
              <li key={id}>
                <button
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === id
                      ? 'bg-blue-100 text-info'
                      : 'text-brand-subtle hover:bg-gray-100 hover:text-brand-text'
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
