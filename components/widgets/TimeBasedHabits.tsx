import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TimeBasedHabitsProps {
  expenses: {
    amount: any;
    date: Date;
  }[];
}

const DAYS_OF_WEEK = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

export function TimeBasedHabits({ expenses }: TimeBasedHabitsProps) {
  const { chartData, highestDay, highestPercent } = useMemo(() => {
    const totals = new Array(7).fill(0);
    let totalSpent = 0;

    expenses.forEach((exp) => {
      const dayIndex = new Date(exp.date).getDay();
      const amount = Number(exp.amount);
      totals[dayIndex] += amount;
      totalSpent += amount;
    });

    if (totalSpent === 0) {
      return { chartData: [], highestDay: null, highestPercent: 0 };
    }

    let maxIndex = 0;
    const data = totals.map((val, index) => {
      if (val > totals[maxIndex]) maxIndex = index;
      return {
        day: DAYS_OF_WEEK[index],
        amount: val,
        percent: (val / totalSpent) * 100,
      };
    });

    // Shift data so Monday is first (optional usually). Let's keep 0 as Sunday but visually shift it if needed?
    // Vietnamese standard often considers Monday as start.
    const shiftedData = [...data.slice(1), data[0]]; 
    
    // adjust maxIndex to the original day string
    const maxDayObj = data[maxIndex];

    return { 
      chartData: shiftedData, 
      highestDay: maxDayObj.day, 
      highestPercent: maxDayObj.percent.toFixed(1) 
    };
  }, [expenses]);

  return (
    <Card className='glass-card macos-shadow hover:macos-shadow-lg transition-shadow duration-300'>
      <CardHeader>
        <CardTitle className='text-sm font-semibold text-primary flex items-center gap-2'>
          <span>🧠</span> Tâm lý & Thói quen Tiêu tiền
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 && highestDay ? (
          <div className="space-y-6">
            <p className="text-sm font-medium leading-relaxed">
              Bạn có xu hướng quẹt thẻ nhiều nhất vào <strong className="text-primary">{highestDay}</strong>, 
              chiếm tới <strong className="text-destructive font-bold">{highestPercent}%</strong> tổng chi tiêu. 
              Hãy kiểm soát kỹ hơn vào ngày này nhé!
            </p>

            <div className="flex items-end justify-between gap-1 h-32 pt-4 border-b border-border/50 pb-2">
              {chartData.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-2 w-full group">
                  {/* Tooltip equivalent using group-hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-foreground text-background px-1.5 py-0.5 rounded-md absolute -translate-y-8 z-10 pointer-events-none whitespace-nowrap">
                    {d.amount.toLocaleString('vi-VN')} ₫
                  </div>
                  <div className="w-full flex justify-center h-full items-end relative">
                    <div 
                      className={`w-4/5 rounded-t-sm transition-all duration-500 ${d.day === highestDay ? 'bg-destructive/80' : 'bg-primary/30'}`}
                      style={{ height: `${Math.max(5, d.percent)}%` }} // Minimum height 5% for visibility
                    />
                  </div>
                  <span className={`text-[10px] font-medium ${d.day === highestDay ? 'text-destructive font-bold' : 'text-muted-foreground'}`}>
                    {d.day === 'Chủ Nhật' ? 'CN' : d.day.replace('Thứ ', 'T')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Chưa thu thập đủ dữ liệu thói quen
          </p>
        )}
      </CardContent>
    </Card>
  );
}
