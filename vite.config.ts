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
      server.middlewares.use('/api/generate-svg', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        const chunks: Buffer[] = []
        for await (const chunk of req) chunks.push(chunk as Buffer)
        const body = JSON.parse(Buffer.concat(chunks).toString())

        const { mode, coherence, previousThemes, lang } = body

        if (mode !== 'script' && mode !== 'json') {
          res.statusCode = 400
          res.end(JSON.stringify({ error: 'mode must be "script" or "json"' }))
          return
        }
        if (typeof coherence !== 'number') {
          res.statusCode = 400
          res.end(JSON.stringify({ error: 'coherence must be a number' }))
          return
        }

        const isJa = lang === 'ja'

        const getHint = (c: number) => {
          if (isJa) {
            if (c >= 0.8) return 'はっきりと認識できるシーン。明確な構図と調和の取れた配色。'
            if (c >= 0.6) return 'やや抽象的でスタイライズされたシーン。主題は識別可能だが芸術的に歪んでいる。'
            if (c >= 0.4) return '曖昧な抽象画。複数の解釈が可能。重なり合う形と控えめなコントラスト。'
            if (c >= 0.2) return '高度に抽象的。形は断片的、色は不協和、フォルムはほぼ認識不能。'
            return 'カオスな抽象。最大限の歪み、衝突する色彩、認識可能なフォルムなし。'
          }
          if (c >= 0.8) return 'Clearly recognizable scene. Distinct shapes, clear composition, harmonious colors.'
          if (c >= 0.6) return 'Somewhat abstract and stylized. Subject identifiable but artistically distorted.'
          if (c >= 0.4) return 'Ambiguous abstract. Multiple interpretations possible. Overlapping shapes, muted contrasts.'
          if (c >= 0.2) return 'Highly abstract. Fragmented shapes, discordant colors, barely recognizable forms.'
          return 'Chaotic abstract. Maximum distortion, clashing colors, no recognizable forms.'
        }

        const hint = getHint(coherence)

        const systemPrompt = mode === 'script'
          ? (isJa
            ? `あなたはJavaScriptコードでSVGアートを生成するアーティストです。

## ルール
- コードは\`new Function('width', 'height', code)\`で実行されます。
- 関数宣言やアロー関数でラップしないでください。直接コードを書いてreturn文でSVG文字列を返してください。
- テンプレートリテラルを使って有効なSVG文字列をreturnしてください。
- xmlns="http://www.w3.org/2000/svg"を含めてください。
- viewBox="0 0 " + width + " " + height を使用してください。
- グラデーション、パス、シェイプを使ってください。テキスト要素や埋め込み画像は不可。
- <script>タグやイベントハンドラ属性は入れないでください。
- 各コードは1500文字以内。

## クリエイティブ指示
- テーマ・モチーフは自由に選んでください。創造的で驚きのある選択を。
- 自然、建築、感情、宇宙現象、海中生物、神話、天気、抽象概念など、あらゆる領域から選べます。
- "theme"フィールドに短いテーマラベル（2〜5語）を含めてください。

## 出力形式
JSON: {"code": "...", "theme": "..."}`
            : `You are an SVG artist who writes JavaScript code to generate artwork.

## Rules
- The code runs via \`new Function('width', 'height', code)\`.
- Do NOT wrap code in a function declaration or arrow function. Write statements directly and use a return statement to return the SVG string.
- Use template literals to build a valid SVG string.
- Include xmlns="http://www.w3.org/2000/svg".
- Use viewBox="0 0 " + width + " " + height.
- Use gradients, paths, circles, rectangles, and other SVG shapes for visual richness.
- No text elements or embedded images.
- No <script> tags or event handler attributes.
- Keep each code under 1500 characters.

## Creative Direction
- Choose your own artistic theme/subject freely. Be creative and surprising.
- Draw from any domain: nature, architecture, emotions, cosmic phenomena, underwater life, mythology, weather, abstract concepts, etc.
- Include a brief theme label (2-5 words) in the "theme" field.

## Output format
Return a JSON object: {"code": "...", "theme": "..."}
"code" is a function body string (NOT a function declaration).`)
          : (isJa
            ? `あなたはJSON形式でビジュアル構成を記述するSVGアーティストです。

## シーン形式
- background: CSS色文字列
- gradients（任意）: [{id, type: "linear"|"radial", stops: [{offset, color}], attrs: {}}]
- elements: [{tag, attrs}]。tagは: circle, rect, ellipse, path, polygon, polyline, line, g

## ルール
- 5〜15個の要素を使ってください。グラデーションで深みを出してください。
- テキスト要素や埋め込み画像は不可。座標は0〜360の範囲内。

## クリエイティブ指示
- テーマ・モチーフは自由に選んでください。創造的で驚きのある選択を。
- 自然、建築、感情、宇宙現象、海中生物、神話、天気、抽象概念など、あらゆる領域から選べます。
- "theme"フィールドに短いテーマラベル（2〜5語）を含めてください。

## 出力形式
JSON: {"scene": {...}, "theme": "..."}`
            : `You are an SVG artist who describes visual compositions as JSON.

## Scene format
- background: CSS color string (e.g., "#001122" or "url(#g1)")
- gradients (optional): [{id, type: "linear"|"radial", stops: [{offset, color}], attrs: {}}]
- elements: [{tag, attrs}] where tag is: circle, rect, ellipse, path, polygon, polyline, line, g

## Rules
- Use 5-15 elements per scene. Use gradients for depth.
- No text elements or embedded images. Coordinates within 0-360.

## Creative Direction
- Choose your own artistic theme/subject freely. Be creative and surprising.
- Draw from any domain: nature, architecture, emotions, cosmic phenomena, underwater life, mythology, weather, abstract concepts, etc.
- Include a brief theme label (2-5 words) in the "theme" field.

## Output format
Return a JSON object: {"scene": {...}, "theme": "..."}
"scene" is a scene object in the format described above.`)

        const modeNote = mode === 'script'
          ? (isJa ? 'JavaScript関数本体を生成してください。' : 'Generate a JavaScript function body.')
          : (isJa ? 'JSONシーン記述を生成してください。' : 'Generate a JSON scene description.')

        const avoidLine = Array.isArray(previousThemes) && previousThemes.length > 0
          ? (isJa
            ? `\n\nこれらのテーマは避けてください（使用済み）: ${previousThemes.join(', ')}`
            : `\n\nAvoid these themes (already used): ${previousThemes.join(', ')}`)
          : ''

        const userPrompt = isJa
          ? `1つの抽象アートワークを生成してください。${modeNote}\n\n${hint}${avoidLine}`
          : `Generate 1 abstract artwork. ${modeNote}\n\n${hint}${avoidLine}`

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
              max_tokens: 2048,
              temperature: 0.9,
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

          const theme = typeof parsed.theme === 'string' ? parsed.theme : undefined

          let result: { content: string; fallback: boolean; theme?: string }
          if (mode === 'script') {
            const code = typeof parsed.code === 'string' ? parsed.code : ''
            result = { content: code, fallback: !code, theme }
          } else {
            const scene = parsed.scene
            if (scene && typeof scene === 'object') {
              result = { content: JSON.stringify(scene), fallback: false, theme }
            } else {
              result = { content: '', fallback: true, theme }
            }
          }

          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(result))
        } catch {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ content: '', fallback: true }))
        }
      })

      server.middlewares.use('/api/judge', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        const chunks: Buffer[] = []
        for await (const chunk of req) chunks.push(chunk as Buffer)
        const body = JSON.parse(Buffer.concat(chunks).toString())

        const { round, nicknameA, nicknameB, guessA, guessB, history, isFinal, lang } = body

        if (!guessA || !guessB) {
          res.statusCode = 400
          res.end(JSON.stringify({ error: 'guessA and guessB are required' }))
          return
        }

        const isJa = lang === 'ja'

        const historyText = (history ?? [])
          .map((h: { round: number; guessA: string; guessB: string; match: string }) =>
            isJa
              ? `Round ${h.round}: ${nicknameA}「${h.guessA}」 ${nicknameB}「${h.guessB}」→ ${h.match}`
              : `Round ${h.round}: ${nicknameA} "${h.guessA}" ${nicknameB} "${h.guessB}" → ${h.match}`
          )
          .join('\n')

        const systemPrompt = isJa
          ? `あなたは2人の相性ゲーム「One Shot」のジャッジです。

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
          : `You are the judge of a 2-player perception game called "One Shot".

## Task
Two players were shown the same abstract artwork and asked "What do you see?"
Compare their answers and judge the similarity level.

## Judging Criteria
- "perfect": Essentially the same thing (different wording, same meaning)
  Example: "ocean sunset" and "sunset beach"
  Example: "cat" and "kitty"
- "close": Similar imagery (clearly related)
  Example: "summer" and "beach"
  Example: "sunset" and "autumn sky"
- "different": Completely different things
  Example: "ocean" and "library"
- "opposite": Opposite impressions (amusing contrast)
  Example: "quiet night" and "festival"

## Comment Rules
- Casual and humorous English
- 1-2 sentences, keep it short
- perfect/close: impressed/amazed tone ("Wow!" "Telepathy?")
- different/opposite: keep it positive ("That's interesting!" "Total opposites, love it!")
- If there's round history, you may reference the streak
${isFinal ? '- This is the final round. Write a 2-3 sentence summary of the entire game. Include one conversation-starter question.' : ''}

## Output Rules
- Output JSON only (no markdown fences, no explanation text)
- Format: { "match": "...", "comment": "..." }`

        const userPrompt = isJa
          ? `Round ${round}

Player 1「${nicknameA}」の回答: ${guessA}
Player 2「${nicknameB}」の回答: ${guessB}
${historyText ? `\nこれまでの履歴:\n${historyText}` : ''}`
          : `Round ${round}

Player 1 "${nicknameA}" answered: ${guessA}
Player 2 "${nicknameB}" answered: ${guessB}
${historyText ? `\nHistory:\n${historyText}` : ''}`

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
            comment: isJa ? 'AIが混乱しちゃった...' : 'The AI got confused...',
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
