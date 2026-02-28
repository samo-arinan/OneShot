# One Shot — 設計書 (latest)

## コンセプト

2人に同じ抽象画を見せて「何に見える？」と聞く。
同じものが見えたら次のラウンドへ。ラウンドが進むほど絵は抽象的になる。
どこまで一致し続けられるか。

**「One Shot」＝ 毎回一発勝負。同じものが見えるか？**

---

## 変更履歴

- v1-v4: スコアベースの相性判定（プロフィール入力 → SVG + スコア + コメント）
- v5: 「何に見える？」方式に転換（プロフィール入力は残存）
- v6: ゲーム方式に全面刷新
  - プロフィール質問を廃止 → ニックネームのみ
  - ラウンド制（連続一致チャレンジ）
  - 難易度カーブ（coherenceがラウンドごとに低下）
  - ビジュアル生成をフロント完結に（Canvas API）
  - API 1本化（judge のみ）
- v7: 描画エンジンをモチーフベース方式に変更（Canvas API）
- **v8: 描画エンジンをSVGシーン方式に全面変更**
  - Canvas API → SVG に切り替え
  - モチーフ＋パレットの分離を廃止 → 「シーン」として統合
  - シーン定義をリッチ化（特にRound 1で「何かに見える」を保証）
  - シーン数を大幅増（40-50種）
- **v9: AI Artモード — Mistral APIによるSVGアート生成**
  - 新エンドポイント `POST /api/generate-svg`（`mistral-large-latest` 使用）
  - StartScreenにアートモード切り替え: "Classic"（48手書きシーン）vs "AI Script" / "AI Scene"（Mistral生成）
  - 2つのAIモード: Script（JSコード→SVG）とJSON（シーン記述→SVG）
  - プロンプトベースのcoherence制御（抽象度をプロンプトで指示）
  - SVGバリデーション＆サニタイズ（dangerouslySetInnerHTML経由のXSS防止）
  - API障害時は自動的にClassicシーンにフォールバック
  - リモートモード: ホストがSVGを生成しPartyKit WebSocket経由で配布
  - LLMによるテーマ自由選択（固定テーマリスト廃止）、`previousThemes`で重複回避
  - ラウンド単位生成＋バックグラウンド先読み（ラウンドN中にN+1を生成）
- **v10: AI Script専用化 — ClassicとAI Sceneモードを廃止**
  - StartScreenとRoomLobbyからモード選択UIを削除 — AI Scriptが唯一のモード
  - `ArtMode` 型を `'classic' | 'ai-script' | 'ai-json'` → `'ai-script'` に縮小
  - Classicモードの分岐をすべて削除（`generateParams`のみのパスなし）
  - AI Scene（JSON）モードを削除 — `json-svg-renderer`のインポートも除去
  - スタート画面マウント時にラウンド1の画像を事前生成（ユーザーが"One Shot!"を押す前にバックグラウンドで先読み開始）
  - リスタート時にもラウンド1の先読みを即座に再開
- **v11: オンラインプレイのUX改善**
  - **遅延アート読み込み**: `start_round` をフォールバックパラメータで即送信、ゲーム画面でローディング表示、AI画像は新プロトコル `update_round_art` / `round_art_updated` で後から配信
  - AI生成失敗時はホストがクラシックシーンSVGをレンダリングし `update_round_art` でフォールバック送信
  - `startingRef` ガードでスタートボタンの二重クリックを防止
  - **ゲスト待機状態**: ラウンド結果画面でゲストには機能しない「次のラウンドへ」ボタンの代わりに「対戦相手を待っています...」メッセージを表示
  - **Game Over画面整理**: 「プレイヤー1 & プレイヤー2」サブタイトルを削除、履歴サムネイルサイズを縮小（48→32px）
  - **AbstractArtサイズ制約修正**: コンテナdivに `width`/`height` + `overflow: hidden` を適用、CSS `.art-container svg { width: 100%; height: 100% }` でAI生成SVGをコンテナにフィット
- **v12: シェア＆保存改善**
  - **シェアテキストにゲームURL追加**: `GAME_URL` 定数をシェアメッセージに付加（`share.ts` の `buildShareText`）
  - **SVG長押し保存**: `AbstractArt` を `dangerouslySetInnerHTML` の div から `<img>` タグ + `data:image/svg+xml` URI に変更 — モバイルのネイティブ長押しで画像保存・コピーが可能に

---

## 体験フロー

```
[スタート画面]
  ニックネーム2人分を入力
  [One Shot!]

    ↓

[Round 1] coherence高め（何かに見える絵）
  抽象画がドンと表示
  2人が「何に見える？」を入力
  → 一致判定

  🎯 一致！ → Round 2へ
  ❌ 不一致 → ゲーム終了、結果画面へ

    ↓

[Round 2] 少し抽象的に
  新しい抽象画が表示
  2人が「何に見える？」を入力
  → 一致判定

  🎯 一致！ → Round 3へ
  ❌ 不一致 → ゲーム終了、結果画面へ

    ↓

[Round 3+] さらに抽象的に...
  （繰り返し。ラウンドが進むほど難しくなる）

    ↓

[結果画面]
  連続一致回数
  各ラウンドの絵と2人の回答一覧
  AIコメント
  [シェアする] [もう1回!]
```

---

## 確定事項

