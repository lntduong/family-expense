export default function SettingsLoading() {
	return (
		<div className='space-y-6 animate-pulse'>
			{/* Header */}
			<div className='h-9 w-32 bg-muted rounded-lg' />

			{/* Budget Section */}
			<div className='glass-card macos-shadow p-6 space-y-4'>
				<div className='h-6 w-40 bg-muted rounded' />
				<div className='grid grid-cols-2 gap-4'>
					<div className='h-11 bg-muted rounded-xl' />
					<div className='h-11 bg-muted rounded-xl' />
				</div>
				<div className='h-11 bg-muted rounded-xl' />
				<div className='h-11 w-32 bg-muted rounded-xl' />
			</div>

			{/* Categories Section */}
			<div className='glass-card macos-shadow p-6 space-y-4'>
				<div className='flex justify-between items-center'>
					<div className='h-6 w-36 bg-muted rounded' />
					<div className='h-10 w-32 bg-muted rounded-xl' />
				</div>
				<div className='space-y-3'>
					{[1, 2, 3, 4, 5].map((i) => (
						<div key={i} className='flex items-center justify-between p-3 border border-border/50 rounded-xl'>
							<div className='flex items-center gap-3'>
								<div className='h-10 w-10 bg-muted rounded-xl' />
								<div className='h-5 w-24 bg-muted rounded' />
							</div>
							<div className='flex gap-2'>
								<div className='h-8 w-8 bg-muted rounded-lg' />
								<div className='h-8 w-8 bg-muted rounded-lg' />
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Export Section */}
			<div className='glass-card macos-shadow p-6 space-y-4'>
				<div className='h-6 w-32 bg-muted rounded' />
				<div className='h-4 w-64 bg-muted rounded' />
				<div className='h-11 w-40 bg-muted rounded-xl' />
			</div>

			{/* Logout Button */}
			<div className='h-11 bg-muted rounded-xl' />
		</div>
	);
}
