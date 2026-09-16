import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`rounded-xl border border-slate-800/80 bg-[#111827]/70 p-6 backdrop-blur-sm transition duration-200 hover:border-slate-700 ${className}`}>
      {children}
    </div>
  );
};