### 体験設計
- **プロフィール質問もニックネームも無し** — ゲーム開始はボタン1タップ
- 固定ラベル「プレイヤー1」「プレイヤー2」（i18nで管理）
- 毎ラウンド: 抽象画表示 → 2人が自由テキスト入力 → LLMが一致判定
- 一致 → 次のラウンド、不一致 → ゲーム終了
- **連続一致回数**がスコア（数値スコア0-100は出さない）
- ラウンドごとに抽象度が上がり、一致が難しくなる

### 難易度カーブ

```
Round 1: coherence 0.9 — かなり何かに見える（風景、物体が浮かぶ）
Round 2: coherence 0.7 — まあ何かに見える（解釈は分かれ始める）
Round 3: coherence 0.5 — 曖昧（複数の解釈が可能）
Round 4: coherence 0.3 — かなり抽象的（意見が割れやすい）
Round 5+: coherence 0.1 — ほぼカオス（一致したら奇跡）
```

### ビジュアル生成
- **SVGシーン方式**: シーン定義 → フロントでSVG生成・表示
- 各シーンは構図＋配色＋描画ロジックを1セットで持つ
- coherenceパラメータで構図の明瞭さ↔崩しを制御
- **LLMはビジュアル生成に関与しない** → フロント完結（API節約）

### 一致判定
- LLM（Mistral API）が2人の回答の意味的近さを判定
- 完全一致: 「夕焼けの海」vs「サンセットビーチ」→ 一致
- 意味的近似: 「夏」vs「海」→ 一致（近い）
- 不一致: 「海」vs「山」→ 不一致
- 判定結果: "perfect" | "close" | "different" | "opposite"
  - perfect / close → 次のラウンドへ
  - different / opposite → ゲーム終了

### 2つのモード
- **ローカルモード**: 1画面で2人が操作。2つのマスク付き入力欄を同時表示（フォーカスで表示、ブラーでマスク）
- **リモートモード**: URL共有で別端末プレイ。自分の入力 + 相手の送信状態を表示

### 技術構成
- React SPA（Vite + TypeScript + Tailwind CSS）
- Vercel Functions でMistral API proxy
- **API は1本だけ**: `POST /api/judge`（一致判定のみ）
- ビジュアル生成はフロント完結（API不要）
- **モデル: `mistral-large-latest`**
- DB/KV/WebSocket **不要**
- ランキング: MVP後に検討

### シェア方法
- Twitter/X intent（テキスト + サイトURL）+ クリップボードコピー
- シェアテキストにゲームURL（`share.ts` の `GAME_URL` 定数）を含む
- シェアテキスト例: 「One Shotで5ラウンド連続一致した！ #OneShot\nhttps://one-shot-nine.vercel.app」

### AIコメント
- 結果画面でのみ表示
- ラウンド数に応じたコメント
- カジュアル・ユーモア寄り

---

## 画面構成

```
【スタート画面】
┌──────────────────────────┐
│                           │
│        ONE SHOT           │
│   同じものが、見えるか。    │
│                           │
│  Player 1: [ニックネーム]  │
│  Player 2: [ニックネーム]  │
│                           │
│        [One Shot!]        │
│                           │
│    [URLを作って送る]       │
└──────────────────────────┘

【ゲーム画面（各ラウンド）】
┌──────────────────────────┐
│  Round 3          🎯🎯    │
│                           │
│  ┌────────────────────┐  │
│  │                    │  │
│  │   [抽象画 SVG]      │  │
│  │                    │  │
│  └────────────────────┘  │
│                           │
│  これ、何に見える？          │
│                           │
│  Player 1: [          ]   │
│  Player 2: [          ]   │
│                           │
│        [答え合わせ！]       │
└──────────────────────────┘

【ラウンド結果（一致時）】
┌──────────────────────────┐
│                           │
│  🎯 見えてる！              │
│                           │
│  Player 1: 「夕焼けの海」  │
│  Player 2: 「夕暮れのビーチ」│
│                           │
│  → 次はもっと難しくなるよ   │
│                           │
│      [次のラウンドへ]       │
└──────────────────────────┘

【ラウンド結果（不一致時）→ ゲーム終了】
┌──────────────────────────┐
│                           │
│  💥 ここまで！              │
│                           │
│  Player 1: 「炎」          │
│  Player 2: 「クジラ」       │
│                           │
│      [結果を見る]           │
└──────────────────────────┘

【最終結果画面】
┌──────────────────────────┐
│                           │
│  🎯 × 4 連続一致！         │
│                           │
│  Round 1: 🎯              │
│  [絵] A:「山」 B:「富士山」  │
│                           │
│  Round 2: 🎯              │
│  [絵] A:「夜空」 B:「星」   │
│                           │
│  Round 3: 🎯              │
│  [絵] A:「海」 B:「波」     │
│                           │
│  Round 4: 🎯              │
│  [絵] A:「花畑」 B:「春」   │
│                           │
│  Round 5: 💥              │
│  [絵] A:「炎」 B:「クジラ」  │
│                           │
│  AIコメント:               │
│  「4連続はかなりすごい！     │
│   Round 3の海と波なんて     │
│   もはやテレパシーでしょw    │
│   2人で海行ったら最高に     │
│   楽しそう。行ったことある？」│
│                           │
│  [シェアする] [もう1回!]    │
└──────────────────────────┘
```

---

## API設計

### `POST /api/judge`

2人の回答の一致を判定し、コメントを生成。

