"use client";

import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

export interface BarChartProps {
  data: Array<Record<string, any>>;
  xKey: string;
  yKeys: Array<{key: string; name: string; color: string}>;
  title?: string;
  description?: string;
  className?: string;
  height?: number;
}

export function BarChart({
  data,
  xKey,
  yKeys,
  title,
  description,
  className = "",
  height = 350,
}: BarChartProps) {
  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <RechartsBarChart
            data={data}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            {yKeys.map((yKey) => (
              <Bar 
                key={yKey.key}
                dataKey={yKey.key} 
                name={yKey.name} 
                fill={yKey.color} 
              />
            ))}
          </RechartsBarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
} 