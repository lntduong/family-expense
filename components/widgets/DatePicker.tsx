'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CalendarIcon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';

export function DatePicker({
	date,
	onDateChange,
}: {
	date: Date;
	onDateChange: (date: Date | undefined) => void;
}) {
	const [open, setOpen] = React.useState(false);

	const handleSelect = (newDate: Date | undefined) => {
		onDateChange(newDate);
		setOpen(false);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button
					type='button'
					className={cn(
						'flex h-11 w-full items-center justify-start gap-2 rounded-xl border-2 border-border bg-background/50 backdrop-blur-sm px-4 py-2 text-sm font-medium transition-all duration-200 hover:border-muted-foreground/30 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50',
						!date && 'text-muted-foreground',
					)}
				>
					<CalendarIcon className='h-4 w-4 shrink-0' />
					{date ? (
						<span className='font-normal'>{format(date, 'PPP', { locale: vi })}</span>
					) : (
						<span>Chọn ngày</span>
					)}
				</button>
			</PopoverTrigger>
			<PopoverContent className='w-auto p-0' align='start'>
				<Calendar
					mode='single'
					selected={date}
					onSelect={handleSelect}
					defaultMonth={date}
					initialFocus
				/>
			</PopoverContent>
		</Popover>
	);
}
