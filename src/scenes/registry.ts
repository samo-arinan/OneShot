import type { Scene } from '../types'

// landscape
import { fujiMoonlight } from './landscape/fuji-moonlight'
import { rollingHills } from './landscape/rolling-hills'
import { desertDunes } from './landscape/desert-dunes'
import { snowyPeak } from './landscape/snowy-peak'
import { volcanicIsland } from './landscape/volcanic-island'
import { canyon } from './landscape/canyon'
import { plateau } from './landscape/plateau'
import { riceTerraces } from './landscape/rice-terraces'

// sky
import { sunsetHorizon } from './sky/sunset-horizon'
import { auroraNight } from './sky/aurora-night'
import { starrySky } from './sky/starry-sky'
import { crescentMoon } from './sky/crescent-moon'
import { eclipse } from './sky/eclipse'
import { dawnClouds } from './sky/dawn-clouds'
import { meteorShower } from './sky/meteor-shower'
import { rainbowMist } from './sky/rainbow-mist'

// water
import { calmOcean } from './water/calm-ocean'
import { stormySea } from './water/stormy-sea'
import { waterfall } from './water/waterfall'
import { riverBend } from './water/river-bend'
import { frozenLake } from './water/frozen-lake'
import { rainWindow } from './water/rain-window'
import { lotusPond } from './water/lotus-pond'
import { deepSea } from './water/deep-sea'

// organic
import { forestSilhouette } from './organic/forest-silhouette'
import { singleTree } from './organic/single-tree'
import { bonfire } from './organic/bonfire'
import { feather } from './organic/feather'
import { flowerBloom } from './organic/flower-bloom'
import { coralReef } from './organic/coral-reef'
import { dandelion } from './organic/dandelion'
import { vineTangle } from './organic/vine-tangle'

// structure
import { towerSpire } from './structure/tower-spire'
import { bridgeArch } from './structure/bridge-arch'
import { toriiGate } from './structure/torii-gate'
import { spiralStaircase } from './structure/spiral-staircase'
import { lighthouse } from './structure/lighthouse'
import { ancientGate } from './structure/ancient-gate'
import { stoneCircle } from './structure/stone-circle'
import { suspensionBridge } from './structure/suspension-bridge'

// abstract
import { concentricEye } from './abstract/concentric-eye'
import { spiralVortex } from './abstract/spiral-vortex'
import { kaleidoscope } from './abstract/kaleidoscope'
import { wavePattern } from './abstract/wave-pattern'
import { yinYang } from './abstract/yin-yang'
import { infinityLoop } from './abstract/infinity-loop'
import { fractalBranch } from './abstract/fractal-branch'
import { prismLight } from './abstract/prism-light'

export const SCENE_REGISTRY: Scene[] = [
  // landscape (8)
  fujiMoonlight,
  rollingHills,
  desertDunes,
  snowyPeak,
  volcanicIsland,
  canyon,
  plateau,
  riceTerraces,
  // sky (8)
  sunsetHorizon,
  auroraNight,
  starrySky,
  crescentMoon,
  eclipse,
  dawnClouds,
  meteorShower,
  rainbowMist,
  // water (8)
  calmOcean,
  stormySea,
  waterfall,
  riverBend,
  frozenLake,
  rainWindow,
  lotusPond,
  deepSea,
  // organic (8)
  forestSilhouette,
  singleTree,
  bonfire,
  feather,
  flowerBloom,
  coralReef,
  dandelion,
  vineTangle,
  // structure (8)
  towerSpire,
  bridgeArch,
  toriiGate,
  spiralStaircase,
  lighthouse,
  ancientGate,
  stoneCircle,
  suspensionBridge,
  // abstract (8)
  concentricEye,
  spiralVortex,
  kaleidoscope,
  wavePattern,
  yinYang,
  infinityLoop,
  fractalBranch,
  prismLight,
]
