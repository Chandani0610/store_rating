import React, { useState } from 'react';
import { Star } from 'lucide-react';

export default function StarRating({
  value = 0,
  onChange = null,
  readOnly = false,
  size = 'md',
  showText = false,
}) {
  const [hoverValue, setHoverValue] = useState(0);

  const starSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
    xl: 'w-9 h-9',
  };

  const currentSize = starSizes[size] || starSizes.md;
  const displayRating = hoverValue || value || 0;

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const isFilled = displayRating >= starIndex;
          const isHalf = !isFilled && displayRating >= starIndex - 0.5;

          return (
            <button
              type="button"
              key={starIndex}
              disabled={readOnly}
              onClick={() => onChange && onChange(starIndex)}
              onMouseEnter={() => !readOnly && setHoverValue(starIndex)}
              onMouseLeave={() => !readOnly && setHoverValue(0)}
              className={`transition-transform duration-150 ${
                readOnly
                  ? 'cursor-default'
                  : 'cursor-pointer hover:scale-115 active:scale-95 focus:outline-none'
              }`}
              title={readOnly ? `${value} Stars` : `Rate ${starIndex} Stars`}
            >
              <Star
                className={`${currentSize} ${
                  isFilled
                    ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                    : isHalf
                    ? 'fill-amber-200 text-amber-400'
                    : 'fill-slate-100 text-slate-300'
                }`}
              />
            </button>
          );
        })}
      </div>

      {showText && (
        <span className="text-sm font-semibold text-slate-700 ml-1">
          {value > 0 ? Number(value).toFixed(1) : 'No ratings'}
        </span>
      )}
    </div>
  );
}
