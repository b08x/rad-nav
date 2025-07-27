
import React from 'react';
import { Role } from '../types';
import { BrainCircuitIcon, StethoscopeIcon, UserCogIcon, UsersIcon } from './common/Icons';

interface RoleSelectorProps {
  onSelectRole: (role: Role) => void;
}

const roles = [
  { role: Role.SupportEngineer, icon: <UserCogIcon className="w-12 h-12 mb-4 text-info" />, description: "Access troubleshooting guides, escalation matrix, and performance dashboards." },
  { role: Role.SystemArchitect, icon: <BrainCircuitIcon className="w-12 h-12 mb-4 text-purple-500" />, description: "Explore system diagrams, data flows, and integration point details." },
  { role: Role.ClinicalStaff, icon: <StethoscopeIcon className="w-12 h-12 mb-4 text-critical" />, description: "View system status, communication templates, and common issue workarounds." },
  { role: Role.LMTrainer, icon: <UsersIcon className="w-12 h-12 mb-4 text-normal" />, description: "Use the knowledge engine and generate structured datasets for model training." },
];

const RoleSelector = ({ onSelectRole }: RoleSelectorProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-brand-text">Healthcare IT Knowledge Navigator</h1>
        <p className="mt-2 text-lg text-brand-subtle">Select your role to begin</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-8">
        {roles.map(({ role, icon, description }) => (
          <button
            key={role}
            onClick={() => onSelectRole(role)}
            className="flex flex-col items-center p-8 text-center bg-brand-surface rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-in-out border border-gray-200 group"
          >
            {icon}
            <h2 className="text-xl font-semibold text-brand-text mb-2">{role}</h2>
            <p className="text-brand-subtle text-sm">{description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RoleSelector;
