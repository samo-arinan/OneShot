export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.MISTRAL_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'MISTRAL_API_KEY not configured' })
  }

  const { mode, previousThemes, lang } = req.body

  if (mode !== 'script' && mode !== 'json') {
    return res.status(400).json({ error: 'mode must be "script" or "json"' })
  }

  const isJa = lang === 'ja'
  const systemPrompt = mode === 'script' ? scriptSystemPrompt(isJa) : jsonSystemPrompt(isJa)
  const userPrompt = buildUserPrompt(mode, previousThemes, isJa)

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
        max_tokens: 8192,
        temperature: 0.7,
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
    return `あなたはJavaScriptコードで詳細なSVGアートを生成するアーティストです。

## ルール
- コードは\`new Function('width', 'height', code)\`で実行されます。
- 関数宣言やアロー関数でラップしないでください。直接コードを書いてreturn文でSVG文字列を返してください。
- テンプレートリテラルを使って有効なSVG文字列をreturnしてください。
- SVG要素にxmlns="http://www.w3.org/2000/svg"を含めてください。
- viewBox="0 0 " + width + " " + height を使用してください。
- テキスト要素や埋め込み画像は使わないでください。
- <script>タグやイベントハンドラ属性は入れないでください。
- 各コードは3500文字以内にしてください。

## 構図
- 背景: グラデーションや単色
- 主題: 6〜12個のSVG要素。1つのpathではなく、体・ディテール・特徴に分解する
- テクスチャ: 半透明の全面rect（opacity 0.03-0.10）（任意）
- アクセント: グロー効果（radialGradient）（任意）

## 詳細な描画方法
- 主題を部品に分解する:
  * 輪郭・本体（1-2個のpath）
  * 内部ディテール（縞、窓、模様 — rect, circle, path）
  * 小さな識別特徴（目、アンテナ、ドア、ヒレ — その物体を認識可能にする要素）
- 座標はwidth/heightに対する相対値を使う（例: W*0.5, H*0.3）

## テーマ選択
- 具体的で名前を付けられるものを描く — 幾何学模様や抽象的な塊ではなく
- 良い題材: 灯台、帆船、猫、火山、城、木、魚、風車、クラゲ、気球、五重塔、フクロウ、サボテン、ロケット、白鳥、傘、橋、タツノオトシゴ、提灯、ペンギン、キノコ、ギター、錨
- 見た人が2秒以内に「あれは○○だ」と言えること
- "theme"フィールドに短いテーマラベル（2〜5語）を含めてください

## 出力形式
JSON: {"code": "...", "theme": "..."}`
  }

  return `You are an SVG artist who writes JavaScript code to generate detailed artwork.

## Rules
- The code runs via \`new Function('width', 'height', code)\`.
- Do NOT wrap code in a function declaration or arrow function. Write statements directly and use a return statement to return the SVG string.
- Use template literals to build a valid SVG string.
- Include xmlns="http://www.w3.org/2000/svg" in the SVG element.
- Use viewBox="0 0 " + width + " " + height.
- No text elements or embedded images.
- No <script> tags or event handler attributes.
- Keep each code under 3500 characters.

## Composition
- Background: gradient or solid color
- Main subject: 6-12 SVG elements forming a CONCRETE, RECOGNIZABLE subject. NOT a single path — break the subject into multiple parts (body, details, features).
- Texture overlay: translucent full-canvas rect, opacity 0.03-0.10 (optional)
- Accent: focal glow using radialGradient (optional)

## How to Draw Detailed Subjects
- Break the subject into parts:
  * Outline/body shape (1-2 paths)
  * Internal details (stripes, windows, patterns — rects, circles, paths)
  * Small distinguishing features (eyes, antenna, door, fins — what makes it recognizable)
- Use coordinates relative to width/height (e.g., W*0.5, H*0.3) for responsiveness.

## Subject Selection
- Draw a concrete, nameable thing — NOT geometric patterns or abstract blobs.
- Good subjects: lighthouse, sailboat, cat, volcano, castle, tree, fish, windmill, jellyfish, hot air balloon, pagoda, owl, cactus, rocket, swan, umbrella, bridge, seahorse, lantern, penguin, mushroom, guitar, anchor.
- The viewer should say "that's a [thing]" within 2 seconds.
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

function buildUserPrompt(mode, previousThemes, isJa) {
  const modeNote = mode === 'script'
    ? (isJa ? 'JavaScript関数本体を生成してください。' : 'Generate a JavaScript function body.')
    : (isJa ? 'JSONシーン記述を生成してください。' : 'Generate a JSON scene description.')

  const avoidLine = Array.isArray(previousThemes) && previousThemes.length > 0
    ? (isJa
      ? `\n\nこれらのテーマは避けてください（使用済み）: ${previousThemes.join(', ')}`
      : `\n\nAvoid these themes (already used): ${previousThemes.join(', ')}`)
    : ''

  const hint = isJa
    ? '具体的で認識可能な主題を6〜12個のSVG要素で描く。見た人が2秒以内に一言で名前を言える（例:「灯台」「猫」「帆船」）。主題を本体＋ディテール＋特徴に分解する。単一pathではなく複数要素でリアルに。前景と背景の明確な分離。調和の取れた3〜5色パレット。'
    : 'Draw a CONCRETE, RECOGNIZABLE subject using 6-12 SVG elements. The viewer should name it in one word within 2 seconds (e.g., "lighthouse", "cat", "sailboat"). Break the subject into body + details + features. Do NOT use a single path — use multiple elements for realism. Clear foreground/background separation. Harmonious 3-5 color palette.'

  const subject = isJa
    ? '1つのアートワークを生成してください。'
    : 'Generate 1 artwork.'

  return `${subject} ${modeNote}\n\n${hint}${avoidLine}`
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
