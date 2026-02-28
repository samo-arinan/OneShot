import { spiralVortex } from '../../src/scenes/abstract/spiral-vortex'
import { kaleidoscope } from '../../src/scenes/abstract/kaleidoscope'
import { wavePattern } from '../../src/scenes/abstract/wave-pattern'
import { yinYang } from '../../src/scenes/abstract/yin-yang'
import { infinityLoop } from '../../src/scenes/abstract/infinity-loop'
import { fractalBranch } from '../../src/scenes/abstract/fractal-branch'
import { prismLight } from '../../src/scenes/abstract/prism-light'
import { runSceneContractTests } from './scene-contract'

runSceneContractTests(spiralVortex)
runSceneContractTests(kaleidoscope)
runSceneContractTests(wavePattern)
runSceneContractTests(yinYang)
runSceneContractTests(infinityLoop)
runSceneContractTests(fractalBranch)
runSceneContractTests(prismLight)
