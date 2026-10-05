import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export default function SortableHeader({ label, field, currentSort, currentOrder, onSort }) {
  const isActive = currentSort === field;

  return (
    <th
      onClick={() => onSort(field)}
      className="px-5 py-3.5 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors select-none group"
    >
      <div className="flex items-center gap-1.5">
        <span className={isActive ? 'text-indigo-600 dark:text-indigo-400' : ''}>{label}</span>
        <span className="text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {isActive ? (
            currentOrder === 'asc' ? (
              <ArrowUp className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 stroke-[2.5]" />
            ) : (
              <ArrowDown className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 stroke-[2.5]" />
            )
          ) : (
            <ArrowUpDown className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100" />
          )}
        </span>
      </div>
    </th>
  );
}
