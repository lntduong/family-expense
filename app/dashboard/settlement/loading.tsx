export default function SettlementLoading() {
	return (
		<div className='space-y-6 animate-pulse'>
			{/* Header */}
			<div className='h-9 w-48 bg-muted rounded-lg' />

			{/* Month Selector */}
			<div className='h-11 bg-muted rounded-xl' />

			{/* Summary Card */}
			<div className='glass-card macos-shadow p-6 space-y-4'>
				<div className='h-6 w-40 bg-muted rounded' />
				<div className='grid grid-cols-2 gap-4'>
					<div className='space-y-2'>
						<div className='h-4 w-24 bg-muted rounded' />
						<div className='h-8 w-36 bg-muted rounded' />
					</div>
					<div className='space-y-2'>
						<div className='h-4 w-28 bg-muted rounded' />
						<div className='h-8 w-32 bg-muted rounded' />
					</div>
				</div>
			</div>

			{/* Settlement Details */}
			<div className='glass-card macos-shadow p-6 space-y-4'>
				<div className='h-6 w-36 bg-muted rounded' />
				<div className='space-y-3'>
					{[1, 2, 3].map((i) => (
						<div key={i} className='flex items-center justify-between p-4 border border-border/50 rounded-xl'>
							<div className='flex items-center gap-3'>
								<div className='h-12 w-12 bg-muted rounded-full' />
								<div className='space-y-1'>
									<div className='h-5 w-28 bg-muted rounded' />
									<div className='h-4 w-20 bg-muted rounded' />
								</div>
							</div>
							<div className='h-6 w-24 bg-muted rounded' />
						</div>
					))}
				</div>
			</div>

			{/* QR Code Section */}
			<div className='glass-card macos-shadow p-6 space-y-4'>
				<div className='h-6 w-32 bg-muted rounded' />
				<div className='flex justify-center'>
					<div className='h-48 w-48 bg-muted rounded-xl' />
				</div>
				<div className='h-11 bg-muted rounded-xl' />
			</div>
		</div>
	);
}
