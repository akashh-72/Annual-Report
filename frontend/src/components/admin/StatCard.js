import React from 'react';

const colorGradients = {
  blue: 'from-blue-500 to-cyan-500',
  green: 'from-emerald-500 to-green-500',
  yellow: 'from-amber-500 to-yellow-500',
  red: 'from-rose-500 to-red-500',
  indigo: 'from-indigo-500 to-blue-600'
};

const TrendPill = ({ trend = 0 }) => {
  const isUp = trend >= 0;
  const color = isUp ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50';
  const sign = isUp ? '+' : '';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {sign}{trend}%
    </span>
  );
};

const StatCard = ({ title, value, icon: Icon, color = 'indigo', footer, trend }) => {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:scale-[1.02] transition-all duration-200">
      <div className={`absolute right-0 top-0 w-28 h-28 bg-gradient-to-br ${colorGradients[color]} opacity-5 blur-2xl pointer-events-none group-hover:opacity-10 transition-opacity`} />
      <div className="flex items-center justify-between relative">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">{title}</p>
          <div className="flex items-baseline space-x-3">
            <p className="text-4xl font-bold text-gray-900">{value}</p>
            {typeof trend === 'number' && <TrendPill trend={trend} />}
          </div>
        </div>
        <div className={`p-3.5 rounded-xl bg-gradient-to-br ${colorGradients[color]} shadow-md group-hover:shadow-lg transition-shadow`}>
          {Icon && <Icon className="h-6 w-6 text-white" />}
        </div>
      </div>
      {footer && <div className="mt-4 text-xs font-medium text-gray-500 uppercase tracking-wide">{footer}</div>}
    </div>
  );
};

export default StatCard;


