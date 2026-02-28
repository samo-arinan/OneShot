import { runSceneContractTests } from './scene-contract'
import { stormySea } from '../../src/scenes/water/stormy-sea'
import { waterfall } from '../../src/scenes/water/waterfall'
import { riverBend } from '../../src/scenes/water/river-bend'
import { frozenLake } from '../../src/scenes/water/frozen-lake'
import { rainWindow } from '../../src/scenes/water/rain-window'
import { lotusPond } from '../../src/scenes/water/lotus-pond'
import { deepSea } from '../../src/scenes/water/deep-sea'

runSceneContractTests(stormySea)
runSceneContractTests(waterfall)
runSceneContractTests(riverBend)
runSceneContractTests(frozenLake)
runSceneContractTests(rainWindow)
runSceneContractTests(lotusPond)
runSceneContractTests(deepSea)
