import type { Scene } from '../types'
import { fujiMoonlight } from './landscape/fuji-moonlight'
import { calmOcean } from './water/calm-ocean'
import { concentricEye } from './abstract/concentric-eye'

export const SCENE_REGISTRY: Scene[] = [
  fujiMoonlight,
  calmOcean,
  concentricEye,
]
