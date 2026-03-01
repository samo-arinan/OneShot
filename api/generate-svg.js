export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.MISTRAL_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'MISTRAL_API_KEY not configured' })
  }

  const { mode, coherence, previousThemes, lang } = req.body

  if (mode !== 'script' && mode !== 'json') {
    return res.status(400).json({ error: 'mode must be "script" or "json"' })
  }
  if (typeof coherence !== 'number') {
    return res.status(400).json({ error: 'coherence must be a number' })
  }

  const isJa = lang === 'ja'
  const systemPrompt = mode === 'script' ? scriptSystemPrompt(isJa) : jsonSystemPrompt(isJa)
  const userPrompt = buildUserPrompt(mode, coherence, previousThemes, isJa)

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
        max_tokens: 4096,
        temperature: 0.9,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      const body = await response.text()
      return res.status(response.status).json({ error: body })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content ?? '{}'

    const parsed = JSON.parse(content)
    const result = parseResponse(mode, parsed)
    return res.status(200).json(result)
  } catch {
    return res.status(200).json({ content: '', fallback: true })
  }
}

function scriptSystemPrompt(isJa) {
  if (isJa) {
    return `あなたはJavaScriptコードでSVGアートを生成するアーティストです。

## ルール
- コードは\`new Function('width', 'height', code)\`で実行されます。
- 関数宣言やアロー関数でラップしないでください。直接コードを書いてreturn文でSVG文字列を返してください。
- テンプレートリテラルを使って有効なSVG文字列をreturnしてください。
- SVG要素にxmlns="http://www.w3.org/2000/svg"を含めてください。
- viewBox="0 0 " + width + " " + height を使用してください。
- グラデーション、パス、円、矩形などのSVGシェイプを使ってください。
- テキスト要素や埋め込み画像は使わないでください。
- <script>タグやイベントハンドラ属性は入れないでください。
- 各コードは3000文字以内にしてください。

## クリエイティブ指示
- テーマ・モチーフは自由に選んでください。創造的で驚きのある選択を。
- 自然、建築、宇宙現象、海中生物、神話、天気など、あらゆる領域から選べます。
- テーマは視覚的に描写可能で、多くの人が見たら連想できるものを選んでください。「孤独」のような純粋な感情概念より、「灯台」「深海魚」のような具象物を優先してください。
- "theme"フィールドに短いテーマラベル（2〜5語）を含めてください。

## 出力形式
JSON: {"code": "...", "theme": "..."}`
  }
  return `You are an SVG artist who writes JavaScript code to generate artwork.

## Rules
- The code runs via \`new Function('width', 'height', code)\`.
- Do NOT wrap code in a function declaration or arrow function. Write statements directly and use a return statement to return the SVG string.
- Use template literals to build a valid SVG string.
- Include xmlns="http://www.w3.org/2000/svg" in the SVG element.
- Use viewBox="0 0 " + width + " " + height.
- Use gradients, paths, circles, rectangles, and other SVG shapes for visual richness.
- No text elements or embedded images.
- No <script> tags or event handler attributes.
- Keep each code under 3000 characters.

## Creative Direction
- Choose your own artistic theme/subject freely. Be creative and surprising.
- Draw from any domain: nature, architecture, cosmic phenomena, underwater life, mythology, weather, etc.
- Choose themes that are visually depictable and that most people can associate with. Prefer concrete objects like "lighthouse" or "deep-sea fish" over pure emotional concepts like "loneliness".
- Include a brief theme label (2-5 words) in the "theme" field.

## Output format
Return a JSON object: {"code": "...", "theme": "..."}
"code" is a function body string (NOT a function declaration).`
}

