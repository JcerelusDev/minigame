"use-strict"
import { animatedItem } from "./goal.js"
import player from "./player.js"
import { map, mapPath } from "./scene_management.js"
import { controller, jumpB } from "./controller.js"
import NextLevel from "./nextLevel.js"
const game = new Stage();

// game.fullScreen = true

//preload assets
let bg = game.preload("bg", "maps/composed-bg.png")
let platformBg = new Sprite(camera.x, camera.y, camera.width, camera.height)
platformBg.useImage(bg)

let bgMusic = game.preload("bg", "audio/landof8bit.mp3")
export let jumpEffect = game.preload("jump", "audio/retro-jump.mp3")


//collect ui
let X = get("body").className.includes("rotate-90") ? 260 : innerWidth / 2.5

let collectText = new UseText(" Collected  ---   Item(s)   :  ", player.itemTaken, 17, X, 10, "lavender")

let bgSound = new PlaySound(bgMusic, 0.1, "loop")

//entity container
export let entityContainers = []




export let uiContainer = document.createElement("div")
uiContainer.classList.add("ui-container")
get("body").appendChild(uiContainer)

let play = document.createElement('button')
play.classList.add("play")
play.innerHTML = 'Play'

export let nextGame = document.createElement("button")
nextGame.classList.add("next")
nextGame.innerHTML = "Next"
nextGame.style.zIndex = 9999


nextGame.onclick = function () {
    NextLevel()
    uiContainer.style.display = "none"
    this.style.display = "none"
    game.add(stage)
}

uiContainer.appendChild(play)
uiContainer.appendChild(nextGame)

play.onclick = function () {
    game.add(stage)
    collectText.visible = true
    bgSound.run()
    uiContainer.style.display = 'none'
    play.style.display = "none"
    if (screen.width <= 769) {
controller.container.style.display="block"
jumpB.container.style.display="block"
    }
}


game.update = () => {
    if (loader) {
        player.state()
    }

}

game.complexUpdate = () => {
    if (game.itemContainer) {
        for (let item of game.itemContainer) {
            animatedItem(item)
        }
    }

    collectText.update(player.itemTaken)

}


let baseUrl = "maps"
game.render = () => {
    if (loader) {

        let world = game.worldThroughCamera()
        game.renderBatch(platformBg, "background")
        game.setCam(player, world)
        if (mapPath == `${baseUrl}/scene1.json`) {
            map.renderLayer(data.layers[0], `${baseUrl}/another-world-tileset.png`)
            map.renderLayer(data.layers[1], `${baseUrl}/another-world-tileset.png`)
            game.renderBatch(player, 'sheet')
            map.renderLayer(data.layers[2], `${baseUrl}/another-world-tileset.png`)
            game.renderBatch(game.keys, 'sheet')
        }

        if (mapPath == `${baseUrl}/scene2.json`) {
            map.renderLayer(data.layers[0], `${baseUrl}/gothic-castle-background.png`)
            map.renderLayer(data.layers[1], `${baseUrl}/tileset.png`)
            map.renderLayer(data.layers[2], `${baseUrl}/gothic-castle-background.png`)
            game.renderBatch(player, 'sheet')
            game.renderBatch(game.burgers, 'sheet')
        }

        if (mapPath == `${baseUrl}/scene3.json`) {
            map.renderLayer(data.layers[0], `${baseUrl}/gothic-castle-tileset.png`)
            map.renderLayer(data.layers[1], `${baseUrl}/Tiles.png`)
            map.renderLayer(data.layers[2], `${baseUrl}/another-world-tileset.png`)
            game.renderBatch(player, 'sheet')
            game.renderBatch(game.croissants, 'sheet')
        }

    }

}


game.setAnimation(60)

export default game