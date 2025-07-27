
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card = ({ children, className = '' }: CardProps) => {
  return (
    <div className={`bg-brand-surface p-6 rounded-xl border border-gray-200 shadow-sm ${className}`}>
      {children}
    </div>
  );
};

export default Card;
