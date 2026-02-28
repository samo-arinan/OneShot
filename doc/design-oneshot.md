# One Shot — Design Document (latest)

## Concept

Show the same abstract artwork to two players and ask "What does this look like?"
If they see the same thing, they advance to the next round. Each round, the image becomes more abstract.
How long can they keep matching?

**"One Shot" = One chance per round. Can you see the same thing?**

---

## Changelog

- v1-v4: Score-based compatibility test (profile input → SVG + score + comment)
- v5: Pivoted to "What does this look like?" format (profile input remained)
- v6: Full redesign as a game
  - Removed profile questions → nickname only
  - Round-based system (consecutive match challenge)
  - Difficulty curve (coherence decreases each round)
  - Visual generation moved to frontend (Canvas API)
  - Single API endpoint (judge only)
- v7: Switched drawing engine to motif-based approach (Canvas API)
- **v8: Complete overhaul to SVG scene-based drawing engine**
  - Canvas API → SVG
  - Removed motif + palette separation → unified as "scenes"
  - Enriched scene definitions (ensuring Round 1 images "look like something")
  - Expanded scene count significantly (40-50 types)
- **v9: AI Art mode — Mistral API generates SVG artwork**
  - New `POST /api/generate-svg` endpoint using `mistral-large-latest`
  - Art mode toggle on StartScreen: "Classic" (48 hardcoded scenes) vs "AI Script" / "AI Scene" (Mistral-generated)
  - Two AI modes: Script (JS code → SVG) and JSON (scene description → SVG)
  - Prompt-based coherence control (abstraction level encoded in prompt)
  - SVG validation & sanitization (XSS prevention for dangerouslySetInnerHTML)
  - Automatic fallback to classic scenes on API failure
  - Remote mode: host generates SVG and distributes via PartyKit WebSocket
  - Free theme selection by LLM (no fixed theme list), with `previousThemes` deduplication
  - Per-round generation with background prefetching (round N+1 generated while playing round N)

---

## Experience Flow

```
[Start Screen]
  Enter nicknames for 2 players
  [One Shot!]

    ↓

[Round 1] High coherence (recognizable image)
  Abstract artwork displayed prominently
  Both players enter "What does this look like?"
  → Match judgment

  Match! → Proceed to Round 2
  No match → Game over, go to results

    ↓

[Round 2] Slightly more abstract
  New abstract artwork displayed
  Both players enter "What does this look like?"
  → Match judgment

  Match! → Proceed to Round 3
  No match → Game over, go to results

    ↓

[Round 3+] Even more abstract...
  (Repeats. Gets harder with each round)

    ↓

[Results Screen]
  Consecutive match count
  Each round's artwork + both players' answers
  AI comment
  [Share] [Play again!]
```

---

## Decisions

### Experience Design
- **No profile questions, no nicknames** — game start is a single button tap
- Fixed "Player 1" / "Player 2" labels (from i18n)
- Each round: display abstract art → both players enter free text → LLM judges match
- Match → next round, no match → game over
- **Consecutive match count** is the score (no numeric 0-100 score)
- Abstraction increases each round, making matches harder

### Difficulty Curve

```
Round 1: coherence 0.9 — clearly looks like something (landscapes, objects come to mind)
Round 2: coherence 0.7 — somewhat recognizable (interpretations start to diverge)
Round 3: coherence 0.5 — ambiguous (multiple interpretations possible)
Round 4: coherence 0.3 — quite abstract (opinions likely to differ)
Round 5+: coherence 0.1 — near chaos (matching would be a miracle)
```

### Visual Generation
- **SVG scene-based approach**: scene definitions → frontend generates and displays SVG
- Each scene bundles composition + color palette + rendering logic as one unit
- Coherence parameter controls clarity ↔ distortion of composition
- **LLM is not involved in visual generation** → frontend-only (saves API calls)

### Match Judgment
- LLM (Mistral API) judges semantic similarity of both answers
- Exact match: "sunset over the sea" vs "sunset beach" → match
- Semantic proximity: "summer" vs "ocean" → match (close)
- Mismatch: "ocean" vs "mountain" → no match
- Judgment values: "perfect" | "close" | "different" | "opposite"
  - perfect / close → proceed to next round
  - different / opposite → game over

