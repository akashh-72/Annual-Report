import React from 'react';

const variants = {
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
  gray: 'bg-gray-100 text-gray-800'
};

const Badge = ({ children, variant = 'gray' }) => (
  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${variants[variant]}`}>{children}</span>
);

export default Badge;


