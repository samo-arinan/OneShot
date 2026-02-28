import { runSceneContractTests } from './scene-contract'
import { towerSpire } from '../../src/scenes/structure/tower-spire'
import { bridgeArch } from '../../src/scenes/structure/bridge-arch'
import { toriiGate } from '../../src/scenes/structure/torii-gate'
import { spiralStaircase } from '../../src/scenes/structure/spiral-staircase'
import { lighthouse } from '../../src/scenes/structure/lighthouse'
import { ancientGate } from '../../src/scenes/structure/ancient-gate'
import { stoneCircle } from '../../src/scenes/structure/stone-circle'
import { suspensionBridge } from '../../src/scenes/structure/suspension-bridge'

runSceneContractTests(towerSpire)
runSceneContractTests(bridgeArch)
runSceneContractTests(toriiGate)
runSceneContractTests(spiralStaircase)
runSceneContractTests(lighthouse)
runSceneContractTests(ancientGate)
runSceneContractTests(stoneCircle)
runSceneContractTests(suspensionBridge)
