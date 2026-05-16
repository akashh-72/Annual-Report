import React from 'react';

const EmptyState = ({ icon: Icon, title = 'Nothing here yet', description = 'Try adjusting your filters or add new data.' }) => (
  <div className="text-center py-12">
    {Icon ? <Icon className="mx-auto h-12 w-12 text-gray-400" /> : <div className="mx-auto h-12 w-12 rounded-full bg-gray-200" />}
    <h3 className="mt-3 text-sm font-semibold text-gray-900">{title}</h3>
    <p className="mt-1 text-sm text-gray-500">{description}</p>
  </div>
);

export default EmptyState;


