'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SpendingHeatmapProps {
  data: { date: string | Date; amount: any }[];
}

export function SpendingHeatmap({ data }: SpendingHeatmapProps) {
  const { grid, maxAmount } = useMemo(() => {
    // We want a 52x7 grid ending today (or ending end of this year if we want to align to generic calendar)
    // For a classic Github heatmap, we map the last 365 days.
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Start date is 364 days ago
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 364);
    
    // Adjust start date to the Sunday before it to fully fill the first column
    const startDayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - startDayOfWeek);

    const dataMap = new Map<string, number>();
    let localMax = 0;
    
    data.forEach(d => {
      const dayStr = new Date(d.date).toISOString().split('T')[0];
      const amount = Number(d.amount);
      dataMap.set(dayStr, (dataMap.get(dayStr) || 0) + amount);
      if (dataMap.get(dayStr)! > localMax) {
        localMax = dataMap.get(dayStr)!;
      }
    });

    const weeks = [];
    let currentWeek = [];
    let d = new Date(startDate);
    
    // Loop until we pass today AND it's a Saturday (end of week)
    while (d <= today || d.getDay() !== 0) {
      if (d > today && d.getDay() === 0) break; // Break if we start a new week after today
      
      const dateStr = d.toISOString().split('T')[0];
      const amount = dataMap.get(dateStr) || 0;
      
      currentWeek.push({
        date: new Date(d),
        dateStr,
        amount,
        isFuture: d > today
      });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      d.setDate(d.getDate() + 1);
    }

    return { grid: weeks, maxAmount: localMax };
  }, [data]);

  function getColor(amount: number) {
    if (amount === 0) return 'bg-muted/50';
    if (maxAmount === 0) return 'bg-green-200 dark:bg-green-900';
    
    const ratio = amount / maxAmount;
    if (ratio < 0.2) return 'bg-[#9be9a8] dark:bg-[#0e4429]'; // GitHub lightest green
    if (ratio < 0.5) return 'bg-[#40c463] dark:bg-[#006d32]';
    if (ratio < 0.8) return 'bg-[#30a14e] dark:bg-[#26a641]';
    return 'bg-[#216e39] dark:bg-[#39d353]'; // GitHub darkest green
  }

  return (
    <Card className="glass-card macos-shadow hover:macos-shadow-lg transition-shadow duration-300 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-muted-foreground">Mật độ chi tiêu</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto pb-4 custom-scrollbar">
          <div className="flex gap-1 min-w-max">
            {grid.map((week, wIndex) => (
              <div key={wIndex} className="flex flex-col gap-1">
                {week.map((day, dIndex) => (
                  <TooltipProvider key={dIndex}>
                    <Tooltip delayDuration={50}>
                      <TooltipTrigger asChild>
                        <div 
                          className={`w-3 h-3 md:w-3.5 md:h-3.5 rounded-sm ${day.isFuture ? 'bg-transparent' : getColor(day.amount)} transition-colors duration-200 hover:ring-1 hover:ring-foreground/50`}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs font-medium">
                        {day.isFuture ? 'Chưa tới' : `${day.date.toLocaleDateString('vi-VN')}: ${day.amount.toLocaleString('vi-VN')} ₫`}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 text-[10px] text-muted-foreground mt-1">
          <span>Ít</span>
          <div className="w-2.5 h-2.5 bg-muted/50 rounded-sm"></div>
          <div className="w-2.5 h-2.5 bg-[#9be9a8] dark:bg-[#0e4429] rounded-sm"></div>
          <div className="w-2.5 h-2.5 bg-[#40c463] dark:bg-[#006d32] rounded-sm"></div>
          <div className="w-2.5 h-2.5 bg-[#30a14e] dark:bg-[#26a641] rounded-sm"></div>
          <div className="w-2.5 h-2.5 bg-[#216e39] dark:bg-[#39d353] rounded-sm"></div>
          <span>Nhiều</span>
        </div>
      </CardContent>
    </Card>
  );
}