```
Request:
{
  round: number,
  nicknameA: string,
  nicknameB: string,
  guessA: string,
  guessB: string,
  history: [
    { round: 1, guessA: "山", guessB: "富士山", match: "close" },
    ...
  ]
}

Response:
{
  match: "perfect" | "close" | "different" | "opposite",
  comment: string,
  isFinal: boolean
}
```

**LLMへのsystem prompt:**
```
あなたは2人の相性ゲーム「One Shot」のジャッジです。

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
- isFinal=true（ゲーム終了時）の場合のみ:
  - 全体を振り返る総括コメント（2-3文）
  - 会話のきっかけになる質問を1つ含む

## 出力ルール
- JSONだけを出力（```で囲まない、説明テキストなし）
- { "match": "...", "comment": "..." } の形式
```

**user messageのフォーマット:**
```
Round {round}

Player 1「{nicknameA}」の回答: {guessA}
Player 2「{nicknameB}」の回答: {guessB}

これまでの履歴:
{history（あれば）}

{isFinal ? "これがゲーム終了のラウンドです。全体の振り返りコメントをお願いします。" : ""}
```

### `POST /api/generate-svg`

Mistral APIを使って1ラウンド分の抽象SVGアートワークを生成する。「AI Art」モードで使用。
LLMが毎回自由にテーマを選択し、`previousThemes`で重複を回避する。

```
Request:
{
  mode: "script",               // JSコード→SVG（唯一のモード）
  coherence: number,            // 0.0-1.0、抽象度を制御
  previousThemes?: string[],    // 使用済みテーマ（回避用）
  lang?: "en" | "ja"
}

Response:
{
  content: string,     // JSコード（フォールバック時は空文字列）
  fallback: boolean,   // 生成失敗時true、クライアントはClassicシーンを使用
  theme?: string       // LLMが選んだテーマラベル（2〜5語）
}
```

- モデル: `mistral-large-latest`
- Temperature: 0.9（高い創造性）
- max_tokens: 2048（1ラウンドのみ）
- SVG制約: viewBox 0 0 360 360、テキスト/script/イベントハンドラ禁止
- Coherenceマッピング:
  - 0.8+: はっきりと認識できるシーン
  - 0.6-0.8: やや抽象的、スタイライズ
  - 0.4-0.6: 曖昧、複数の解釈可能
  - 0.2-0.4: 高度に抽象的、断片的
  - <0.2: カオスな視覚ノイズ
- セキュリティ: SVGバリデーションで`<script>`、`on*`属性、`javascript:` URIを拒否
- バックグラウンド先読み: ラウンドN中にN+1を事前生成

---

## フロントエンド描画エンジン（SVGシーン方式）

### 設計思想

シーン＝「構図＋配色＋描画ロジック」を1セットにした描画テンプレート。
ラウンドごとにランダムにシーンを選択し、coherenceパラメータで構図の明瞭さを制御する。

- Round 1（coherence 0.9）: シーンの構図がはっきり見える → 「あ、山だ」
- Round 5（coherence 0.1）: 構図が崩壊 → 「何これw」

SVG を採用する理由:
- 宣言的に構図を記述でき、シーン追加が容易
- 座標・パラメータにジッターを加えるだけでcoherenceの崩しが実現できる
- SVGフィルタ（feTurbulence, feGaussianBlur, feDisplacementMap）でにじみ・歪みを表現可能
- DOMとして扱えるのでReactとの統合がスムーズ

### コア型定義

```typescript
// types.ts

interface VisualParams {
  seed: number;           // ランダムシード（再現性のため）
  coherence: number;      // 0.0-1.0（ラウンドに応じて下がる）
  sceneId: string;        // 選択されたシーンのID
}

interface Scene {
  id: string;             // ユニークID（例: "fuji-moonlight"）
  name: string;           // 表示名（デバッグ用）
  category: SceneCategory;
  render: (params: SceneRenderParams) => string;
}

interface SceneRenderParams {
  width: number;          // SVG幅（px）
  height: number;         // SVG高さ（px）
  seed: number;
  coherence: number;
  rng: () => number;      // seeded random
}

type SceneCategory =
  | "landscape"    // 風景系（山、海、砂漠、草原…）
  | "sky"          // 空・天体系（月夜、夕焼け、オーロラ、星空…）
  | "water"        // 水系（川、滝、湖、雨…）
  | "organic"      // 有機物系（花、樹木、炎、羽…）
  | "structure"    // 構造物系（塔、橋、階段、門…）
  | "abstract"     // 抽象幾何系（渦巻き、同心円、万華鏡…）
```

### シーン選択ロジック

```typescript
// scene-selector.ts

function generateParams(round: number, previousSceneIds: string[], scenes: Scene[]): VisualParams {
  const seed = Math.floor(Math.random() * 100000);
  const rng = seededRandom(seed);
  const coherence = Math.max(0.1, 1.0 - (round - 1) * 0.2);

  // 直前2ラウンドと同じシーン、同じカテゴリを避ける
  const scene = selectScene(rng, previousSceneIds, scenes);

  return { seed, coherence, sceneId: scene.id };
}

function selectScene(rng: RNG, excludeIds: string[], scenes: Scene[]): Scene {
  const pool = scenes.filter(s => !excludeIds.includes(s.id));
  // カテゴリも偏らないよう、直前と同カテゴリも除外
  return pool[Math.floor(rng() * pool.length)];
}
```

### SVG描画レイヤー構造（全シーン共通）

すべてのシーンは以下の4レイヤーで構成される。

```
Layer 1: 背景（グラデーション、放射状、単色）
  → シーンの「空気感」を決める。coherenceが下がると色境界がぼやける