### Two Modes
- **Local mode**: 2 players on 1 screen. Two masked input fields side by side (focus to reveal, blur to mask)
- **Remote mode**: Share URL for separate device play. Each player sees own input + opponent submission status

### Tech Stack
- React SPA (Vite + TypeScript + Tailwind CSS)
- Vercel Functions for Mistral API proxy
- **Single API endpoint**: `POST /api/judge` (match judgment only)
- Visual generation is frontend-only (no API needed)
- **Model: `mistral-large-latest`**
- No DB / KV / WebSocket needed
- Leaderboard: to be considered post-MVP

### Sharing
- Twitter/X intent (text + site URL) + clipboard copy
- Share text example: "Matched 5 rounds in a row on One Shot! #OneShot"

### AI Comments
- Displayed only on the results screen
- Comments tailored to round count
- Casual, humorous tone

---

## Screen Layout

```
[Start Screen]
┌──────────────────────────┐
│                           │
│        ONE SHOT           │
│    Can you see the same   │
│        thing?             │
│                           │
│  Player 1: [nickname]     │
│  Player 2: [nickname]     │
│                           │
│        [One Shot!]        │
│                           │
│   [Create & share URL]    │
└──────────────────────────┘

[Game Screen (each round)]
┌──────────────────────────┐
│  Round 3            xx    │
│                           │
│  ┌────────────────────┐  │
│  │                    │  │
│  │  [Abstract SVG]    │  │
│  │                    │  │
│  └────────────────────┘  │
│                           │
│  What does this look like?│
│                           │
│  Player 1: [          ]   │
│  Player 2: [          ]   │
│                           │
│      [Check answers!]     │
└──────────────────────────┘

[Round Result (match)]
┌──────────────────────────┐
│                           │
│  You see it!              │
│                           │
│  Player 1: "sunset sea"   │
│  Player 2: "evening beach"│
│                           │
│  → Next one's harder...   │
│                           │
│      [Next round]         │
└──────────────────────────┘

[Round Result (no match) → Game Over]
┌──────────────────────────┐
│                           │
│  That's it!               │
│                           │
│  Player 1: "fire"         │
│  Player 2: "whale"        │
│                           │
│      [View results]       │
└──────────────────────────┘

[Final Results Screen]
┌──────────────────────────┐
│                           │
│  x4 consecutive matches!  │
│                           │
│  Round 1: match           │
│  [art] A:"mountain"       │
│        B:"Mt. Fuji"       │
│                           │
│  Round 2: match           │
│  [art] A:"night sky"      │
│        B:"stars"          │
│                           │
│  Round 3: match           │
│  [art] A:"ocean"          │
│        B:"waves"          │
│                           │
│  Round 4: match           │
│  [art] A:"flower field"   │
│        B:"spring"         │
│                           │
│  Round 5: no match        │
│  [art] A:"fire"           │
│        B:"whale"          │
│                           │
│  AI Comment:              │
│  "4 in a row is amazing!  │
│   Round 3 — ocean and     │
│   waves? Practically      │
│   telepathy! You two      │
│   should go to the beach  │
│   together. Ever been?"   │
│                           │
│  [Share] [Play again!]    │
└──────────────────────────┘
```

---

## API Design

### `POST /api/judge`

Judges whether two players' answers match and generates a comment.

```
Request:
{
  round: number,
  nicknameA: string,
  nicknameB: string,
  guessA: string,
  guessB: string,
  history: [
    { round: 1, guessA: "mountain", guessB: "Mt. Fuji", match: "close" },
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

**LLM system prompt:**
```
You are the judge for a perception game called "One Shot".

## Task
Two players were shown the same abstract artwork and asked "What does this look like?"
Compare their answers, judge the match level, and write a comment.

## Judgment Criteria
- "perfect": Essentially the same thing (same meaning despite different wording)
  e.g.: "sunset over the sea" and "sunset beach"
  e.g.: "cat" and "kitty"
- "close": Similar imagery (clear association)
  e.g.: "summer" and "ocean"
  e.g.: "sunset" and "autumn sky"
- "different": Completely different things
  e.g.: "ocean" and "library"
- "opposite": Opposite imagery (interesting contrast)
  e.g.: "quiet night" and "festival"

