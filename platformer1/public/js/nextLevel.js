import mapSwitcher, { mapPath } from "./scene_management.js"
import game from "./main.js"
export let current = 1
export let limit = 3

export default function NextLevel() {
    if (!game.maxEntity) return
    current++
    mapSwitcher(`maps/scene${current}.json`)
}






