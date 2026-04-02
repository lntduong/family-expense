import { Progress } from '@/components/ui/progress';

export function BudgetProgress({
	current,
	limit,
}: {
	current: number;
	limit: number;
}) {
	if (!limit)
		return <p className='text-sm text-muted-foreground'>Chưa thiết lập</p>;
	const percent = (current / limit) * 100;
	return (
		<div className='space-y-1'>
			<div className='flex items-center justify-between text-sm'>
				<span>Đã dùng</span>
				<span className='font-medium'>{percent.toFixed(0)}%</span>
			</div>
			<Progress value={percent} />
		</div>
	);
}
