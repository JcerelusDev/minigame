import game from "./main.js"

//spawn items from json tiled map place holder or object layer

export default function spawnKey(timer) {
    game.keys = []
    let keyImage = game.preload("key", "images/key1.png")
    let spawnId = setTimeout(() => {
        let keyList = new SpawnEntities("items", "key", 0, 0, 15, 29, "sheet", game.keys, 10, 0)
        keyList.asyncOperation()
        for (let key of game.keys) {
            clearTimeout(spawnId)
            key.useImage(keyImage)
        }

        //used to get the number of entities at spawn time
        getEntityCount("items", false, function (count) {
            game.maxEntity = count

        })
    }, timer)
}


export function spawnBurger(timer) {
    game.burgers = []
    let burgerImage = game.preload("burger", "images/burger.png")
    let spawnId = setTimeout(() => {
        let burgerList = new SpawnEntities("items", "burger", 0, 0, 32, 28, "sheet", game.burgers, 16, 0)
        burgerList.asyncOperation()
        for (let burger of game.burgers) {
            clearTimeout(spawnId)
            burger.useImage(burgerImage)
        }
        //used to get the number of entities at spawn time
        getEntityCount("items", false, function (count) {
            return game.maxEntity = count

        })

    }, timer)
}

export function spawnCroissant(timer) {
    game.croissants = []
    let croissantImage = game.preload("croissant", "images/croissant.png")
    let spawnId = setTimeout(() => {
        let croissantList = new SpawnEntities("items", "croissant", 0, 0, 32, 28, "sheet", game.croissants, 16, 0)
        croissantList.asyncOperation()
        for (let croissant of game.croissants) {
            clearTimeout(spawnId)
            croissant.useImage(croissantImage)
        }

        //used to get the number of entities at spawn time
        getEntityCount("items", false, function (count) {
            return game.maxEntity = count

        })

    }, timer)
}



export function animatedItem(item) {
    if (item.id != "key") return
    if (frame % 2 == 0) {
        item.col++
        if (item.col >= 47) {
            item.col = 0
        }
    }
}