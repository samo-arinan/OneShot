import { runSceneContractTests } from './scene-contract'
import { forestSilhouette } from '../../src/scenes/organic/forest-silhouette'
import { singleTree } from '../../src/scenes/organic/single-tree'
import { bonfire } from '../../src/scenes/organic/bonfire'
import { feather } from '../../src/scenes/organic/feather'
import { flowerBloom } from '../../src/scenes/organic/flower-bloom'
import { coralReef } from '../../src/scenes/organic/coral-reef'
import { dandelion } from '../../src/scenes/organic/dandelion'
import { vineTangle } from '../../src/scenes/organic/vine-tangle'

runSceneContractTests(forestSilhouette)
runSceneContractTests(singleTree)
runSceneContractTests(bonfire)
runSceneContractTests(feather)
runSceneContractTests(flowerBloom)
runSceneContractTests(coralReef)
runSceneContractTests(dandelion)
runSceneContractTests(vineTangle)
