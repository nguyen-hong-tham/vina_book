import OpenAI from "openai";
import db from "../../lib/db";

const openai = new OpenAI({
  apiKey: process.en.OPENAI_API_KEY
});

export default async function handler(req, res) {
  try {
    const { message } = req.body;

    const [books] = await db.query(`
      SELECT
        b.title,
        b.author,
        b.price,
        b.stock,
        c.name as category_name
      FROM books b
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.status IN ('AAILABLE','OUT_OF_STOCK')
      LIMIT 100
    `);

    const prompt = `
Bạn là AI assistant của cửa hàng sách inabook. Nhiệm ụ của bạn là hỗ trợ khách hàng tìm kiếm thông tin ề sách dựa trên cơ sở dữ liệu (DATABASE) được cung cấp dưới đây.

DATABASE:
${JSON.stringify(books)}

QUY TẮC PHẢN HỒI:
1. CHỈ hỗ trợ các câu hỏi liên quan đến sách, tác giả, giá cả, tồn kho hoặc thể loại sách có trong hệ thống.
2. Nếu người dùng hỏi những chủ đề nằm ngoài phạm i này (í dụ: thời tiết, nấu ăn, danh nhân, lịch sử thế giới không liên quan đến sách, câu hỏi kiến thức chung như "Tổng thống Mỹ là ai?", ..):
   BẮT BUỘC phải trả lời chính xác câu sau à không thêm gì khác:
   "Xin lỗi, tôi chỉ hỗ trợ thông tin sách trong hệ thống."
3. Nếu người dùng hỏi ề thể loại sách hoặc tên sách cụ thể mà hợp lệ (thuộc chủ đề sách) nhưng hiện tại DATABASE không có thông tin (í dụ: hỏi sách trinh thám khi trong DATABASE không có cuốn nào thuộc thể loại đó):
   Hãy trả lời lịch sự rằng cửa hàng hiện chưa có hoặc hết hàng đối ới sách/thể loại này, KHÔNG dùng câu từ chối ở quy tắc 2.
4. ĐỊNH DẠNG TIN NHẮN ĐẸP MẮT: Khi liệt kê sách hoặc đưa ra thông tin, hãy xuống dòng (\n) hợp lý, in đậm tên sách (í dụ: **Tên sách**) à sử dụng các đầu mục danh sách rõ ràng (1., 2., hoặc dấu gạch đầu dòng) để câu trả lời gọn gàng, dễ đọc.

QUESTION:
${message}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }]
    });

    res.status(200).json({
      reply: response.choices[0].message.content
    });

  } catch (err) {
    console.error("Chat API Error:", err);

    let clientMessage = "Đã xảy ra lỗi khi xử lý tin nhắn của bạn.";
    if (err.message && (err.message.includes("429") || err.message.includes("quota") || err.message.includes("limit"))) {
      clientMessage = "Hệ thống AI (OpenAI) tạm thời hết hạn ngạch hoặc ượt quá giới hạn lượt gọi (Quota/Rate Limit). ui lòng kiểm tra lại tài khoản hoặc thử lại sau!";
    } else if (err.message && (err.message.includes("timeout") || err.message.includes("connect"))) {
      clientMessage = "Lỗi kết nối cơ sở dữ liệu. ui lòng kiểm tra lại kết nối mạng!";
    } else if (err.message && (err.message.includes("500") || err.message.includes("503") || err.message.includes("oerloaded"))) {
      clientMessage = "Hệ thống OpenAI đang bận hoặc quá tải. ui lòng thử lại sau giây lát!";
    }

    res.status(500).json({
      error: "Chat failed",
      message: clientMessage,
      details: err.message
    });
  }
}