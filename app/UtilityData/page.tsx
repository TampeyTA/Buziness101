import { title } from "@/components/primitives";
import DailyUnitsUsage from '@/components/DailyUnitsUsage';

export default function ElectricityUsagePage() {
  return (
    <div className="ml-0">
      <h1 className={title()}>Utility Data</h1>
      <div className = "w-full max-w-7xl gap-8 mt-2">
           <DailyUnitsUsage />
      </div>
    </div>
  );
}
