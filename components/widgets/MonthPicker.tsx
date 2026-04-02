'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { Button } from '@/components/ui/button';

export function MonthPicker({
	currentMonth,
	currentYear,
}: {
	currentMonth: number;
	currentYear: number;
}) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const monthStr = currentMonth < 10 ? `0${currentMonth}` : `${currentMonth}`;
	const value = `${currentYear}-${monthStr}`;

	function handleChange(newValue: string) {
		if (!newValue) return;
		const [y, m] = newValue.split('-');
		const params = new URLSearchParams(searchParams.toString());
		params.set('year', y);
		// remove leading zero before setting to URL
		params.set('month', Number(m).toString());
		router.push(`${pathname}?${params.toString()}`);
	}

	function goPrev() {
		let m = currentMonth - 1;
		let y = currentYear;
		if (m < 1) {
			m = 12;
			y -= 1;
		}
		const mStr = m < 10 ? `0${m}` : `${m}`;
		handleChange(`${y}-${mStr}`);
	}

	function goNext() {
		let m = currentMonth + 1;
		let y = currentYear;
		if (m > 12) {
			m = 1;
			y += 1;
		}
		const mStr = m < 10 ? `0${m}` : `${m}`;
		handleChange(`${y}-${mStr}`);
	}

	return (
		<div className='flex items-center gap-2 bg-background border p-1 rounded-xl shadow-sm w-max'>
			<Button variant='ghost' size='icon' className='h-8 w-8' onClick={goPrev}>
				<ChevronLeftIcon className='h-5 w-5' />
			</Button>
			<input
				type='month'
				value={value}
				onChange={(e) => handleChange(e.target.value)}
				className='bg-transparent border-none text-sm font-medium focus:outline-none w-[110px] text-center'
			/>
			<Button variant='ghost' size='icon' className='h-8 w-8' onClick={goNext}>
				<ChevronRightIcon className='h-5 w-5' />
			</Button>
		</div>
	);
}
