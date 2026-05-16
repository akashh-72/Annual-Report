import React from 'react';

const QuickActionCard = ({ icon: Icon, title, description, onClick, gradient = 'from-indigo-600 to-blue-600' }) => (
  <button
    onClick={onClick}
    className="relative overflow-hidden group w-full text-left rounded-2xl p-5 bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="flex items-start space-x-4 relative">
      <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-md group-hover:shadow-lg transition-shadow`}> 
        {Icon && <Icon className="h-5 w-5 text-white" />}
      </div>
      <div>
        <p className="font-semibold text-gray-900 text-base mb-1">{title}</p>
        <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
      </div>
    </div>
  </button>
);

export default QuickActionCard;
