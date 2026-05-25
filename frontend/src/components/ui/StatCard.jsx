import React from 'react';

export default function StatCard({ title, val, icon, color, bg }) {
  return (
    <div className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm flex flex-col justify-center">
      <div className={`w-10 h-10 mb-3 flex items-center justify-center rounded-xl ${bg} ${color}`}>
        {icon}
      </div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</p>
      <h3 className="text-xl font-black text-gray-900 mt-1 truncate">{val}</h3>
    </div>
  );
}
