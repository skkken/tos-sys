import Anthropic from '@anthropic-ai/sdk'
import type { OCRResult } from '@/lib/types/receipt'

export type { OCRResult }

const MODEL = process.env.OCR_MODEL || 'claude-sonnet-4-5-20250514'

const SYSTEM_PROMPT = `あなたは領収書の画像を解析するアシスタントです。
画像から以下の情報を抽出し、JSON形式で返してください。

- amount: 合計金額（整数、円単位。税込の合計金額を優先）
- date: 日付（YYYY-MM-DD形式）
- storeName: 店名または支払先

読み取れない項目はnullとしてください。
JSON以外のテキストは出力しないでください。`

export async function analyzeReceipt(
  imageBase64: string,
  mediaType: 'image/jpeg' | 'image/png'
): Promise<OCRResult> {
  try {
    const client = new Anthropic()

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 256,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: imageBase64 },
            },
            {
              type: 'text',
              text: 'この領収書の情報をJSON形式で抽出してください。',
            },
          ],
        },
      ],
      system: SYSTEM_PROMPT,
    })

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('')

    const parsed = JSON.parse(text)

    return {
      amount: typeof parsed.amount === 'number' && Number.isInteger(parsed.amount) && parsed.amount > 0
        ? parsed.amount
        : null,
      date: typeof parsed.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(parsed.date)
        ? parsed.date
        : null,
      storeName: typeof parsed.storeName === 'string' && parsed.storeName.length > 0
        ? parsed.storeName
        : null,
    }
  } catch {
    return { amount: null, date: null, storeName: null }
  }
}
