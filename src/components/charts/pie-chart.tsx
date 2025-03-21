"use client";

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

export interface PieChartProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  title?: string;
  description?: string;
  className?: string;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  dataKey?: string;
  nameKey?: string;
  legendPosition?: 'top' | 'right' | 'bottom' | 'left';
}

export function PieChart({
  data,
  title,
  description,
  className = "",
  height = 350,
  innerRadius = 0,
  outerRadius = 80,
  dataKey = "value",
  nameKey = "name",
  legendPosition = "bottom",
}: PieChartProps) {
  // Map legendPosition to valid vertical alignment type
  const getVerticalAlign = (position: 'top' | 'right' | 'bottom' | 'left') => {
    if (position === 'top') return 'top';
    if (position === 'bottom') return 'bottom';
    return 'middle'; // For 'left' and 'right'
  };
  
  // Map legendPosition to valid horizontal alignment
  const getHorizontalAlign = (position: 'top' | 'right' | 'bottom' | 'left') => {
    if (position === 'left') return 'left';
    if (position === 'right') return 'right';
    return 'center'; // For 'top' and 'bottom'
  };

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
          <RechartsPieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              fill="#8884d8"
              dataKey={dataKey}
              nameKey={nameKey}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value}`, 'Value']} />
            <Legend 
              layout={legendPosition === 'left' || legendPosition === 'right' ? 'vertical' : 'horizontal'} 
              align={getHorizontalAlign(legendPosition)} 
              verticalAlign={getVerticalAlign(legendPosition)}
            />
          </RechartsPieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
} 