Layer 2: 主形状（シルエット、稜線、円形など）
  → シーンの「何に見えるか」を決める核。coherenceが下がると形が崩れる

Layer 3: テクスチャ（SVGフィルタによるにじみ・ノイズ）
  → coherenceが下がると強くなり、主形状を覆い隠す

Layer 4: アクセント（光源、ハイライト、グロウ）
  → coherenceが高いと月・太陽などの目印になる。低いと歪む
```

### coherenceによる崩し方（全シーン共通ルール）

```
coherence: 0.9（Round 1）
  主形状  → シーンの構図がはっきりわかる
  座標    → ジッターほぼゼロ
  フィルタ → feTurbulence弱、feGaussianBlur最小
  パレット → シーン定義どおり、2-3色で統一
  → 「あ、山だ」「海っぽい」と多くの人が同じものを見る

coherence: 0.7（Round 2）
  主形状  → 認識できるが、やや曖昧
  座標    → 制御点に小さなジッター追加
  フィルタ → にじみが出始める
  パレット → 1-2色追加、やや逸脱
  → 「山…かな？丘かも」レベル

coherence: 0.5（Round 3）
  主形状  → 痕跡はあるが別解釈も可能
  座標    → ジッター中程度
  フィルタ → テクスチャが存在感を持つ
  パレット → 色相差が広がる、意外な色が混入
  → 「波にも見えるし、砂漠にも見える」レベル

coherence: 0.3（Round 4）
  主形状  → 元のシーンはほぼ判別不能
  座標    → 制御点が大きく暴れる
  フィルタ → 支配的、形を覆い隠す
  パレット → 不調和、補色が衝突
  → 「何か…雰囲気は感じるけど…」レベル

coherence: 0.1（Round 5+）
  主形状  → 完全崩壊
  座標    → 最大ジッター
  フィルタ → 最大
  パレット → カオス
  → 「もう雰囲気で答えるしかないw」レベル
```

### coherence崩しの実装パターン

```typescript
// coherence-utils.ts

// === 座標ジッター ===
// coherenceが下がるほど座標がランダムにズレる
function jitter(value: number, coherence: number, rng: RNG, maxOffset: number): number {
  const noise = (rng() - 0.5) * 2 * maxOffset * (1.0 - coherence);
  return value + noise;
}

// === パスポイントの崩し ===
// ベジェ曲線の制御点にジッターを適用
function distortPath(points: Point[], coherence: number, rng: RNG): Point[] {
  return points.map(p => ({
    x: jitter(p.x, coherence, rng, 50),
    y: jitter(p.y, coherence, rng, 50),
  }));
}

// === SVGフィルタ生成 ===
// coherenceに応じたfeTurbulence + feDisplacementMap
function buildDistortionFilter(coherence: number, filterId: string, seed: number): string {
  const turbFreq = lerp(0.0, 0.04, 1.0 - coherence);   // 0（なし）〜 0.04（激しい）
  const turbOctaves = Math.ceil(lerp(1, 5, 1.0 - coherence));
  const dispScale = lerp(0, 60, 1.0 - coherence);       // 0（なし）〜 60（大きく歪む）
  const blurRadius = lerp(0, 8, 1.0 - coherence);

  return `
    <filter id="${filterId}" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise"
        baseFrequency="${turbFreq}"
        numOctaves="${turbOctaves}"
        seed="${seed}"
        result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise"
        scale="${dispScale}"
        xChannelSelector="R" yChannelSelector="G" />
      <feGaussianBlur stdDeviation="${blurRadius}" />
    </filter>
  `;
}

// === 色の崩し ===
// coherenceが下がると、パレットに異質な色を混入
function distortPalette(
  baseColors: string[],
  coherence: number,
  rng: RNG
): string[] {
  if (coherence > 0.7) return baseColors;

  const mutated = [...baseColors];
  const extraCount = Math.floor((1.0 - coherence) * 3);
  for (let i = 0; i < extraCount; i++) {
    const randomHue = Math.floor(rng() * 360);
    mutated.push(`hsl(${randomHue}, ${50 + rng() * 30}%, ${30 + rng() * 40}%)`);
  }
  return mutated;
}

// === ユーティリティ ===
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

function seededRandom(seed: number): () => number { /* ... */ }
```

### シーン定義フォーマット

各シーンは以下の構造で定義する。
`render` 関数がSVG文字列を返す。coherenceに応じた崩しは共通ユーティリティを使う。

```typescript
// scenes/fuji-moonlight.ts

import { Scene, SceneRenderParams } from '../types';
import { jitter, distortPath, buildDistortionFilter, distortPalette } from '../coherence-utils';

