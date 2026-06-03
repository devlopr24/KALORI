import { cn } from '@/lib/utils';

export function DateSelector() {
  const today = new Date();
  const currentDay = today.getDay(); // 0-6

  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - currentDay + i);
    
    const isToday = i === currentDay;
    const isPast = i < currentDay;
    
    return {
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }).substring(0, 3),
      dateNumber: d.getDate(),
      isToday,
      isPast,
      // Mock past status for design mapping
      status: i === currentDay - 1 ? 'met' : (i === currentDay - 2 ? 'over' : (isPast ? 'untracked' : 'future'))
    };
  });

  return (
    <div className="flex h-[80px] w-full items-center justify-between bg-brand-primary px-[16px] py-[12px]">
      {days.map((day, idx) => (
        <div key={idx} className="flex cursor-pointer flex-col items-center gap-[4px] transition-transform active:scale-95">
          <span className="text-[12px] font-medium text-text-secondary">{day.dayName}</span>
          
          <div className={cn(
            "flex h-[36px] w-[36px] items-center justify-center rounded-full text-[16px] font-semibold transition-colors",
            day.isToday && "border-[2px] border-text-primary bg-brand-secondary text-text-primary",
            day.isPast && day.status === 'met' && "bg-success-green text-white",
            day.isPast && day.status === 'over' && "bg-protein-red text-white",
            day.isPast && day.status === 'untracked' && "border border-dashed border-text-tertiary text-text-secondary",
            !day.isPast && !day.isToday && "border border-dashed border-text-tertiary text-text-tertiary"
          )}>
            {day.dateNumber}
          </div>
          
          {day.isToday && (
            <div className="h-[4px] w-[4px] rounded-full bg-text-primary mt-[2px]"></div>
          )}
        </div>
      ))}
    </div>
  );
}