## Comment Rules
- Casual, humorous tone
- 1-2 sentences, concise
- For perfect/close: impressed/amazed ("Wow!" "Telepathy?")
- For different/opposite: positive spin ("That's interesting in its own way" "Opposites are hilarious")
- If round history exists, may reference the streak
- Only when isFinal=true (game over):
  - Retrospective summary comment (2-3 sentences)
  - Include one conversation-starter question

## Output Rules
- Output JSON only (no ``` wrapping, no explanatory text)
- Format: { "match": "...", "comment": "..." }
```

**User message format:**
```
Round {round}

Player 1 "{nicknameA}" answered: {guessA}
Player 2 "{nicknameB}" answered: {guessB}

History so far:
{history (if any)}

{isFinal ? "This is the game-ending round. Please provide a retrospective summary comment." : ""}
```

### `POST /api/generate-svg`

Generates one abstract SVG artwork per call using the Mistral API. Used in "AI Art" mode.
The LLM freely chooses a theme each round; `previousThemes` prevents repetition.

```
Request:
{
  mode: "script" | "json",     // script = JS code, json = scene description
  coherence: number,            // 0.0-1.0, controls abstraction level
  previousThemes?: string[],    // themes to avoid (already used)
  lang?: "en" | "ja"
}

Response:
{
  content: string,     // JS code or JSON scene (empty if fallback)
  fallback: boolean,   // true if generation failed, client should use classic scene
  theme?: string       // LLM-chosen theme label (2-5 words)
}
```

- Model: `mistral-large-latest`
- Temperature: 0.9 (high creativity)
- max_tokens: 2048 (single round)
- SVG constraints: viewBox 0 0 360 360, no text/script/event handlers
- Coherence mapping:
  - 0.8+: clearly recognizable scene
  - 0.6-0.8: somewhat abstract, stylized
  - 0.4-0.6: ambiguous, multiple interpretations
  - 0.2-0.4: highly abstract, fragmented
  - <0.2: chaotic visual noise
- Security: SVG validation rejects `<script>`, `on*` attributes, `javascript:` URIs
- Background prefetching: round N+1 is generated while the player is on round N

---

## Frontend Drawing Engine (SVG Scene System)

### Design Philosophy

A scene = "composition + palette + rendering logic" bundled as one drawing template.
Each round, a scene is randomly selected, and the coherence parameter controls composition clarity.

- Round 1 (coherence 0.9): Scene composition is clearly visible → "Oh, it's a mountain"
- Round 5 (coherence 0.1): Composition collapses → "What even is this lol"

Reasons for choosing SVG:
- Declarative composition description makes adding scenes easy
- Adding jitter to coordinates/parameters achieves coherence-based distortion
- SVG filters (feTurbulence, feGaussianBlur, feDisplacementMap) enable blur and warp effects
- As DOM elements, they integrate smoothly with React

### Core Type Definitions

```typescript
// types.ts

interface VisualParams {
  seed: number;           // Random seed (for reproducibility)
  coherence: number;      // 0.0-1.0 (decreases with rounds)
  sceneId: string;        // Selected scene ID
}

interface Scene {
  id: string;             // Unique ID (e.g., "fuji-moonlight")
  name: string;           // Display name (for debugging)
  category: SceneCategory;
  render: (params: SceneRenderParams) => string;
}

interface SceneRenderParams {
  width: number;          // SVG width (px)
  height: number;         // SVG height (px)
  seed: number;
  coherence: number;
  rng: () => number;      // seeded random
}

type SceneCategory =
  | "landscape"    // Landscapes (mountains, sea, desert, plains...)
  | "sky"          // Sky/celestial (moonlit night, sunset, aurora, starry sky...)
  | "water"        // Water (rivers, waterfalls, lakes, rain...)
  | "organic"      // Organic (flowers, trees, fire, feathers...)
  | "structure"    // Structures (towers, bridges, stairs, gates...)
  | "abstract"     // Abstract geometry (spirals, concentric circles, kaleidoscope...)
```

### Scene Selection Logic

```typescript
// scene-selector.ts

function generateParams(round: number, previousSceneIds: string[], scenes: Scene[]): VisualParams {
  const seed = Math.floor(Math.random() * 100000);
  const rng = seededRandom(seed);
  const coherence = Math.max(0.1, 1.0 - (round - 1) * 0.2);

  // Avoid same scene and same category as the last 2 rounds
  const scene = selectScene(rng, previousSceneIds, scenes);

  return { seed, coherence, sceneId: scene.id };
}

function selectScene(rng: RNG, excludeIds: string[], scenes: Scene[]): Scene {
  const pool = scenes.filter(s => !excludeIds.includes(s.id));
  // Also exclude same category as recent scenes to avoid bias
  return pool[Math.floor(rng() * pool.length)];
}
```

### SVG Drawing Layer Structure (common to all scenes)

All scenes are composed of the following 4 layers:

```
Layer 1: Background (gradient, radial, solid)
  → Sets the scene's "atmosphere". Color boundaries blur as coherence decreases

Layer 2: Main shape (silhouette, ridgeline, circles, etc.)
  → The core of "what it looks like". Shape distorts as coherence decreases

Layer 3: Texture (blur/noise via SVG filters)
  → Intensifies as coherence decreases, obscuring the main shape

Layer 4: Accent (light source, highlights, glow)
  → At high coherence, serves as landmarks (moon, sun, etc.). Distorts at low coherence
```

### Coherence Distortion Rules (common to all scenes)

```
coherence: 0.9 (Round 1)
  Main shape  → Scene composition is clearly recognizable
  Coordinates → Near-zero jitter
  Filters     → Weak feTurbulence, minimal feGaussianBlur
  Palette     → As defined by scene, unified 2-3 colors
  → Most people see the same thing: "Oh, a mountain" "Looks like the ocean"

coherence: 0.7 (Round 2)
  Main shape  → Recognizable but somewhat ambiguous
  Coordinates → Small jitter added to control points
  Filters     → Blur begins to appear
  Palette     → 1-2 extra colors, slight deviation
  → "A mountain... maybe? Could be a hill"

coherence: 0.5 (Round 3)
  Main shape  → Traces remain but alternative interpretations possible
  Coordinates → Moderate jitter
  Filters     → Texture becomes prominent
  Palette     → Hue range widens, unexpected colors appear
  → "Could be waves, could be a desert"

coherence: 0.3 (Round 4)
  Main shape  → Original scene nearly unidentifiable
  Coordinates → Control points shift dramatically
  Filters     → Dominant, obscuring shapes
  Palette     → Disharmonious, complementary colors clash
  → "Something... I can feel the vibe but..."

coherence: 0.1 (Round 5+)
  Main shape  → Complete collapse
  Coordinates → Maximum jitter
  Filters     → Maximum
  Palette     → Chaos
  → "Just going with my gut at this point lol"
```

### Coherence Distortion Implementation

```typescript
// coherence-utils.ts

// === Coordinate Jitter ===
// Lower coherence → more random coordinate displacement
function jitter(value: number, coherence: number, rng: RNG, maxOffset: number): number {
  const noise = (rng() - 0.5) * 2 * maxOffset * (1.0 - coherence);
  return value + noise;
}

// === Path Point Distortion ===
// Apply jitter to Bézier curve control points
function distortPath(points: Point[], coherence: number, rng: RNG): Point[] {
  return points.map(p => ({
    x: jitter(p.x, coherence, rng, 50),
    y: jitter(p.y, coherence, rng, 50),
  }));
}

// === SVG Filter Generation ===
// feTurbulence + feDisplacementMap scaled by coherence
function buildDistortionFilter(coherence: number, filterId: string, seed: number): string {
  const turbFreq = lerp(0.0, 0.04, 1.0 - coherence);   // 0 (none) – 0.04 (intense)
  const turbOctaves = Math.ceil(lerp(1, 5, 1.0 - coherence));
  const dispScale = lerp(0, 60, 1.0 - coherence);       // 0 (none) – 60 (heavy warp)
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

// === Color Distortion ===
// Lower coherence → foreign colors injected into palette
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

// === Utilities ===
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

function seededRandom(seed: number): () => number { /* ... */ }
```

### Scene Definition Format

Each scene is defined with the following structure.
The `render` function returns an SVG string. Coherence-based distortion uses the shared utilities.

```typescript
// scenes/fuji-moonlight.ts

import { Scene, SceneRenderParams } from '../types';
import { jitter, distortPath, buildDistortionFilter, distortPalette } from '../coherence-utils';

export const fujiMoonlight: Scene = {
  id: "fuji-moonlight",
  name: "Moonlit Fuji",
  category: "landscape",

  render({ width: W, height: H, seed, coherence, rng }: SceneRenderParams): string {
    const palette = distortPalette(
      ["#1B3A5C", "#0D1B2A", "#2C2C2C", "#C9A959", "#F5F0E8"],
      coherence, rng
    );
    const filterId = `distort-${seed}`;
    const filter = buildDistortionFilter(coherence, filterId);

    // --- Layer 1: Background (night sky gradient) ---
    const horizonY = jitter(H * 0.55, coherence, rng, H * 0.15);

    // --- Layer 2: Main shape (mountain silhouette) ---
    // Triangle-based ridgeline. Asymmetric, right shoulder slightly lower
    const peakX = jitter(W * 0.45, coherence, rng, W * 0.1);
    const peakY = jitter(H * 0.2, coherence, rng, H * 0.1);
    const ridgePoints = distortPath([
      { x: 0, y: horizonY },
      { x: W * 0.2, y: horizonY - H * 0.05 },
      { x: peakX, y: peakY },
      { x: W * 0.7, y: horizonY - H * 0.03 },
      { x: W, y: horizonY + H * 0.02 },
    ], coherence, rng);

    // --- Layer 3: Texture (applied via SVG filter) ---
    // Filter applied to silhouette group

    // --- Layer 4: Accent (moon) ---
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

        <!-- Layer 1: Background -->
        <rect width="${W}" height="${horizonY}" fill="url(#sky-${seed})" />
        <rect y="${horizonY}" width="${W}" height="${H - horizonY}" fill="url(#ground-${seed})" />

        <!-- Layer 2: Mountain silhouette -->
        <g filter="url(#${filterId})">
          <path d="${ridgePointsToPath(ridgePoints, W, H)}"
                fill="${palette[2]}" opacity="0.9" />
        </g>

        <!-- Layer 3: Texture overlay -->
        <!-- feTurbulence-based noise rect (opacity increases at low coherence) -->
        <rect width="${W}" height="${H}" filter="url(#${filterId})"
              fill="${palette[0]}" opacity="${((1.0 - coherence) * 0.3).toFixed(2)}" />

        <!-- Layer 4: Moon -->
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

// Path conversion helper
function ridgePointsToPath(points: Point[], W: number, H: number): string {
  // Generate Bézier curve path from points, closing at bottom edge
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

### Scene List (40-50 types)

The following scenes are implemented. Each scene follows the format above and is defined in its own file.

#### landscape (Landscapes)
| ID | Name | Composition |
|---|---|---|
| `fuji-moonlight` | Moonlit Fuji | Triangular ridgeline + moon above. Indigo-to-ink night sky gradient |
| `rolling-hills` | Rolling Hills | 2-3 layers of gentle ridgelines. Green-to-brown layers |
| `desert-dunes` | Desert Dunes | Undulating horizontal curves. Gold-to-orange-to-russet |
| `snowy-peak` | Snowy Peak | Sharp triangular ridgeline + white highlights. Blue-white sky |
| `volcanic-island` | Volcanic Island | Steep central silhouette + horizon line below. Dark red-to-gray |
| `canyon` | Canyon | Cliff silhouettes closing in from both sides. Light strip in center |
| `plateau` | Plateau | Flat plateau ridgeline + expansive sky. Red earth-to-blue sky |
| `rice-terraces` | Rice Terraces | Horizontal curves stacked in tiers. Green-to-light blue reflections |

#### sky (Sky / Celestial)
| ID | Name | Composition |
|---|---|---|
| `sunset-horizon` | Sunset Horizon | Bottom third is dark ground. Top is orange→red→purple gradient |
| `aurora-night` | Aurora Night | Green-to-purple curtain-like curves against dark sky. Snow field below |
| `starry-sky` | Starry Sky | Small circles (stars) scattered across dark sky. Ridgeline silhouette below |
| `crescent-moon` | Crescent Moon | Thin arc against dark sky. Faint halo glow |
| `eclipse` | Eclipse | Black circle on dark background + corona glow around it |
| `dawn-clouds` | Dawn Clouds | Horizontally flowing cloud bands. Orange light from below |
| `meteor-shower` | Meteor Shower | Multiple diagonal light streaks across dark sky. Scattered small stars |
| `rainbow-mist` | Rainbow Mist | Arc-shaped color bands in white mist. Soft pastels |

#### water (Water)
| ID | Name | Composition |
|---|---|---|
| `calm-ocean` | Calm Ocean | Horizon line centered. Sky above, subtle wave texture on ocean below |
| `stormy-sea` | Stormy Sea | Large undulating curves dominate the frame. Dark blue-to-gray |
| `waterfall` | Waterfall | Vertical white band in center. Dark rock silhouettes on sides |
| `river-bend` | River Bend | S-curve gleaming band crossing the frame |
| `frozen-lake` | Frozen Lake | Horizontal flat surface + faint crack patterns. Blue-white palette |
| `rain-window` | Rain on Window | Multiple vertical streaking lines. Blurred background colors |
| `lotus-pond` | Lotus Pond | Round shapes (leaves) scattered on dark water surface. Pale pink accents |
| `deep-sea` | Deep Sea | Dark blue-to-black gradient. Scattered small light points (bioluminescence) |

#### organic (Organic)
| ID | Name | Composition |
|---|---|---|
| `forest-silhouette` | Forest Silhouette | Cluster of irregular tall silhouettes at bottom. Sky above |
| `single-tree` | Single Tree | Y-shaped branching silhouette centered. Expansive sky |
| `bonfire` | Bonfire | Irregular tapering shape rising from bottom center. Orange-to-red |
| `feather` | Feather | Narrow ellipse centered + diagonal lines (barbs) on both sides |
| `flower-bloom` | Flower Bloom | Radial ellipses (petals) from center. Warm color palette |
| `coral-reef` | Coral Reef | Irregular branching shapes rising from bottom. Warm-to-purple |
| `dandelion` | Dandelion Puff | Thin lines radiating from center. Small circles at tips |
| `vine-tangle` | Vine Tangle | Complex intersecting curves. Green-to-brown |

#### structure (Structures)
| ID | Name | Composition |
|---|---|---|
| `tower-spire` | Tower Spire | Tall narrow triangle centered. Light source above |
| `bridge-arch` | Arch Bridge | Semicircular arch on horizon line. Water reflection below |
| `torii-gate` | Torii Gate | Gate shape centered (2 pillars + crossbar). Light behind |
| `spiral-staircase` | Spiral Staircase | Spiral curves in center. Light source above |
| `lighthouse` | Lighthouse | Narrow tall silhouette right of center + radial light beams above |
| `ancient-gate` | Ancient Gate | Trapezoidal opening centered. Dark walls on sides |
| `stone-circle` | Stone Circle | Tall rectangular silhouettes arranged in an arc. Open space in center |
| `suspension-bridge` | Suspension Bridge | Catenary curve + vertical lines. Extends horizontally |

#### abstract (Abstract Geometry)
| ID | Name | Composition |
|---|---|---|
| `concentric-eye` | Concentric Eye | Concentric circles centered. Small circle (pupil) innermost. Dark background |
| `spiral-vortex` | Spiral Vortex | Archimedean spiral expanding from center outward |
| `kaleidoscope` | Kaleidoscope | 6-way symmetric pattern. Radial from center |
| `wave-pattern` | Wave Pattern | Concentric ellipses expanding from center. Water-surface colors |
| `yin-yang` | Yin-Yang | S-curve divides into two halves. Contrasting 2 colors |
| `infinity-loop` | Infinity Loop | Smooth figure-eight curve. Background glow |
| `fractal-branch` | Fractal Branch | Recursive Y-shaped branching. Reads as both natural and geometric |
| `prism-light` | Prism Light | Triangle + color bands spreading from it. Dark background |

**Total: 48 scenes**

### Scene Registry

```typescript
// scene-registry.ts

import { fujiMoonlight } from './scenes/fuji-moonlight';
import { rollingHills } from './scenes/rolling-hills';
// ... import all scenes

export const SCENE_REGISTRY: Scene[] = [
  fujiMoonlight,
  rollingHills,
  // ... all 48 scenes
];
```

### SVG Display Component

```typescript
// AbstractArt.tsx

interface Props {
  params: VisualParams;
  width?: number;
  height?: number;
}

function AbstractArt({ params, width = 600, height = 400 }: Props) {
  const scene = SCENE_REGISTRY.find(s => s.id === params.sceneId);
  if (!scene) return null;

  const rng = seededRandom(params.seed);
  const svgString = scene.render({
    width, height,
    seed: params.seed,
    coherence: params.coherence,
    rng,
  });

  return (
    <div
      className="abstract-art"
      dangerouslySetInnerHTML={{ __html: svgString }}
    />
  );
}
```

### Re-rendering on Results Screen

Each round's `VisualParams` are held in state.
When re-rendering past rounds on the results screen, the stored params + seededRandom reproduce the same artwork.

```typescript
interface RoundRecord {
  round: number;
  params: VisualParams;    // seed, coherence, sceneId → reproducible
  guessA: string;
  guessB: string;
  match: MatchResult;
  comment: string;
}
```

---

## Remote Mode (Phase 3) — Implemented

### Architecture

- **PartyKit WebSocket server** for real-time room coordination
- **Vercel Functions** for judge API (unchanged)
- Host generates `VisualParams`, both devices render identical art via seeded RNG

### Protocol

Client → Server: `join`, `start_round`, `submit_guess`, `judge_result`, `play_again`
Server → Client: `room_state`, `player_joined`, `round_start`, `guess_received`, `both_guessed`, `round_result`, `game_over`, `opponent_disconnected/reconnected`

### Flow

```
1. Player 1 (Host) clicks "Create Room"
2. Room code generated (e.g. XK7M2N), displayed with shareable URL
3. Host waits for guest to join

--- Player 2 opens /room/XK7M2N ---

4. Player 2 (Guest) clicks "Join Room"
5. Both see RoomLobby with green connection indicators
6. Host clicks "Start Game"

--- During game ---

7. Both see same abstract art (same VisualParams via PartyKit)
8. Each enters own guess independently on their device
9. Server collects both guesses, notifies host
10. Host calls /api/judge, sends result through PartyKit
11. Both see RoundResultScreen
12. Host advances to next round (or game over)
```

### Disconnection Handling

- PartySocket auto-reconnects with exponential backoff
- Room state persisted in PartyKit storage (Durable Objects)
- On reconnect, server sends full `room_state`
- `hibernate: true` for cost efficiency

### Key Files

- `party/server.ts` — PartyKit server (wraps `party/logic.ts`)
- `party/protocol.ts` — Shared WebSocket message types
- `src/lib/room.ts` — `useRoom` hook (PartySocket wrapper)
- `src/components/RemoteGame.tsx` — Remote mode orchestrator
- `src/components/RemoteGameScreen.tsx` — Per-player input screen

---

## v9: Nickname Removal + Input Redesign

### Motivation

Nickname input added UX friction without real value. Removed entirely in favor of fixed "Player 1" / "Player 2" labels from i18n.

### Changes from Original Design

#### Experience Design
- **No nickname input** — game start is now a single button tap
- Fixed labels: `t().player1Label` / `t().player2Label` (en: "Player 1"/"Player 2", ja: "プレイヤー1"/"プレイヤー2")
- Judge API still receives `nicknameA`/`nicknameB` (hardcoded to player labels) for prompt formatting

#### Local Mode — Two Simultaneous Inputs
- Replaced the 4-phase state machine (`viewing` → `playerA` → `playerB` → `confirm`) with two always-visible `<input type="text">` fields
- **Focus-based masking**: CSS `-webkit-text-security: disc` hides text when input is blurred; visible while focused. Prevents opponent from reading the other's answer while allowing the typist to see their own input
- Submit button ("One Shot!") enabled when both inputs are non-empty
- When judging: both answers revealed + "Judging..." indicator
- **Double-submission guard**: `useRef<boolean>` prevents concurrent `submitGuesses` calls. Latest state read via `stateRef` pattern (ref updated every render) instead of `useCallback` closure deps

#### React StrictMode Compatibility
- **Root cause**: React StrictMode calls `setState` updater functions twice (to detect impure reducers). Any side effects (API calls, WebSocket sends) inside updaters execute twice, causing duplicate server messages
- **Affected patterns**: `callJudge` (judgeGuesses API + judge_result send) and `handleNextRound` (start_round send) in both `LocalGame` and `RemoteGame` had side effects inside `setState` updaters
- **Fix**: `stateRef` pattern — a `useRef` updated every render provides latest state without closures. Side effects (send, API calls) moved outside `setState`. `judgingRef` boolean guard prevents concurrent judge invocations

#### Remote Mode — Two-Box with Opponent Status
- `RemoteGameScreen` uses `myRole: 'host' | 'guest'` prop instead of nickname props
- Own box: `<input type="text">` + OK button with "(You)" suffix
- Opponent box: shows "Waiting..." or "Submitted" status indicator
- **IME guard**: `e.nativeEvent.isComposing` check on Enter keydown prevents Japanese IME composition-confirm from triggering form submission
- When judging: both answers revealed (from `revealedGuessA`/`revealedGuessB` state)

#### Protocol Changes
- `ClientMessage` join: removed `nickname` field → `{ type: 'join', role }`
- `ServerMessage` player_joined: removed `nickname` field → `{ type: 'player_joined', role }`
- `RoomSyncState`: replaced `nicknameA: string` / `nicknameB: string` with `hasHost: boolean` / `hasGuest: boolean`
- `handleJoin` now broadcasts both `player_joined` AND `room_state` — the joining player's own `player_joined` was being misinterpreted as an opponent joining, causing WaitingScreen (with share link) to be skipped. `room_state` provides authoritative truth; `player_joined` is informational only

#### i18n Changes
- Removed: `nickname`, `enterNickname`, `answerFrom(name)`, `dontLook(name)`, `nameWhatDoYouSee(name)`, `checkAnswers`, `opponentJoined(name)` (function), `waitingForAnswer(name)` (function)
- Added: `youSuffix` ("(You)"/"(あなた)"), `submitted` ("Submitted"/"回答済み"), `waitingForOpponentAnswer` (static string)
- Changed: `opponentJoined` from interpolation function to static string

#### Updated Screen Layouts

```
[Start Screen — Local]
┌──────────────────────────┐
│                           │
│        ONE SHOT           │
│    Can you see the same   │
│        thing?             │
│                           │
│        [One Shot!]        │
│                           │
│         — or —            │
│      [Create Room]        │
└──────────────────────────┘

[Game Screen — Local]
┌──────────────────────────┐
│  Round 1            xx    │
│                           │
│  ┌────────────────────┐  │
│  │   [Abstract SVG]    │  │
│  └────────────────────┘  │
│                           │
│  Player 1                 │
│  [●●●●●●●●]  ← masked    │
│                           │
│  Player 2                 │
│  [typing...]  ← visible   │
│                           │
│      [One Shot!]          │
└──────────────────────────┘

[Game Screen — Remote]
┌──────────────────────────┐
│  Round 1            xx    │
│                           │
│  ┌────────────────────┐  │
│  │   [Abstract SVG]    │  │
│  └────────────────────┘  │
│                           │
│  Player 1 (You)           │
│  [sunset       ] [OK]     │
│                           │
│  Player 2                 │
│  [ Waiting...         ]   │
└──────────────────────────┘
```

---

## Development Priority

```
Phase 1 (first 2-3 hours): SVG scene engine implementation & validation
  - Implement shared utilities (seededRandom, jitter, distortPath, buildDistortionFilter)
  - Finalize scene definition format
  - Implement 3 pilot scenes (minimum validation set)
    - "fuji-moonlight" (landscape) — easiest to achieve "looks like something"
    - "calm-ocean" (water) — horizon + waves to verify composition variation
    - "concentric-eye" (abstract) — validate non-landscape category
  - Verify each scene at coherence 0.9 / 0.5 / 0.1
    → Round 1 (0.9): "looks like something" = OK
    → Round 3 (0.5): interpretations start to diverge = OK
    → Round 5 (0.1): "no idea lol" = OK
  - If validation passes, implement remaining scenes

Phase 2 (next 4-5 hours): Working local mode
  - Vite + React + Tailwind setup
  - Start screen (nickname input)
  - Game loop (round progression)
  - SVG rendering (coherence decreases each round)
  - "What does this look like?" input UI
  - POST /api/judge (Vercel Functions → Mistral API)
  - Round result display (match/no match)
  - Final results screen (round history + AI comment)
  * Reach demo-ready state here

Phase 3 (next 2-3 hours): Remote mode + sharing
  - Base64 encode/decode (nicknames)
  - URL parameter handling
  - Social sharing (Twitter intent)
  - Clipboard copy

Phase 4 (remaining time): Polish
  - UI/UX refinement
  - Animations (artwork reveal, judgment effects)
  - Sound (match/no match sound effects)
  - Implement remaining scenes
  - Demo preparation
```
