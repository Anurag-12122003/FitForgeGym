import React from 'react';
import { Card } from '../../../components/ui/Card';
import type { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description }) => {
  return (
    <Card className="hover:border-emerald-500/40 group">
      <div className="mb-4 inline-flex rounded-lg bg-emerald-500/10 p-3 text-emerald-400 group-hover:bg-emerald-500/20 transition">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold text-white group-hover:text-emerald-300 transition">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">
        {description}
      </p>
    </Card>
  );
};