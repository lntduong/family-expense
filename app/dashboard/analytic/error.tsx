'use client';

import { useEffect } from 'react';

export default function AnalyticError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Analytic Page Error]', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 p-6 text-center">
      <div className="text-4xl">📊</div>
      <h2 className="text-xl font-bold">Không thể tải trang Phân tích</h2>
      <p className="text-sm text-muted-foreground max-w-md">
        {error.message || 'Đã xảy ra lỗi khi hiển thị dữ liệu phân tích.'}
      </p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
      >
        Thử lại
      </button>
    </div>
  );
}
