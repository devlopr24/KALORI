import { Header } from '@/components/Header';

export function ScanResult() {
  return (
    <div className="flex h-full flex-col">
      <Header title="Nutrition Result" showBack />
      
      <div className="flex flex-1 flex-col items-center justify-center p-[24px] text-center">
        <h2 className="text-[24px] font-bold text-text-primary mb-2">Nutrition Result</h2>
        <p className="text-[15px] text-text-secondary">Coming Soon</p>
      </div>
    </div>
  );
}
