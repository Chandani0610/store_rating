import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export default function SortableHeader({ label, field, currentSort, currentOrder, onSort }) {
  const isActive = currentSort === field;

  return (
    <th
      onClick={() => onSort(field)}
      className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100/80 transition-colors select-none group"
    >
      <div className="flex items-center gap-1.5">
        <span>{label}</span>
        <span className="text-slate-400 group-hover:text-indigo-600 transition-colors">
          {isActive ? (
            currentOrder === 'asc' ? (
              <ArrowUp className="w-3.5 h-3.5 text-indigo-600 stroke-[2.5]" />
            ) : (
              <ArrowDown className="w-3.5 h-3.5 text-indigo-600 stroke-[2.5]" />
            )
          ) : (
            <ArrowUpDown className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100" />
          )}
        </span>
      </div>
    </th>
  );
}
