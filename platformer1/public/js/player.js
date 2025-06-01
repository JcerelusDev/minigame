"use-strict"
import { current, limit } from "./nextLevel.js";
import { mapPath } from "./scene_management.js"
// import keys from "./goal.js";
import controlPlayer from './controller.js';
import game, { uiContainer, nextGame, msgBox } from "./main.js"

//preload
let baseUrl = "images"
let playerIdleIm
let playerRunIm
let playerJumpIm


let player = new SpriteSheet(0, 3, 64, 66, 10, 30, 32, 32, 0, 0)
player.itemTaken = 0

//player state
player.idle = true
player.isRunning = false

setTimeout(() => {
    playerIdleIm = game.preload("playerIdle", `${baseUrl}/idle.png`)
    playerRunIm = game.preload("playerrun", `${baseUrl}/run.png`)
    playerJumpIm = game.preload("playerJump", `${baseUrl}/jump.png`)

    player.useImage(playerIdleIm)

}, 100)


// used to have the coorect collider box
player.fixedCollider = () => {
    if (!player.flipX) {
        player.collider.x = player.x + 12
    } else {
        player.collider.x = player.x + 12
    }
    player.collider.h = player.collider.h - 6

}


player.state = () => {

    player.setBody(9.8)
    game.setCollider(player)
    player.fixedCollider()
    Platformer(player, "collision", true)
    controlPlayer()

    game.setCollider(player)
    player.fixedCollider()
    Platformer(player, "collision", true)

    if (player.isJumping) {
        player.runAnimation(playerJumpIm, 0, 4, 4)
    }

    else if (player.isRunning) {
        player.runAnimation(playerRunIm, 0, 7, 4)
    }

    else {
        player.runAnimation(playerIdleIm, 0, 1, 10)
    }


    if (game.itemContainer) {
        player.collect(game.itemContainer)
    }


    if (player.itemTaken >= game.maxEntity && mapPath.includes(current) && current < limit) {

        uiContainer.style.display = "block"
        uiContainer.style.zIndex = 9999

        nextGame.style.display = "block"
        get("body").style.textAlign = "center"


    }
    if (player.itemTaken >= game.maxEntity && mapPath.includes(current) && current >= limit) {
        uiContainer.style.display = "block"
        uiContainer.style.zIndex = 9999
        uiContainer.appendChild(msgBox)
    }

}

//an animation method that handles 3 different animations : idle , run and jump
player.runAnimation = (image, start, end, timer) => {
    player.useImage(image)
    if (frame % timer == 0) {
        player.col++
        if (player.col > end) {
            player.col = start
        }
    }
}


player.collect = (entities) => {
    if (entities)
        for (let entity of entities) {
            let i = entities.indexOf(entity)
            if (isCollide(player.collider, entity)) {
                kill(entities, i)
                let beep = new game.beep("sine", 3000)
                beep.setVolume(1)
                particlePool.createParticle(entity, 30, "self")
                game.cameraShake(2, 500)
                player.itemTaken++
            }
        }
}



export default player