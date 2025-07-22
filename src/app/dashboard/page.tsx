import { PlaceholderChart } from "~/components/placeholder-chart";

const charts = [];
export default function Dashboard() {
  return (
    <div className="flex max-sm:flex-col flex-wrap px-2 gap-5">
      {charts.length < 1 &&
        Array.from({ length: 5 }).map((_, index) => <PlaceholderChart key={index} />)}
    </div>
  );
}
