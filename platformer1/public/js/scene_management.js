"use-strict"

import spawnKey, { spawnBurger, spawnCroissant } from "./goal.js"
import game from "./main.js"
import player from "./player.js"

let map, mapPath

if (screen.width <= 769) get('body').classList.add("rotate-90") /* used to detect wether you are on pc or mobile
to rotate the body to be playable on phone */

export function mapSwitcher(url) {
    mapPath = url
    if (game.itemContainer) game.itemContainer.splice(0, game.itemContainer.length)
    //game.overLay()

    //tracking item 
    player.itemTaken = 0

    if (url == "maps/scene1.json") {
        map = new tiledMap(mapPath, 16)
        player.x = 20
        player.y = 20
        map.load()
        game.setSize(320, 180);
        spawnKey(1000)
        game.itemContainer = game.keys // used to track item no matter what type it might be
    }

    if (url == "maps/scene2.json") {
        map = new tiledMap(mapPath, 16)
        player.x = 20
        player.y = 20
        map.load()
        game.setSize(320, 180);
        spawnBurger(1000)
        game.itemContainer = game.burgers
    }

    if (url == "maps/scene3.json") {
        map = new tiledMap(mapPath, 16)
        player.x = 150
        player.y = 20
        map.load()
        game.setSize(320, 180);
        spawnCroissant(1000)
        game.itemContainer = game.croissants
    }
}



export function initScene() {
    mapSwitcher("maps/scene1.json")

}


setTimeout(initScene, 1000)
window.mapPath = mapPath

export default mapSwitcher

export { map, mapPath }