'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Rule503020Props {
  spent: {
    NEEDS: number;
    WANTS: number;
    SAVINGS: number;
  };
  budgetLimit: number;
}

export function Rule503020Card({ spent, budgetLimit }: Rule503020Props) {
  const totalLimit = budgetLimit || (spent.NEEDS + spent.WANTS + spent.SAVINGS) || 1; // Fallback to avoid div by zero
  
  // Rule Targets
  const targetNeeds = totalLimit * 0.5;
  const targetWants = totalLimit * 0.3;
  const targetSavings = totalLimit * 0.2;

  // Percentages relative to total budget
  const needsPct = (spent.NEEDS / totalLimit) * 100;
  const wantsPct = (spent.WANTS / totalLimit) * 100;
  const savingsPct = (spent.SAVINGS / totalLimit) * 100;

  return (
    <Card className="glass-card macos-shadow hover:macos-shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-muted-foreground flex justify-between items-center">
          <span>Quy tắc 50/30/20</span>
          {budgetLimit === 0 && <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full">Chưa có ngân sách</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        
        {/* Needs */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs mb-1">
            <span className="font-semibold text-blue-500">Thiết yếu (50%)</span>
            <span className="text-muted-foreground">
              {spent.NEEDS.toLocaleString('vi-VN')} / {targetNeeds.toLocaleString('vi-VN')}
            </span>
          </div>
          <div className="h-2.5 w-full bg-blue-500/10 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${needsPct > 50 ? 'bg-red-500' : 'bg-blue-500'}`} 
              style={{ width: `${Math.min(100, needsPct)}%` }} 
            />
          </div>
        </div>

        {/* Wants */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs mb-1">
            <span className="font-semibold text-amber-500">Tận hưởng (30%)</span>
            <span className="text-muted-foreground">
              {spent.WANTS.toLocaleString('vi-VN')} / {targetWants.toLocaleString('vi-VN')}
            </span>
          </div>
          <div className="h-2.5 w-full bg-amber-500/10 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${wantsPct > 30 ? 'bg-red-500' : 'bg-amber-500'}`} 
              style={{ width: `${Math.min(100, wantsPct)}%` }} 
            />
          </div>
        </div>

        {/* Savings */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs mb-1">
            <span className="font-semibold text-green-500">Tích lũy (20%)</span>
            <span className="text-muted-foreground">
              {spent.SAVINGS.toLocaleString('vi-VN')} / {targetSavings.toLocaleString('vi-VN')}
            </span>
          </div>
          <div className="h-2.5 w-full bg-green-500/10 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full bg-green-500" 
              style={{ width: `${Math.min(100, savingsPct)}%` }} 
            />
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
