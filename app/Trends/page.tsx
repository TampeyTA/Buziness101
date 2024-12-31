import { title } from "@/components/primitives";
import TrendsAndInsights from "@/components/TrendsAndInsights";

export default function TrendsPage() {
  return (
    <div>
      <h1 className={title()}>Trends And Insights</h1>
      <TrendsAndInsights />
    </div>
  );
}
