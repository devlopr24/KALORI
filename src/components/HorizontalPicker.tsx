import React, { useRef, useEffect, useState, UIEvent } from 'react';

interface HorizontalPickerProps {
  min: number;
  max: number;
  value: number;
  onChange: (val: number) => void;
  unit?: string;
  step?: number;
  formatDisplay?: (val: number) => string;
}

export function HorizontalPicker({ 
  min, 
  max, 
  value, 
  onChange, 
  unit, 
  step = 1,
  formatDisplay 
}: HorizontalPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [localValue, setLocalValue] = useState(value);
  const itemWidth = 80;
  
  const items = [];
  for (let i = min; i <= max; i += step) {
    items.push(parseFloat(i.toFixed(1)));
  }

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const scrollLeft = containerRef.current.scrollLeft;
    const centerIndex = Math.round(scrollLeft / itemWidth);
    const newValue = items[centerIndex];
    if (newValue !== undefined && newValue !== localValue) {
      setLocalValue(newValue);
    }
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (newValue !== undefined) {
         onChange(newValue);
      }
    }, 150);
  };

  useEffect(() => {
    if (containerRef.current) {
      const index = items.indexOf(value);
      if (index !== -1) {
        containerRef.current.scrollLeft = index * itemWidth;
      }
    }
  }, []);

  return (
    <div className="flex w-full max-w-[300px] flex-col items-center">
      <div className="mb-8 flex flex-col items-center">
        <span className="text-[80px] font-extrabold leading-none text-text-primary">
          {formatDisplay ? formatDisplay(localValue) : localValue}
        </span>
        {unit && <span className="text-[16px] text-text-secondary">{unit}</span>}
      </div>

      <div className="relative flex h-[60px] w-full items-center justify-center overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 h-[50px] w-1 -translate-x-1/2 rounded-full bg-text-primary opacity-20"></div>
        
        <div 
          ref={containerRef}
          onScroll={handleScroll}
          className="no-scrollbar flex w-full snap-x snap-mandatory scroll-smooth overflow-x-auto"
          style={{ paddingLeft: `calc(50% - ${itemWidth / 2}px)`, paddingRight: `calc(50% - ${itemWidth / 2}px)` }}
        >
          {items.map((item) => {
            const isSelected = item === localValue;
            
            return (
              <div 
                key={item} 
                className="flex h-[60px] w-[80px] shrink-0 snap-center items-center justify-center transition-all duration-200"
                onClick={() => {
                  if (containerRef.current) {
                    const index = items.indexOf(item);
                    containerRef.current.scrollTo({ left: index * itemWidth, behavior: 'smooth' });
                    setLocalValue(item);
                    onChange(item);
                  }
                }}
              >
                <span className={`transition-all duration-200 ${isSelected ? 'text-[24px] font-bold text-text-primary' : 'text-[18px] font-medium text-text-tertiary'}`}>
                  {formatDisplay ? formatDisplay(item) : item}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