function jsonSystemPrompt(isJa) {
  if (isJa) {
    return `あなたはJSON形式でビジュアル構成を記述するSVGアーティストです。

## シーン形式
各シーンはJSONオブジェクトです:
- background: CSS色文字列（例: "#001122"や"url(#g1)"）
- gradients（任意）: [{id, type: "linear"|"radial", stops: [{offset, color}], attrs: {}}]の配列
- elements: [{tag, attrs}]の配列。tagは: circle, rect, ellipse, path, polygon, polyline, line, g

## ルール
- 視覚的な豊かさのために5〜15個の要素を使ってください。
- 深みと雰囲気のためにグラデーションを使ってください。
- テキスト要素や埋め込み画像は使わないでください。
- 座標は0〜360の範囲内にしてください。

## クリエイティブ指示
- テーマ・モチーフは自由に選んでください。創造的で驚きのある選択を。
- 自然、建築、宇宙現象、海中生物、神話、天気など、あらゆる領域から選べます。
- テーマは視覚的に描写可能で、多くの人が見たら連想できるものを選んでください。「孤独」のような純粋な感情概念より、「灯台」「深海魚」のような具象物を優先してください。
- "theme"フィールドに短いテーマラベル（2〜5語）を含めてください。

## 出力形式
JSON: {"scene": {...}, "theme": "..."}`
  }
  return `You are an SVG artist who describes visual compositions as JSON.

## Scene format
Each scene is a JSON object with:
- background: CSS color string (e.g., "#001122" or "url(#g1)")
- gradients (optional): array of {id, type: "linear"|"radial", stops: [{offset, color}], attrs: {}}
- elements: array of {tag, attrs} where tag is one of: circle, rect, ellipse, path, polygon, polyline, line, g

## Rules
- Use 5-15 elements per scene for visual richness.
- Use gradients for depth and atmosphere.
- No text elements or embedded images.
- Keep coordinates within 0-360 range.

## Creative Direction
- Choose your own artistic theme/subject freely. Be creative and surprising.
- Draw from any domain: nature, architecture, cosmic phenomena, underwater life, mythology, weather, etc.
- Choose themes that are visually depictable and that most people can associate with. Prefer concrete objects like "lighthouse" or "deep-sea fish" over pure emotional concepts like "loneliness".
- Include a brief theme label (2-5 words) in the "theme" field.

## Output format
Return a JSON object: {"scene": {...}, "theme": "..."}
"scene" is a scene object in the format described above.`
}

function buildUserPrompt(mode, coherence, previousThemes, isJa) {
  const hint = getCoherenceHint(coherence, isJa)

  const modeNote = mode === 'script'
    ? (isJa ? 'JavaScript関数本体を生成してください。' : 'Generate a JavaScript function body.')
    : (isJa ? 'JSONシーン記述を生成してください。' : 'Generate a JSON scene description.')

  const avoidLine = Array.isArray(previousThemes) && previousThemes.length > 0
    ? (isJa
      ? `\n\nこれらのテーマは避けてください（使用済み）: ${previousThemes.join(', ')}`
      : `\n\nAvoid these themes (already used): ${previousThemes.join(', ')}`)
    : ''

  return isJa
    ? `1つの抽象アートワークを生成してください。${modeNote}\n\n${hint}${avoidLine}`
    : `Generate 1 abstract artwork. ${modeNote}\n\n${hint}${avoidLine}`
}

function getCoherenceHint(coherence, isJa) {
  if (isJa) {
    if (coherence >= 0.8) return 'はっきりと認識できるシーン。明確な構図と調和の取れた配色。'
    if (coherence >= 0.6) return 'やや抽象的でスタイライズされたシーン。主題は識別可能だが芸術的に歪んでいる。'
    if (coherence >= 0.4) return '曖昧な抽象画。複数の解釈が可能。重なり合う形と控えめなコントラスト。'
    if (coherence >= 0.2) return '高度に抽象的。形は断片的、色は不協和、フォルムはほぼ認識不能。'
    return 'カオスな抽象。最大限の歪み、衝突する色彩、認識可能なフォルムなし。'
  }
  if (coherence >= 0.8) return 'Clearly recognizable scene. Distinct shapes, clear composition, harmonious colors.'
  if (coherence >= 0.6) return 'Somewhat abstract and stylized. Subject identifiable but artistically distorted.'
  if (coherence >= 0.4) return 'Ambiguous abstract. Multiple interpretations possible. Overlapping shapes, muted contrasts.'
  if (coherence >= 0.2) return 'Highly abstract. Fragmented shapes, discordant colors, barely recognizable forms.'
  return 'Chaotic abstract. Maximum distortion, clashing colors, no recognizable forms.'
}

function parseResponse(mode, parsed) {
  const theme = typeof parsed.theme === 'string' ? parsed.theme : undefined

  if (mode === 'script') {
    const code = typeof parsed.code === 'string' ? parsed.code : ''
    return { content: code, fallback: !code, theme }
  }

  const scene = parsed.scene
  if (scene && typeof scene === 'object') {
    return { content: JSON.stringify(scene), fallback: false, theme }
  }
  return { content: '', fallback: true, theme }
}
