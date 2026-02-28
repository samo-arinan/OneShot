import { runSceneContractTests } from './scene-contract'
import { sunsetHorizon } from '../../src/scenes/sky/sunset-horizon'
import { auroraNight } from '../../src/scenes/sky/aurora-night'
import { starrySky } from '../../src/scenes/sky/starry-sky'
import { crescentMoon } from '../../src/scenes/sky/crescent-moon'
import { eclipse } from '../../src/scenes/sky/eclipse'
import { dawnClouds } from '../../src/scenes/sky/dawn-clouds'
import { meteorShower } from '../../src/scenes/sky/meteor-shower'
import { rainbowMist } from '../../src/scenes/sky/rainbow-mist'

runSceneContractTests(sunsetHorizon)
runSceneContractTests(auroraNight)
runSceneContractTests(starrySky)
runSceneContractTests(crescentMoon)
runSceneContractTests(eclipse)
runSceneContractTests(dawnClouds)
runSceneContractTests(meteorShower)
runSceneContractTests(rainbowMist)
