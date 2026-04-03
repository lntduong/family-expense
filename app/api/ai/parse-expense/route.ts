import { NextResponse } from 'next/server';

const LLM_API_URL = process.env.AI_API_URL || '';
const AI_API_KEY = process.env.AI_API_KEY || '';
const AI_MODEL = process.env.AI_MODEL || '';

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const { text, categories } = body;

		if (!text) {
			return NextResponse.json(
				{ error: 'Vui lòng cung cấp nội dung.' },
				{ status: 400 },
			);
		}

		// Danh sách categories truyền từ DB lên (để Model map đúng categoryId)
		// format: [{ id: "cuid1", name: "Ăn uống" }, { id: "cuid2", name: "Di chuyển" }]
		const categoryInfo =
			categories?.map((c: any) => ({
				id: c.id,
				name: c.name,
			})) || [];

		// Prompt hướng dẫn Model
		const systemPrompt = `Bạn là một trợ lý ảo chuyên phân tích dữ liệu tài chính cá nhân. Nhiệm vụ của bạn là đọc các câu nói của người dùng và trích xuất thành dữ liệu cấu trúc chặt chẽ.
Quy tắc xử lý số tiền:
- Nhận diện các từ "ngàn", "k", "nghìn" tương đương với thêm 3 số 0 (Ví dụ: "10 ngàn", "10k" -> 10000).
- "lít" = 100,000. "củ" = 1,000,000.

Danh sách Hạng mục (Categories) hiện có:
${JSON.stringify(categoryInfo)}

Quy tắc xuất kết quả:
- TRẢ VỀ ĐÚNG MỘT ĐỐI TƯỢNG JSON HỢP LỆ.
- KHÔNG giải thích, KHÔNG thêm bất kỳ văn bản nào khác ngoài JSON.
- Tìm và gán "categoryId" phù hợp nhất từ danh sách ở trên dựa vào nội dung (note). Nếu không phù hợp với bất kỳ hạng mục nào, hãy để "categoryId" là null.
- Cấu trúc JSON bắt buộc: {"amount": <số_tiền_dạng_số>, "note": "<nội_dung_ngắn_gọn>", "categoryId": "<id_hạng_mục_hoặc_null>"}
`;

		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
		};
		if (AI_API_KEY) {
			headers['Authorization'] = `Bearer ${AI_API_KEY}`;
		}

		const response = await fetch(LLM_API_URL, {
			method: 'POST',
			headers: headers,
			body: JSON.stringify({
				model: AI_MODEL,
				messages: [
					{ role: 'system', content: systemPrompt },
					{ role: 'user', content: text },
				],
				temperature: 0.1,
				max_tokens: 150,
			}),
			// fetch options để tránh timeout với LLM phản hồi chậm (tuỳ theo môi trường Node)
			signal: AbortSignal.timeout(30000), // Timeout 30 giây
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error('Lỗi từ LLM API:', errorText);
			return NextResponse.json(
				{ error: 'Không thể nhận phản hồi từ AI server.' },
				{ status: 500 },
			);
		}

		const data = await response.json();
		let content = data.choices?.[0]?.message?.content?.trim();

		// Dọn dẹp content phòng trường hợp LLM bọc JSON trong Markdown (```json ... ```)
		if (content.startsWith('```json')) {
			content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
		} else if (content.startsWith('```')) {
			content = content.replace(/^```\s*/, '').replace(/\s*```$/, '');
		}

		const parsedData = JSON.parse(content);

		return NextResponse.json({
			success: true,
			data: parsedData,
		});
	} catch (error: any) {
		console.error('Lỗi parse expense AI:', error);
		return NextResponse.json(
			{ error: 'Lỗi trong quá trình xử lý: ' + error.message },
			{ status: 500 },
		);
	}
}