export const fujiMoonlight: Scene = {
  id: "fuji-moonlight",
  name: "月夜の富士",
  category: "landscape",

  render({ width: W, height: H, seed, coherence, rng }: SceneRenderParams): string {
    const palette = distortPalette(
      ["#1B3A5C", "#0D1B2A", "#2C2C2C", "#C9A959", "#F5F0E8"],
      coherence, rng
    );
    const filterId = `distort-${seed}`;
    const filter = buildDistortionFilter(coherence, filterId);

    // --- Layer 1: 背景（夜空のグラデーション）---
    const horizonY = jitter(H * 0.55, coherence, rng, H * 0.15);

    // --- Layer 2: 主形状（山のシルエット）---
    // 三角形ベースの稜線。左右非対称、右肩やや下がり
    const peakX = jitter(W * 0.45, coherence, rng, W * 0.1);
    const peakY = jitter(H * 0.2, coherence, rng, H * 0.1);
    const ridgePoints = distortPath([
      { x: 0, y: horizonY },
      { x: W * 0.2, y: horizonY - H * 0.05 },
      { x: peakX, y: peakY },
      { x: W * 0.7, y: horizonY - H * 0.03 },
      { x: W, y: horizonY + H * 0.02 },
    ], coherence, rng);

    // --- Layer 3: テクスチャ（SVGフィルタで適用）---
    // filterをシルエットグループに適用

    // --- Layer 4: アクセント（月）---
    const moonX = jitter(W * 0.78, coherence, rng, W * 0.1);
    const moonY = jitter(H * 0.15, coherence, rng, H * 0.08);
    const moonR = jitter(25, coherence, rng, 10);
    const showMoon = coherence > 0.5 || rng() > 0.7;

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
        <defs>
          ${filter}
          <linearGradient id="sky-${seed}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${palette[1]}" />
            <stop offset="${(horizonY / H * 100).toFixed(1)}%" stop-color="${palette[0]}" />
          </linearGradient>
          <linearGradient id="ground-${seed}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${palette[2]}" />
            <stop offset="100%" stop-color="${palette[1]}" />
          </linearGradient>
          <radialGradient id="moon-glow-${seed}" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="${palette[4]}" stop-opacity="0.9" />
            <stop offset="100%" stop-color="${palette[3]}" stop-opacity="0" />
          </radialGradient>
        </defs>

        <!-- Layer 1: 背景 -->
        <rect width="${W}" height="${horizonY}" fill="url(#sky-${seed})" />
        <rect y="${horizonY}" width="${W}" height="${H - horizonY}" fill="url(#ground-${seed})" />

        <!-- Layer 2: 山のシルエット -->
        <g filter="url(#${filterId})">
          <path d="${ridgePointsToPath(ridgePoints, W, H)}"
                fill="${palette[2]}" opacity="0.9" />
        </g>

        <!-- Layer 3: テクスチャオーバーレイ -->
        <!-- feTurbulenceベースのノイズ矩形（coherence低で不透明度UP） -->
        <rect width="${W}" height="${H}" filter="url(#${filterId})"
              fill="${palette[0]}" opacity="${((1.0 - coherence) * 0.3).toFixed(2)}" />

        <!-- Layer 4: 月 -->
        ${showMoon ? `
          <circle cx="${moonX}" cy="${moonY}" r="${moonR * 2.5}"
                  fill="url(#moon-glow-${seed})" />
          <circle cx="${moonX}" cy="${moonY}" r="${moonR}"
                  fill="${palette[4]}" opacity="0.85" />
        ` : ''}
      </svg>
    `;
  }
};

// パス変換ヘルパー
function ridgePointsToPath(points: Point[], W: number, H: number): string {
  // pointsからベジェ曲線パスを生成し、下端で閉じる
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx = (prev.x + curr.x) / 2;
    d += ` Q ${cpx} ${prev.y} ${curr.x} ${curr.y}`;
  }
  d += ` L ${W} ${H} L 0 ${H} Z`;
  return d;
}
```

### シーン一覧（40-50種）

以下のシーンを実装する。各シーンは上記フォーマットに従い、個別ファイルで定義。

#### landscape（風景系）
| ID | 名前 | 構図概要 |
|---|---|---|
| `fuji-moonlight` | 月夜の富士 | 三角稜線＋上空に月。夜空の藍→墨グラデ |
| `rolling-hills` | 連なる丘 | 2-3層の緩やかな稜線が重なる。緑〜茶のレイヤー |
| `desert-dunes` | 砂漠の砂丘 | 波打つ曲線が水平に連なる。金〜橙〜赤茶 |
| `snowy-peak` | 雪山 | 鋭い三角稜線＋白いハイライト。青白い空 |
| `volcanic-island` | 火山島 | 中央に急峻なシルエット＋下方に水平線。暗い赤〜灰 |
| `canyon` | 渓谷 | 左右から迫る崖のシルエット。中央に光の帯 |
| `plateau` | 台地 | 水平な台地の稜線＋広い空。赤土〜青空 |
| `rice-terraces` | 棚田 | 水平な曲線が段々に重なる。緑〜水色の反射 |

#### sky（空・天体系）
| ID | 名前 | 構図概要 |
|---|---|---|
| `sunset-horizon` | 水平線の夕焼け | 下1/3が暗い地面。上が橙→赤→紫のグラデ |
| `aurora-night` | オーロラの夜 | 暗い空に緑〜紫のカーテン状カーブ。下に雪原 |
| `starry-sky` | 星空 | 暗い空に散らばる小円（星）。下に稜線のシルエット |
| `crescent-moon` | 三日月 | 暗い空に細い弧。微かな光のハロ |
| `eclipse` | 日食 | 暗い背景に黒い円＋周囲にコロナのグロウ |
| `dawn-clouds` | 夜明けの雲 | 水平に流れる雲の帯。下からオレンジの光 |
| `meteor-shower` | 流星群 | 暗い空に斜めの光の線が複数。小さな星散り |
| `rainbow-mist` | 虹の霧 | 白っぽい霧の中に弧状の色帯。柔らかいパステル |

#### water（水系）
| ID | 名前 | 構図概要 |
|---|---|---|
| `calm-ocean` | 凪の海 | 水平線が中央。上が空、下が海面の微細な波 |
| `stormy-sea` | 荒波 | 大きなうねりの曲線が画面を占める。暗い青〜灰 |
| `waterfall` | 滝 | 中央に縦の白い帯。左右に暗い岩のシルエット |
| `river-bend` | 蛇行する川 | S字カーブの光る帯が画面を横切る |
| `frozen-lake` | 凍った湖 | 水平な平面＋微かなひび割れ模様。青白い色調 |
| `rain-window` | 雨の窓 | 縦方向の流れる線が複数。ぼやけた背景色 |
| `lotus-pond` | 蓮池 | 暗い水面に丸い形（葉）が散在。淡いピンクのアクセント |
| `deep-sea` | 深海 | 暗い青〜黒のグラデ。散在する小さな光点（発光生物） |

#### organic（有機物系）
| ID | 名前 | 構図概要 |
|---|---|---|
| `forest-silhouette` | 森のシルエット | 下方に不規則な縦長シルエットの集合。上に空 |
| `single-tree` | 一本の木 | 中央にY字型の枝分かれシルエット。広い空 |
| `bonfire` | 焚火 | 中央下から上に向かう不規則な先細り形。橙〜赤 |
| `feather` | 羽 | 中央に細長い楕円＋左右に斜めの線（羽毛） |
| `flower-bloom` | 花 | 中央に放射状の楕円（花弁）。暖色系 |
| `coral-reef` | 珊瑚礁 | 下方から上に枝分かれする不規則形状。暖色〜紫 |
| `dandelion` | タンポポの綿毛 | 中央から放射する細い線。先端に小さな円 |
| `vine-tangle` | 蔓の絡まり | 曲線が複雑に交差。緑〜茶 |

#### structure（構造物系）
| ID | 名前 | 構図概要 |
|---|---|---|
| `tower-spire` | 塔 | 中央に細く高い三角形。上に光源 |
| `bridge-arch` | アーチ橋 | 水平線上に半円のアーチ。下に水面の反射 |
| `torii-gate` | 鳥居 | 中央に門の形（2本の柱＋上の横棒）。背後に光 |
| `spiral-staircase` | 螺旋階段 | 中央に渦巻き状の曲線。上に光源 |
| `lighthouse` | 灯台 | 右寄りに細長いシルエット＋上方に放射状の光 |
| `ancient-gate` | 古代の門 | 中央に台形の空間。左右に暗い壁面 |
| `stone-circle` | ストーンサークル | 弧状に並ぶ縦長の矩形シルエット。中央に空間 |
| `suspension-bridge` | 吊り橋 | カテナリー曲線＋垂直線。水平に伸びる |

#### abstract（抽象幾何系）
| ID | 名前 | 構図概要 |
|---|---|---|
| `concentric-eye` | 同心円（目） | 中央に同心円。最内に小円（瞳孔）。暗い背景 |
| `spiral-vortex` | 渦巻き | 中央から外に広がるアルキメデス螺旋 |
| `kaleidoscope` | 万華鏡 | 6方向の対称パターン。中央から放射状 |
| `wave-pattern` | 波紋 | 中央から広がる同心楕円。水面の色 |
| `yin-yang` | 陰陽 | S字曲線で二分割。対照的な2色 |
| `infinity-loop` | ∞ | 8の字の滑らかな曲線。背景にグロウ |
| `fractal-branch` | フラクタル枝 | Y字の再帰分岐。自然物にも幾何にも見える |
| `prism-light` | プリズム | 三角形＋そこから広がる色帯。暗い背景 |

**合計: 48シーン**

### シーンレジストリ

```typescript
// scene-registry.ts

import { fujiMoonlight } from './scenes/fuji-moonlight';
import { rollingHills } from './scenes/rolling-hills';
// ... 全シーンをimport

export const SCENE_REGISTRY: Scene[] = [
  fujiMoonlight,
  rollingHills,
  // ... 全48シーン
];
```

### SVG表示コンポーネント

```typescript
// AbstractArt.tsx

interface Props {
  params: VisualParams;
  width?: number;
  height?: number;
  className?: string;
}

function AbstractArt({ params, width = 600, height = 400, className = '' }: Props) {
  const svgString = useMemo(() => {
    if (params.svgContent) return params.svgContent;
    const scene = SCENE_REGISTRY.find(s => s.id === params.sceneId);
    if (!scene) return '';
    const rng = seededRandom(params.seed);
    return scene.render({ width, height, seed: params.seed, coherence: params.coherence, rng });
  }, [params.svgContent, params.seed, params.coherence, params.sceneId, width, height]);

  const dataUri = useMemo(() => {
    if (!svgString) return '';
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
  }, [svgString]);

  if (!dataUri) return null;

  // <img>タグでモバイルのネイティブ長押し保存・コピーを有効化
  return (
    <img
      src={dataUri}
      width={width}
      height={height}
      className={`art-container ${className}`}
      style={{ width, height }}
      alt="Abstract art"
      draggable
    />
  );
}
```

### 結果画面での再描画

各ラウンドの `VisualParams` をstateに保持。
結果画面で過去ラウンドの絵を再描画する際は、保持した params + seededRandom で同じ絵を再現。

```typescript
interface RoundRecord {
  round: number;
  params: VisualParams;    // seed, coherence, sceneId → 再描画可能
  guessA: string;
  guessB: string;
  match: MatchResult;
  comment: string;
}
```

---

## リモートモード（Phase 3）— 実装済み

### アーキテクチャ

- **PartyKit WebSocketサーバー**: リアルタイムルーム管理
- **Vercel Functions**: Judge API（変更なし）
- ホストが `VisualParams` を生成し、両端末がシードRNGで同一アートを描画

### プロトコル

Client → Server: `join`, `start_round`, `update_round_art`, `submit_guess`, `judge_result`, `play_again`
Server → Client: `room_state`, `player_joined`, `round_start`, `round_art_updated`, `guess_received`, `both_guessed`, `round_result`, `game_over`, `opponent_disconnected/reconnected`

### フロー

```
1. Player 1（ホスト）がニックネーム入力、「ルームを作成」クリック
2. ルームコード生成（例: XK7M2N）、共有URLを表示
3. ホストはゲストの参加を待つ

--- Player 2が /room/XK7M2N を開く ---

4. Player 2（ゲスト）がニックネーム入力、「ルームに参加」クリック
5. 両者にRoomLobby表示（接続状態の緑インジケーター）
6. ホストが「ゲーム開始」クリック
   → `start_round` をフォールバックパラメータ（svgContentなし）で即送信
   → 両プレイヤーがゲーム画面に遷移、ローディング表示
   → ホストがバックグラウンドでAI画像を生成
   → 成功時: `update_round_art` でsvgContentを両者に配信
   → 失敗時: ホストがクラシックシーンSVGをレンダリングし `update_round_art` で送信

--- ゲーム中 ---

7. 両者が同じ抽象アートを閲覧（PartyKit経由でsvgContent配信）
8. 各自が自分のデバイスで回答を入力
9. サーバーが両方の回答を収集、ホストに通知
10. ホストが /api/judge を呼び、結果をPartyKit経由で配信
11. 両者にRoundResultScreen表示（ゲストは「次のラウンドへ」ボタンの代わりに待機メッセージ）
12. ホストが次ラウンドに進む（ステップ6と同じ遅延アート読み込み）
```

### 切断処理

- PartySocket が指数バックオフで自動再接続
- ルーム状態はPartyKit storage（Durable Objects）に永続化
- 再接続時、サーバーが完全な `room_state` を送信
- `hibernate: true` でコスト効率化
- **モバイル再接続**: `visibilitychange` リスナーでページがフォアグラウンドに復帰した際に `socket.reconnect()` を強制実行 — モバイルブラウザはバックグラウンドでのWebSocket再接続を制限/停止するため
- **手動リトライ**: 再接続画面に「Retry」ボタンを配置。自動再接続が停滞した場合に手動で再試行可能

### 主要ファイル

- `party/server.ts` — PartyKitサーバー（`party/logic.ts`のラッパー）
- `party/protocol.ts` — 共有WebSocketメッセージ型
- `src/lib/room.ts` — `useRoom`フック（PartySocketラッパー）
- `src/components/RemoteGame.tsx` — リモートモードオーケストレーター
- `src/components/RemoteGameScreen.tsx` — プレイヤー別入力画面

---

## v9: ニックネーム廃止 + 入力UI刷新

### 動機

ニックネーム入力はUX上の摩擦を増やすだけで実質的な価値がなかった。固定ラベル「プレイヤー1」「プレイヤー2」に置き換え。

### 設計からの変更点

#### 体験設計
- **ニックネーム入力なし** — ゲーム開始はボタン1タップのみ
- 固定ラベル: `t().player1Label` / `t().player2Label`（en: "Player 1"/"Player 2", ja: "プレイヤー1"/"プレイヤー2"）
- Judge APIは引き続き `nicknameA`/`nicknameB` を受け取る（プレイヤーラベルをハードコード）

#### ローカルモード — 2入力同時表示
- 4フェーズ状態遷移（`viewing` → `playerA` → `playerB` → `confirm`）を廃止し、2つの `<textarea rows={1}>` を常時表示
- **`<textarea>` を `<input>` の代わりに使用**: Android Chromeは `<input>` の `autoComplete="off"` を無視し、IMEキーボード上にパスワード・クレカ・住所の候補バーを表示する。`<textarea>` はブラウザの自動補完UIを表示しない。改行は `onChange` で除去。
- **フォーカスベースマスキング**: CSS `-webkit-text-security: disc` でフォーカスが外れた入力をドット表示。フォーカス中はテキストが見える。相手の回答を隠しつつ、自分の入力は確認できる
- 送信ボタン（"One Shot!"）は両方の入力が非空の場合のみ有効
- 判定中: 両者の回答を表示 + 「判定中...」インジケーター
- **二重送信ガード**: `useRef<boolean>` で `submitGuesses` の並行呼び出しを防止。`useCallback` のクロージャ依存ではなく `stateRef` パターン（毎レンダーでrefを更新）で最新stateを読み取り

#### React StrictMode対応
- **原因**: React StrictModeは `setState` のupdater関数を2回呼び出す（不純なreducerの検出用）。updater内の副作用（API呼び出し、WebSocket送信）が2回実行され、サーバーへのメッセージが重複
- **影響箇所**: `LocalGame` と `RemoteGame` の `callJudge`（judgeGuesses API + judge_result送信）と `handleNextRound`（start_round送信）が `setState` updater内で副作用を実行していた
- **修正**: `stateRef` パターン — 毎レンダーで更新される `useRef` でクロージャなしに最新stateを取得。副作用（send、API呼び出し）を `setState` 外に移動。`judgingRef` booleanガードで判定の並行実行を防止

#### リモートモード — 2ボックス + 相手ステータス
- `RemoteGameScreen` はニックネームpropsの代わりに `myRole: 'host' | 'guest'` propを使用
- 自分のボックス: `<textarea rows={1}>` + OKボタン、「(あなた)」サフィックス付き
- 相手のボックス: 「回答待ち...」または「回答済み」ステータス表示
- **IMEガード**: Enter keydownで `e.nativeEvent.isComposing` をチェック。日本語IMEの変換確定Enterでフォーム送信されるのを防止
- 判定中: 両者の回答を表示（`revealedGuessA`/`revealedGuessB` stateから）

#### プロトコル変更
- `ClientMessage` join: `nickname` フィールド削除 → `{ type: 'join', role }`
- `ServerMessage` player_joined: `nickname` フィールド削除 → `{ type: 'player_joined', role }`
- `RoomSyncState`: `nicknameA: string` / `nicknameB: string` → `hasHost: boolean` / `hasGuest: boolean` に置き換え
- `handleJoin` が `player_joined` と `room_state` の両方をブロードキャスト — 参加者自身の `player_joined` が相手の参加と誤認され、共有リンクのあるWaitingScreenがスキップされるバグの修正。`room_state` が正式な状態ソース、`player_joined` は情報通知のみ

#### i18n変更
- 削除: `nickname`, `enterNickname`, `answerFrom(name)`, `dontLook(name)`, `nameWhatDoYouSee(name)`, `checkAnswers`, `opponentJoined(name)`（関数）, `waitingForAnswer(name)`（関数）
- 追加: `youSuffix`（"(You)"/"(あなた)"）, `submitted`（"Submitted"/"回答済み"）, `waitingForOpponentAnswer`（静的文字列）
- 変更: `opponentJoined` を補間関数から静的文字列に

#### 更新後の画面レイアウト

```
【スタート画面 — ローカル】
┌──────────────────────────┐
│                           │
│        ONE SHOT           │
│   同じものが、見えるか。    │
│                           │
│        [One Shot!]        │
│                           │
│         — or —            │
│      [ルームを作成]        │
└──────────────────────────┘

【ゲーム画面 — ローカル】
┌──────────────────────────┐
│  Round 1            xx    │
│                           │
│  ┌────────────────────┐  │
│  │   [抽象画 SVG]      │  │
│  └────────────────────┘  │
│                           │
│  プレイヤー1               │
│  [●●●●●●●●]  ← マスク    │
│                           │
│  プレイヤー2               │
│  [入力中...]  ← 見える     │
│                           │
│      [One Shot!]          │
└──────────────────────────┘

【ゲーム画面 — リモート】
┌──────────────────────────┐
│  Round 1            xx    │
│                           │
│  ┌────────────────────┐  │
│  │   [抽象画 SVG]      │  │
│  └────────────────────┘  │
│                           │
│  プレイヤー1 (あなた)      │
│  [夕焼け       ] [OK]     │
│                           │
│  プレイヤー2               │
│  [ 回答待ち...         ]   │
└──────────────────────────┘
```

---

## 開発優先順位

```
Phase 1 (最初の2-3時間): SVGシーンエンジンの実装・検証
  - 共通ユーティリティ実装（seededRandom, jitter, distortPath, buildDistortionFilter）
  - シーン定義フォーマットの確定
  - シーン3つを先行実装（最小検証セット）
    - "fuji-moonlight"（風景系）— 最も「何かに見える」を出しやすい
    - "calm-ocean"（水系）— 水平線＋波で構図バリエーション確認
    - "concentric-eye"（抽象系）— 非風景系の検証
  - coherence 0.9 / 0.5 / 0.1 で各シーンを確認
    → Round 1 (0.9) で「何かに見える」ならOK
    → Round 3 (0.5) で解釈が割れ始めればOK
    → Round 5 (0.1) で「わからんw」ならOK
  - 検証OKなら残りシーンを追加実装

Phase 2 (次の4-5時間): ローカルモードで動くもの
  - Vite + React + Tailwind セットアップ
  - スタート画面（ニックネーム入力）
  - ゲームループ（ラウンド進行）
  - SVG描画（ラウンドごとにcoherenceダウン）
  - 「何に見える？」入力UI
  - POST /api/judge（Vercel Functions → Mistral API）
  - ラウンド結果表示（一致/不一致）
  - 最終結果画面（履歴一覧 + AIコメント）
  ※ ここでデモ可能な状態にする

Phase 3 (次の2-3時間): リモートモード + シェア
  - Base64エンコード/デコード（ニックネーム）
  - URLパラメータ処理
  - SNSシェア（Twitter intent）
  - クリップボードコピー

Phase 4 (残り時間): 仕上げ
  - UI/UXブラッシュアップ
  - アニメーション（絵の出現、判定演出）
  - サウンド（一致/不一致時の効果音）
  - 残りシーンの追加実装
  - デモ準備
```
