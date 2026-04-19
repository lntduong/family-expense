import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TopTransactionsProps {
  expenses: {
    id: string;
    amount: any;
    date: Date;
    note: string | null;
    categoryRef: {
      name: string;
      icon: string;
      color: string;
    } | null;
    category: string | null;
  }[];
}

export function TopTransactions({ expenses }: TopTransactionsProps) {
  // Sort and take top 5
  const topExps = [...expenses]
    .sort((a, b) => Number(b.amount) - Number(a.amount))
    .slice(0, 5);

  return (
    <Card className='glass-card macos-shadow hover:macos-shadow-lg transition-shadow duration-300'>
      <CardHeader>
        <CardTitle className='text-sm font-semibold text-destructive flex items-center gap-2'>
          <span>🚨</span> Kẻ thù Ngân sách (Top Chi tiêu)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {topExps.length > 0 ? (
          <div className="space-y-4">
            {topExps.map((exp, index) => {
              const name = exp.categoryRef?.name || exp.category || 'Khác';
              const icon = exp.categoryRef?.icon || '💸';
              
              return (
                <div key={exp.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted/50 text-xl shadow-inner">
                      {icon}
                    </div>
                    <div>
                      <p className="font-semibold text-sm line-clamp-1">{name}</p>
                      <p className="text-[10px] text-muted-foreground line-clamp-1">
                        {exp.note || exp.date.toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-foreground">
                      -{Number(exp.amount).toLocaleString('vi-VN')} ₫
                    </p>
                    <p className="text-[10px] text-muted-foreground">Top {index + 1}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Tháng này chưa có khoản chi nào
          </p>
        )}
      </CardContent>
    </Card>
  );
}
