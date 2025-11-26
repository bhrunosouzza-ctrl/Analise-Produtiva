import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  sub: string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'red' | 'orange' | 'purple' | 'slate';
}

const colorStyles = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-500' },
  green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-500' },
  red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-500' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-500' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-500' },
  slate: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-500' },
};

export const KpiCard: React.FC<KpiCardProps> = ({ title, value, sub, icon: Icon, color }) => {
  const styles = colorStyles[color];
  
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-5 border-l-4 ${styles.border} transition-all hover:shadow-md`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
          <p className="text-xs text-gray-500 mt-1">{sub}</p>
        </div>
        <div className={`p-2 rounded-lg ${styles.bg} ${styles.text}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};