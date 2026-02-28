import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import type { Plugin } from 'vite'

function localApiPlugin(): Plugin {
  let apiKey = ''
  return {
    name: 'local-api',
    configResolved(config) {
      const env = loadEnv(config.mode, config.root, '')
      apiKey = env.MISTRAL_API_KEY ?? ''
    },
    configureServer(server) {
      server.middlewares.use('/api/judge', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        const chunks: Buffer[] = []
        for await (const chunk of req) chunks.push(chunk as Buffer)
        const body = JSON.parse(Buffer.concat(chunks).toString())

        const { round, nicknameA, nicknameB, guessA, guessB, history, isFinal } = body

        if (!guessA || !guessB) {
          res.statusCode = 400
          res.end(JSON.stringify({ error: 'guessA and guessB are required' }))
          return
        }

        const historyText = (history ?? [])
          .map((h: { round: number; guessA: string; guessB: string; match: string }) =>
            `Round ${h.round}: ${nicknameA}「${h.guessA}」 ${nicknameB}「${h.guessB}」→ ${h.match}`
          )
          .join('\n')

        const systemPrompt = `あなたは2人の相性ゲーム「One Shot」のジャッジです。

## タスク
2人に同じ抽象画を見せて「何に見える？」と聞きました。
2人の回答を比較し、一致度を判定してコメントしてください。

## 判定基準
- "perfect": ほぼ同じもの（表現が違っても意味が同じ）
  例: 「夕焼けの海」と「サンセットビーチ」
  例: 「猫」と「ネコ」
- "close": 近いイメージ（関連性が明確にある）
  例: 「夏」と「海」
  例: 「夕焼け」と「秋の空」
- "different": 全然違うもの
  例: 「海」と「図書館」
- "opposite": 真逆のイメージ（面白い対比）
  例: 「静かな夜」と「お祭り」

## コメントのルール
- カジュアルでユーモアのある日本語
- 1-2文で簡潔に
- perfect/closeの場合: 感心・驚き系（「すごい！」「テレパシー？」）
- different/oppositeの場合: ポジティブに（「それはそれで面白い」「真逆なのウケるw」）
- これまでのラウンド履歴がある場合は、連続記録に言及してもOK
${isFinal ? '- これがゲーム終了のラウンドです。全体を振り返る総括コメント（2-3文）にしてください。会話のきっかけになる質問を1つ含めてください。' : ''}

## 出力ルール
- JSONだけを出力（\`\`\`で囲まない、説明テキストなし）
- { "match": "...", "comment": "..." } の形式`

        const userPrompt = `Round ${round}

Player 1「${nicknameA}」の回答: ${guessA}
Player 2「${nicknameB}」の回答: ${guessB}
${historyText ? `\nこれまでの履歴:\n${historyText}` : ''}`

        try {
          const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: 'mistral-large-latest',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
              ],
              max_tokens: 256,
              temperature: 0.7,
              response_format: { type: 'json_object' },
            }),
          })

          if (!response.ok) {
            const text = await response.text()
            res.statusCode = response.status
            res.end(JSON.stringify({ error: text }))
            return
          }

          const data = await response.json() as { choices?: { message?: { content?: string } }[] }
          const content = data.choices?.[0]?.message?.content ?? '{}'
          const parsed = JSON.parse(content)
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({
            match: parsed.match ?? 'different',
            comment: parsed.comment ?? '',
          }))
        } catch {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({
            match: 'different',
            comment: 'AIが混乱しちゃった...',
          }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), localApiPlugin()],
  server: { host: true, allowedHosts: true },
})
