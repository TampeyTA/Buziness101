import ReportGenerator from "@/components/ReportsGenerator";
import { title} from "@/components/primitives";

export default function Reports() {
  return (
    <div>
      <h1 className={title()}>Reports Generator</h1>
      <div className ="mt-2">
      <ReportGenerator />
      </div>
    </div>
  );
}