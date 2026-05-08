import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import Anthropic from '@anthropic-ai/sdk'
import { buildSystemPrompt, buildUserPrompt, TranslateRequestBody } from './prompts.js'

const app = express()
app.use(cors())
app.use(express.json({ limit: '256kb' }))

const apiKey = process.env.ANTHROPIC_API_KEY
const client = apiKey ? new Anthropic({ apiKey }) : null

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, claude: !!client })
})

app.post('/api/translate', async (req, res) => {
  const body = req.body as TranslateRequestBody
  if (!body?.trend || !body?.generation || !body?.region) {
    return res.status(400).json({ error: 'trend, generation, region 필수' })
  }
  if (!client) {
    return res.status(503).json({
      error: 'ANTHROPIC_API_KEY 미설정. 프론트엔드는 시드 데이터로 폴백합니다.',
    })
  }

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 1800,
      system: buildSystemPrompt(),
      messages: [{ role: 'user', content: buildUserPrompt(body) }],
    })

    const text = message.content
      .map((b) => (b.type === 'text' ? b.text : ''))
      .join('')
      .trim()
    const jsonText = extractJson(text)
    if (!jsonText) {
      return res
        .status(502)
        .json({ error: 'Claude 응답에서 JSON을 찾지 못함', raw: text.slice(0, 600) })
    }
    const challenge = JSON.parse(jsonText)
    res.json({ challenge })
  } catch (e: any) {
    console.error('[/api/translate] error', e?.message ?? e)
    res.status(500).json({ error: e?.message ?? 'Claude 호출 실패' })
  }
})

function extractJson(text: string): string | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fenced) return fenced[1].trim()
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start !== -1 && end !== -1 && end > start) return text.slice(start, end + 1)
  return null
}

const port = Number(process.env.PORT ?? 8787)
app.listen(port, () => {
  console.log(`[trendo-server] listening on :${port}  claude=${!!client}`)
})
