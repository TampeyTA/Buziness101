import { title } from "@/components/primitives";
import ProfitLossCalculator from "@/components/ProfitLossCalculator";

export default function CalculatorPage() {
  return (
    <div>
      <h1 className={title()}>Profit And Loss Calculator</h1>
      <div className = "mt-4">
      <ProfitLossCalculator />
      </div>
    </div>
  );
}
