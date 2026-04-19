import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TopTransaction {
  id: string;
  amount: number;
  date: string;
  note: string | null;
  categoryName: string;
  categoryIcon: string;
}

interface TopTransactionsProps {
  transactions: TopTransaction[];
}

export function TopTransactions({ transactions }: TopTransactionsProps) {
  return (
    <Card className='glass-card macos-shadow hover:macos-shadow-lg transition-shadow duration-300'>
      <CardHeader>
        <CardTitle className='text-sm font-semibold text-destructive flex items-center gap-2'>
          <span>🚨</span> Kẻ thù Ngân sách (Top Chi tiêu)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length > 0 ? (
          <div className="space-y-4">
            {transactions.map((exp, index) => (
              <div key={exp.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted/50 text-xl shadow-inner shrink-0">
                    {exp.categoryIcon}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm line-clamp-1">{exp.categoryName}</p>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">
                      {exp.note || exp.date}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <p className="font-bold text-sm text-foreground">
                    -{exp.amount.toLocaleString('vi-VN')} ₫
                  </p>
                  <p className="text-[10px] text-muted-foreground">Top {index + 1}</p>
                </div>
              </div>
            ))}
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
