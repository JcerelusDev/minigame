import { jumpEffect } from "./main.js";
import player from "./player.js";

let leftPressed = false
let rightPressed = false

let speed = 3
let maxJump = 2
let jumpForce = -5

function move(e) {
    if (e.key == "ArrowLeft") {
        leftPressed = true
    }

    if (e.key == "ArrowRight") {
        rightPressed = true
    }



    if (e.code == "Space") {
        if (player.jumpTime < maxJump) {
            let jumpSound = new PlaySound(jumpEffect, 0.2)
            jumpSound.run()
            player.vy = jumpForce
            player.y += player.vy
            player.isJumping = true
            player.jumpTime++
            player.idle = false
            player.isRunning = false


        }
    }
}


function stopMoving(e) {
    if (e.key == "ArrowLeft") {
        leftPressed = false
        player.idle = true
        player.isRunning = false
    }

    if (e.key == "ArrowRight") {
        rightPressed = false
        player.idle = true
        player.isRunning = false
    }

}

export default function controlPlayer() {
    if (screen.width >= 1000) {
        if (leftPressed) {
            player.vx = -speed
            player.x += player.vx
            player.flipX = true
            player.idle = false
            player.isRunning = true

        }

        if (rightPressed) {
            player.vx = speed
            player.x += player.vx
            player.flipX = false
            player.idle = false
            player.isRunning = true
        }

    } else {

        //mobile version
        if (arrowL) {
            player.vx = -speed
            player.x += player.vx
            player.flipX = true
            player.idle = false
            player.isRunning = true

        }

        if (arrowR) {
            player.vx = speed
            player.x += player.vx
            player.flipX = false
            player.idle = false
            player.isRunning = true
        }

    }

}


export const controller = new crossButton();
controller.container.style.left = "2%";
controller.container.style.top = "250px";
controller.visible("hidden")

export let jumpB = new freeButton()

let jumpPressed = false

jumpB.container.style.left = "90%"
jumpB.container.style.top = "85%"

jumpB.visible("hidden")

jumpB.container.ontouchstart = jump

jumpB.setLetter("a")


function jump() {
    if (player.jumpTime < maxJump) {
        let jumpSound = new PlaySound(jumpEffect, 0.2)
        jumpSound.run()
        player.vy = jumpForce
        player.y += player.vy
        player.isJumping = true
        player.jumpTime++
        player.idle = false
        player.isRunning = false


    }

}

document.onkeydown = move
document.onkeyup = stopMoving