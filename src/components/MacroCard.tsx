import { CircularProgress } from './CircularProgress';

interface MacroCardProps {
  label: string;
  consumed: number;
  goal: number;
  color: string;
  icon: string;
}

export function MacroCard({ label, consumed, goal, color, icon }: MacroCardProps) {
  return (
    <div className="flex w-[124px] shrink-0 flex-col items-center justify-between rounded-[20px] bg-brand-primary p-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <div className="flex flex-col items-center text-center">
        <span className="text-[16px] font-bold text-text-primary truncate w-full">
          {Math.round(consumed)}/{goal}g
        </span>
        <span className="text-[12px] text-text-secondary truncate w-full mt-[2px]">
          {label}
        </span>
      </div>
      
      <div className="mt-[12px]">
        <CircularProgress
          value={consumed}
          max={goal}
          size={60}
          strokeWidth={5}
          color={color}
          trackColor="#F5F5F7"
        >
          <span className="text-[20px]">{icon}</span>
        </CircularProgress>
      </div>
    </div>
  );
}
