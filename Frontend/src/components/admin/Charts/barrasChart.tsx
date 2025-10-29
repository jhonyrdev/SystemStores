import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type BarrasChartProps = {
  title: string;
  data: { producto: string; cantidad: number }[];
};

const BarrasChart = ({ title, data }: BarrasChartProps) => {
    return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="producto" type="category" />
            <Tooltip />
            <Bar dataKey="cantidad" fill="#60a5fa" barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
    );
}
 
export default BarrasChart;