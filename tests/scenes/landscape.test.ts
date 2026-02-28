import { runSceneContractTests } from './scene-contract'
import { rollingHills } from '../../src/scenes/landscape/rolling-hills'
import { desertDunes } from '../../src/scenes/landscape/desert-dunes'
import { snowyPeak } from '../../src/scenes/landscape/snowy-peak'
import { volcanicIsland } from '../../src/scenes/landscape/volcanic-island'
import { canyon } from '../../src/scenes/landscape/canyon'
import { plateau } from '../../src/scenes/landscape/plateau'
import { riceTerraces } from '../../src/scenes/landscape/rice-terraces'

runSceneContractTests(rollingHills)
runSceneContractTests(desertDunes)
runSceneContractTests(snowyPeak)
runSceneContractTests(volcanicIsland)
runSceneContractTests(canyon)
runSceneContractTests(plateau)
runSceneContractTests(riceTerraces)
