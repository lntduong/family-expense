'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon } from '@radix-ui/react-icons';
import { Button } from '@/components/ui/button';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useState } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export function MonthCalendar({
	currentMonth,
	currentYear,
}: {
	currentMonth: number;
	currentYear: number;
}) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const [open, setOpen] = useState(false);

	const currentDate = new Date(currentYear, currentMonth - 1, 1);

	function handleMonthSelect(date: Date | undefined) {
		if (!date) return;
		const params = new URLSearchParams(searchParams.toString());
		params.set('year', date.getFullYear().toString());
		params.set('month', (date.getMonth() + 1).toString());
		router.push(`${pathname}?${params.toString()}`);
		setOpen(false);
	}

	function goPrev() {
		let m = currentMonth - 1;
		let y = currentYear;
		if (m < 1) {
			m = 12;
			y -= 1;
		}
		const params = new URLSearchParams(searchParams.toString());
		params.set('year', y.toString());
		params.set('month', m.toString());
		router.push(`${pathname}?${params.toString()}`);
	}

	function goNext() {
		let m = currentMonth + 1;
		let y = currentYear;
		if (m > 12) {
			m = 1;
			y += 1;
		}
		const params = new URLSearchParams(searchParams.toString());
		params.set('year', y.toString());
		params.set('month', m.toString());
		router.push(`${pathname}?${params.toString()}`);
	}

	return (
		<div className='flex items-center justify-between gap-2 glass-card macos-shadow p-1.5 rounded-xl w-full'>
			<Button 
				variant='ghost' 
				size='icon-sm' 
				className='h-8 w-8' 
				onClick={goPrev}
				type='button'
			>
				<ChevronLeftIcon className='h-4 w-4' />
			</Button>
			
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<button
						type='button'
						className='flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-muted transition-colors duration-200'
					>
						<CalendarIcon className='h-4 w-4' />
						<span>{format(currentDate, 'MMMM yyyy', { locale: vi })}</span>
					</button>
				</PopoverTrigger>
				<PopoverContent className='w-auto p-0' align='center'>
					<Calendar
						mode='single'
						selected={currentDate}
						onSelect={handleMonthSelect}
						defaultMonth={currentDate}
						initialFocus
					/>
				</PopoverContent>
			</Popover>

			<Button 
				variant='ghost' 
				size='icon-sm' 
				className='h-8 w-8' 
				onClick={goNext}
				type='button'
			>
				<ChevronRightIcon className='h-4 w-4' />
			</Button>
		</div>
	);
}
