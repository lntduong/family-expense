export default function AnalyticsLoading() {
	return (
		<div className='space-y-6 animate-pulse'>
			{/* Header */}
			<div className='flex flex-col gap-4'>
				<div className='h-9 w-64 bg-muted rounded-lg' />
				<div className='h-11 bg-muted rounded-xl' />
			</div>

			{/* Summary Cards */}
			<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
				{[1, 2, 3].map((i) => (
					<div key={i} className='glass-card macos-shadow p-6 space-y-3'>
						<div className='h-4 w-28 bg-muted rounded' />
						<div className='h-8 w-40 bg-muted rounded' />
						<div className='h-3 w-32 bg-muted rounded' />
					</div>
				))}
			</div>

			{/* Prediction Card */}
			<div className='glass-card macos-shadow p-6 space-y-4'>
				<div className='h-5 w-40 bg-muted rounded' />
				<div className='grid grid-cols-2 gap-4'>
					<div className='h-20 bg-muted rounded-xl' />
					<div className='h-20 bg-muted rounded-xl' />
				</div>
			</div>

			{/* Comparison Card */}
			<div className='glass-card macos-shadow p-6 space-y-4'>
				<div className='h-5 w-48 bg-muted rounded' />
				<div className='h-32 bg-muted rounded-xl' />
			</div>

			{/* Charts */}
			<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
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
		</div>
	);
}
