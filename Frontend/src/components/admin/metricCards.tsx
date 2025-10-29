import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

type MetricCardsProps = {
  title: string;
  value: string;
  change: string;
  direction: "up" | "down";
};

const MetricCards = ({ title, value, change, direction }: MetricCardsProps) => {
    const Icon = direction === "up" ? ArrowUpRight : ArrowDownRight;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <div className="text-2xl font-bold">{value}</div>
        <div className={`flex items-center text-sm ${direction === "up" ? "text-green-600" : "text-red-600"}`}>
          <Icon className="mr-1 h-4 w-4" />
          {change}
        </div>
      </CardContent>
    </Card>
  );
}

export default MetricCards;