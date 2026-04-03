// Skeleton components for Suspense fallbacks

export function ExpenseListSkeleton() {
	return (
		<div className='glass-card macos-shadow-md p-6 space-y-4 animate-pulse'>
			<div className='flex justify-between items-center'>
				<div className='h-5 w-32 bg-muted rounded' />
				<div className='h-10 w-48 bg-muted rounded-xl' />
			</div>
			{[1, 2, 3].map((i) => (
				<div key={i} className='space-y-3'>
					<div className='flex items-center justify-between py-2 border-b border-border/50'>
						<div className='flex items-center gap-3'>
							<div className='h-10 w-10 bg-muted rounded-xl' />
							<div className='space-y-1'>
								<div className='h-4 w-20 bg-muted rounded' />
								<div className='h-3 w-24 bg-muted rounded' />
							</div>
						</div>
						<div className='h-5 w-24 bg-muted rounded' />
					</div>
					{[1, 2].map((j) => (
						<div key={j} className='flex items-center gap-3 p-3 ml-2'>
							<div className='h-11 w-11 bg-muted rounded-xl' />
							<div className='flex-1 space-y-1'>
								<div className='h-4 w-32 bg-muted rounded' />
								<div className='h-3 w-24 bg-muted rounded' />
							</div>
							<div className='h-5 w-20 bg-muted rounded' />
						</div>
					))}
				</div>
			))}
		</div>
	);
}

export function MonthCalendarSkeleton() {
	return (
		<div className='h-11 bg-muted rounded-xl animate-pulse' />
	);
}

export function ChartsSkeleton() {
	return (
		<div className='grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse'>
			<div className='md:col-span-2 glass-card macos-shadow p-6'>
				<div className='h-5 w-48 bg-muted rounded mb-4' />
				<div className='h-64 bg-muted rounded-xl' />
			</div>
			<div className='glass-card macos-shadow p-6'>
				<div className='h-5 w-40 bg-muted rounded mb-4' />
				<div className='h-64 bg-muted rounded-xl' />
			</div>
			<div className='glass-card macos-shadow p-6'>
				<div className='h-5 w-36 bg-muted rounded mb-4' />
				<div className='h-64 bg-muted rounded-xl' />
			</div>
		</div>
	);
}

export function MonthComparisonSkeleton() {
	return (
		<div className='glass-card macos-shadow p-6 space-y-4 animate-pulse'>
			<div className='h-5 w-48 bg-muted rounded' />
			<div className='h-32 bg-muted rounded-xl' />
		</div>
	);
}

export function SpendingPredictionSkeleton() {
	return (
		<div className='glass-card macos-shadow p-6 space-y-4 animate-pulse'>
			<div className='h-5 w-40 bg-muted rounded' />
			<div className='grid grid-cols-2 gap-4'>
				<div className='h-20 bg-muted rounded-xl' />
				<div className='h-20 bg-muted rounded-xl' />
			</div>
		</div>
	);
}
