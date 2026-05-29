import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from "recharts";

interface HealthScoreCardProps {
  score: number;
  trend?: number;
}

export function HealthScoreCard({ score, trend }: HealthScoreCardProps) {
  // Determine color based on score
  let color = "var(--success)"; // Emerald
  if (score < 50) color = "var(--critical)"; // Red
  else if (score < 80) color = "var(--warning)"; // Amber

  const data = [{ name: "Health", value: score, fill: color }];

  return (
    <Card className="flex flex-col justify-between h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Project Health</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center relative">
        <div className="h-32 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart 
              cx="50%" 
              cy="50%" 
              innerRadius="75%" 
              outerRadius="100%" 
              barSize={10} 
              data={data}
              startAngle={90}
              endAngle={-270}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              <RadialBar
                background={{ fill: "hsl(var(--muted))" }}
                dataKey="value"
                cornerRadius={10}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold">{score}</span>
          </div>
        </div>
        
        {trend !== undefined && (
          <div className="mt-2 text-xs font-medium">
            Trend:{" "}
            <span className={trend >= 0 ? "text-emerald-500" : "text-red-500"}>
              {trend > 0 ? "+" : ""}{trend} pts
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
