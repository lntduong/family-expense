import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

interface SmartCutdownAlertProps {
  currentCategories: {
    category: string;
    icon: string;
    color: string;
    _sum: { amount: number };
  }[];
  prevCategories: {
    category: string;
    amount: number;
  }[];
}

export function SmartCutdownAlert({ currentCategories, prevCategories }: SmartCutdownAlertProps) {
  // Find the category with highest absolute increase
  let worstCategory: any = null;
  let maxIncrease = 0;
  let maxPercent = 0;

  currentCategories.forEach((curr) => {
    const prev = prevCategories.find(p => p.category === curr.category);
    const prevAmount = prev ? Number(prev.amount) : 0;
    const currAmount = Number(curr._sum.amount);

    // Only flag it if current is > 500k to avoid micro alerts
    if (currAmount > prevAmount && currAmount > 500000) {
      const increase = currAmount - prevAmount;
      const percent = prevAmount > 0 ? (increase / prevAmount) * 100 : 100;

      // Rule: Has to be at least 20% increase
      if (percent >= 20 && increase > maxIncrease) {
        maxIncrease = increase;
        maxPercent = percent;
        worstCategory = { ...curr, prevAmount, currAmount };
      }
    }
  });

  if (!worstCategory) {
    return null; // Don't show anything if healthy
  }

  return (
    <Alert variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20 macos-shadow-sm transition-all animate-in fade-in slide-in-from-top-2">
      <ExclamationTriangleIcon className="h-5 w-5" />
      <AlertTitle className="font-bold flex items-center gap-2">
        <span>Cảnh báo Ngân sách: {worstCategory.icon} {worstCategory.category}</span>
      </AlertTitle>
      <AlertDescription className="mt-2 text-sm leading-relaxed text-destructive/90">
        Bạn đã chi <strong>{worstCategory.currAmount.toLocaleString('vi-VN')} ₫</strong> cho mảng này, 
        cao hơn {maxPercent > 100 ? 'rất nhiều' : `khoảng ${Math.round(maxPercent)}%`} so với tháng trước 
        (Tăng thêm <strong>{maxIncrease.toLocaleString('vi-VN')} ₫</strong>). 
        <br />
        <span className="opacity-80 italic text-xs block mt-1">
          *Gợi ý: Cố gắng hạn chế mảng này nếu bạn đang muốn dồn tiền cho mục Tiết kiệm tháng này! (Bỏ qua nếu đây là khoản chi bắt buộc/phát sinh hợp lý).
        </span>
      </AlertDescription>
    </Alert>
  );
}
