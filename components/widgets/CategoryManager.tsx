'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import {
	PlusIcon,
	Pencil1Icon,
	TrashIcon,
	CheckIcon,
} from '@radix-ui/react-icons';
import { useRouter } from 'next/navigation';

interface Category {
	id: string;
	name: string;
	icon: string;
	color: string;
	ruleType: 'NEEDS' | 'WANTS' | 'SAVINGS';
}

const EMOJI_PRESETS = [
	'🍔', '🍕', '🍜', '☕', '🛒', '🏠', '💡', '📱', 
	'🚗', '⛽', '🎮', '🎬', '👕', '💊', '📚', '🎓',
	'✈️', '🏥', '💰', '🎁', '🔧', '🎨', '👶', '🐕'
];

const COLOR_PRESETS = [
	'#3b82f6', // blue
	'#ef4444', // red
	'#10b981', // green
	'#f59e0b', // amber
	'#8b5cf6', // violet
	'#ec4899', // pink
	'#06b6d4', // cyan
	'#f97316', // orange
];

export function CategoryManager() {
	const router = useRouter();
	const [categories, setCategories] = useState<Category[]>([]);
	const [loading, setLoading] = useState(true);
	const [isAddOpen, setIsAddOpen] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	
	const [formData, setFormData] = useState<{
		name: string;
		icon: string;
		color: string;
		ruleType: 'NEEDS' | 'WANTS' | 'SAVINGS';
	}>({
		name: '',
		icon: '📁',
		color: '#3b82f6',
		ruleType: 'NEEDS',
	});

	useEffect(() => {
		fetchCategories();
	}, []);

	async function fetchCategories() {
		try {
			const res = await fetch('/api/categories');
			if (res.ok) {
				const data = await res.json();
				setCategories(data);
			}
		} catch (error) {
			console.error('Error fetching categories:', error);
		} finally {
			setLoading(false);
		}
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		
		if (editingId) {
			// Update
			const res = await fetch(`/api/categories/${editingId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData),
			});

			if (res.ok) {
				await fetchCategories();
				setEditingId(null);
				resetForm();
				router.refresh();
			} else {
				const error = await res.json();
				alert(error.error || 'Lỗi khi cập nhật danh mục');
			}
		} else {
			// Create
			const res = await fetch('/api/categories', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData),
			});

			if (res.ok) {
				await fetchCategories();
				setIsAddOpen(false);
				resetForm();
				router.refresh();
			} else {
				const error = await res.json();
				alert(error.error || 'Lỗi khi tạo danh mục');
			}
		}
	}

	async function handleDelete(id: string) {
		if (!confirm('Bạn có chắc muốn xóa danh mục này?')) return;

		const res = await fetch(`/api/categories/${id}`, {
			method: 'DELETE',
		});

		if (res.ok) {
			await fetchCategories();
			router.refresh();
		} else {
			const error = await res.json();
			alert(error.error || 'Lỗi khi xóa danh mục');
		}
	}

	function resetForm() {
		setFormData({ name: '', icon: '📁', color: '#3b82f6', ruleType: 'NEEDS' });
	}

	function startEdit(category: Category) {
		setFormData({
			name: category.name,
			icon: category.icon,
			color: category.color,
			ruleType: category.ruleType || 'NEEDS',
		});
		setEditingId(category.id);
	}

	function cancelEdit() {
		setEditingId(null);
		resetForm();
	}

	if (loading) {
		return (
			<div className='glass-card macos-shadow-md p-6'>
				<p className='text-center text-muted-foreground'>Đang tải...</p>
			</div>
		);
	}

	return (
		<div className='glass-card macos-shadow-md p-6 space-y-6'>
			{/* Header with Add Button */}
			<div className='flex items-center justify-between'>
				<h2 className='text-lg font-semibold'>Danh mục chi tiêu</h2>
				<Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
					<DialogTrigger asChild>
						<Button size='sm' className='gap-2'>
							<PlusIcon className='h-4 w-4' />
							Thêm danh mục
						</Button>
					</DialogTrigger>
					<DialogContent className='glass-card macos-shadow-lg border-border/50'>
						<DialogHeader>
							<DialogTitle>Tạo danh mục mới</DialogTitle>
						</DialogHeader>
						<form onSubmit={handleSubmit} className='space-y-4 mt-4'>
							<div>
								<label className='text-sm font-medium mb-2 block'>Tên danh mục</label>
								<Input
									value={formData.name}
									onChange={(e) =>
										setFormData({ ...formData, name: e.target.value })
									}
									placeholder='VD: Giải trí'
									required
								/>
							</div>

							<div>
								<label className='text-sm font-medium mb-2 block'>Biểu tượng</label>
								<div className='grid grid-cols-8 gap-2 mb-3'>
									{EMOJI_PRESETS.map((emoji) => (
										<button
											key={emoji}
											type='button'
											onClick={() => setFormData({ ...formData, icon: emoji })}
											className={`h-10 rounded-lg border-2 transition-all duration-200 hover:scale-110 ${
												formData.icon === emoji
													? 'border-primary bg-primary/10'
													: 'border-border bg-background/50'
											}`}
										>
											{emoji}
										</button>
									))}
								</div>
								<Input
									value={formData.icon}
									onChange={(e) =>
										setFormData({ ...formData, icon: e.target.value })
									}
									placeholder='Hoặc nhập emoji'
									maxLength={2}
								/>
							</div>

							<div>
								<label className='text-sm font-medium mb-2 block'>Nhóm quản lý (Quy tắc 50/30/20)</label>
								<div className='flex gap-2 mb-3'>
									{[
										{ id: 'NEEDS', label: 'Thiết yếu' },
										{ id: 'WANTS', label: 'Tận hưởng' },
										{ id: 'SAVINGS', label: 'Tích lũy' }
									].map(rule => (
										<button
											key={rule.id}
											type="button"
											onClick={() => setFormData({ ...formData, ruleType: rule.id as any })}
											className={`flex-1 py-2 px-1 rounded-lg border-2 text-xs font-semibold transition-all duration-200 ${
												formData.ruleType === rule.id 
												? `border-primary bg-primary/10 text-primary`
												: 'border-border text-muted-foreground bg-background/50'
											}`}
										>
											{rule.label}
										</button>
									))}
								</div>
							</div>

							<div>
								<label className='text-sm font-medium mb-2 block'>Màu sắc</label>
								<div className='grid grid-cols-8 gap-2 mb-3'>
									{COLOR_PRESETS.map((color) => (
										<button
											key={color}
											type='button'
											onClick={() => setFormData({ ...formData, color })}
											className={`h-10 rounded-lg border-2 transition-all duration-200 hover:scale-110 ${
												formData.color === color
													? 'border-foreground'
													: 'border-border'
											}`}
											style={{ backgroundColor: color }}
										>
											{formData.color === color && (
												<CheckIcon className='h-5 w-5 mx-auto text-white drop-shadow' />
											)}
										</button>
									))}
								</div>
								<Input
									type='color'
									value={formData.color}
									onChange={(e) =>
										setFormData({ ...formData, color: e.target.value })
									}
									className='h-11 cursor-pointer'
								/>
							</div>

							<div className='flex gap-2 pt-2'>
								<Button
									type='button'
									variant='outline'
									onClick={() => {
										setIsAddOpen(false);
										resetForm();
									}}
									className='flex-1'
								>
									Hủy
								</Button>
								<Button type='submit' className='flex-1'>
									Tạo
								</Button>
							</div>
						</form>
					</DialogContent>
				</Dialog>
			</div>

			{/* Category List */}
			<div className='space-y-2'>
				{categories.length === 0 ? (
					<p className='text-center text-muted-foreground py-8'>
						Chưa có danh mục nào. Thêm danh mục đầu tiên!
					</p>
				) : (
					categories.map((category) => (
						<div
							key={category.id}
							className='flex items-center gap-3 p-3 rounded-xl border-2 border-border bg-background/50 backdrop-blur-sm transition-all duration-200 hover:border-muted-foreground/30 min-w-0 overflow-hidden'
						>
							{editingId === category.id ? (
								<>
									{/* Edit Form */}
									<div
										className='flex items-center justify-center w-10 h-10 rounded-lg text-xl shrink-0'
										style={{ backgroundColor: formData.color }}
									>
										{formData.icon}
									</div>
									<Input
										value={formData.name}
										onChange={(e) =>
											setFormData({ ...formData, name: e.target.value })
										}
										className='flex-1 min-w-0'
										autoFocus
									/>
                  <select
										value={formData.ruleType}
										onChange={(e) => setFormData({ ...formData, ruleType: e.target.value as any })}
										className="h-9 px-2 rounded-md border border-input bg-transparent shadow-sm text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
									>
										<option value="NEEDS">Thiết yếu</option>
										<option value="WANTS">Tận hưởng</option>
										<option value="SAVINGS">Tích lũy</option>
									</select>
									<div className='flex gap-1 shrink-0'>
										<Button
											size='sm'
											onClick={handleSubmit}
											className='h-8 w-8 p-0'
											title='Lưu'
										>
											<CheckIcon className='h-4 w-4' />
										</Button>
										<Button
											size='sm'
											variant='outline'
											onClick={cancelEdit}
											className='h-8 w-8 p-0'
											title='Hủy'
										>
											✕
										</Button>
									</div>
								</>
							) : (
								<>
									{/* View Mode */}
									<div
										className='flex items-center justify-center w-10 h-10 rounded-lg text-xl shrink-0'
										style={{ backgroundColor: category.color }}
									>
										{category.icon}
									</div>
									<span className='flex-1 font-medium truncate min-w-0'>
										{category.name}
										<span className='ml-2 text-[10px] uppercase font-bold text-muted-foreground/60'>
											{category.ruleType === 'NEEDS' ? 'Thiết yếu' : category.ruleType === 'WANTS' ? 'Tận hưởng' : 'Tích lũy'}
										</span>
									</span>
									<div className='flex gap-1 shrink-0'>
										<Button
											size='sm'
											variant='outline'
											onClick={() => startEdit(category)}
											className='h-8 w-8 p-0'
											title='Sửa'
										>
											<Pencil1Icon className='h-4 w-4' />
										</Button>
										<Button
											size='sm'
											variant='outline'
											onClick={() => handleDelete(category.id)}
											className='h-8 w-8 p-0 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30'
											title='Xóa'
										>
											<TrashIcon className='h-4 w-4' />
										</Button>
									</div>
								</>
							)}
						</div>
					))
				)}
			</div>
		</div>
	);
}
