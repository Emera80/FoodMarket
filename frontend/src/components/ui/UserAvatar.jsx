import React from 'react';

export default function UserAvatar({ name, size = 'md', className = '' }) {
  const initial = name ? name[0].toUpperCase() : 'U';

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-20 h-20 text-3xl border-4 border-orange-100',
  };

  return (
    <div
      className={`rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-black ${sizeClasses[size] ?? sizeClasses.md} ${className}`}
    >
      {initial}
    </div>
  );
}
