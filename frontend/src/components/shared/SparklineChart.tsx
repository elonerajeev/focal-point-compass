import { SimpleSparkline } from "@/components/shared/SimpleCharts";

type SparklineChartProps = {
  data: number[];
  stroke?: string;
  fill?: string;
  accentFill?: string;
  className?: string;
};

export default function SparklineChart({
  data,
  stroke = "hsl(var(--primary))",
  fill = "hsl(var(--primary) / 0.18)",
  accentFill = "hsl(var(--accent) / 0.12)",
  className,
}: SparklineChartProps) {
  return <SimpleSparkline data={data} stroke={stroke} fill={fill} accentFill={accentFill} className={className} />;
}
