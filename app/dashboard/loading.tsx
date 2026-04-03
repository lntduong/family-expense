export default function DashboardLoading() {
	return (
		<div className='space-y-6 pb-20 animate-pulse'>
			{/* Quick Add Skeleton */}
			<div className='glass-card macos-shadow-md p-6'>
				<div className='h-5 w-40 bg-muted rounded-lg mb-4' />
				<div className='space-y-4'>
					<div className='h-11 bg-muted rounded-xl' />
					<div className='h-11 bg-muted rounded-xl' />
					<div className='h-11 bg-muted rounded-xl' />
					<div className='h-20 bg-muted rounded-xl' />
					<div className='h-11 bg-muted rounded-xl' />
				</div>
			</div>

			{/* Month Calendar Skeleton */}
			<div className='h-11 bg-muted rounded-xl' />

			{/* Stats Cards Skeleton */}
			<div className='grid grid-cols-2 gap-4'>
				<div className='glass-card macos-shadow p-4 space-y-3'>
					<div className='h-3 w-24 bg-muted rounded' />
					<div className='h-7 w-32 bg-muted rounded' />
				</div>
				<div className='glass-card macos-shadow p-4 space-y-3'>
					<div className='h-3 w-20 bg-muted rounded' />
					<div className='h-7 w-28 bg-muted rounded' />
					<div className='h-2 w-full bg-muted rounded-full' />
				</div>
			</div>

			{/* Expense List Skeleton */}
			<div className='glass-card macos-shadow-md p-6 space-y-4'>
				<div className='flex justify-between items-center'>
					<div className='h-5 w-32 bg-muted rounded' />
					<div className='h-10 w-48 bg-muted rounded-xl' />
				</div>
				
				{/* Expense Items */}
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
		</div>
	);
}
