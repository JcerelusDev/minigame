/*Jcerelus Dev All Rights Reserved.
Developper : Jean .F CÉRÉLUS
canvasgameJs is a javascript canvas library, 
that makes you develop game very  quick
all of the work is done behind the scene.
*/

// grab dom element
let particles = []
let snows = []
let rains = []
let camera
let pathIndex = 0

function get(x) {
    return document.querySelector(x)
}

function getAll(x) {
    return document.querySelectorAll(x)
}

let reqA
let imSet = false

let friction = 0.5
let isCamera = false
let tileAnimation
let objframe = 0
let layerframe = 0
let saveBg;
let frame = 0
let delta = 0
const dpr = Math.round(window.devicePixelRatio) || 1
const MapScaleX = dpr + 2.362
const MapScaleY = dpr + 1.825
let isFake = false
let isDrawable = false
//Developper : Jean .F CÉRÉLUS
// short cut console.log
const log = console.log

//Main Method
let self
let rotImage = false
let toJson = JSON.stringify
let ctx;
let buffer
let buffer2
let scaleX = 1
let scaleY = 1

let stage, stage2, stage3, stage4

function Stage() {
    self = {
        // create stage
        stage: document.createElement("canvas"),
        stage2: document.createElement("canvas"),
        stage3: document.createElement("canvas"),
        stage4: document.createElement("canvas")

    }



    self.assetLoader = false

    this.images = {}
    this.audios = {}

    self.preload = (assetId, assetPath) => {
        if (assetPath.endsWith('.png') || assetPath.endsWith('.jpg') || assetPath.endsWith('.jpeg')) {
            this.img = new Image();
            this.img.onload = () => {
                this.images[assetId] = this.img; // Store the loaded image
                self.assetLoader = true;
            };
            this.img.onerror = (error) => {
                console.error(`Error loading ${assetId}: ${error.message}`);
            };
            return this.img.src = assetPath;
        }
        else if (assetPath.endsWith('.mp3') || assetPath.endsWith('.m4a') || assetPath.endsWith('.ogg') || assetPath.endsWith('.wav')) {
            this.audio = new Audio();
            this.audio.onload = () => {
                this.audios[assetId] = this.audio; // Store the loaded image
                self.assetLoader = true;
            };
            this.audio.onerror = (error) => {
                console.error(`Error loading ${assetId}: ${error.message}`);
            };
            return this.audio.src = assetPath; // Start loading the image
        } else {
            log("Bad file extension for : " + assetId)
        }
    }



    Sprite.prototype.useImage = function (imageId) {
        let that = this

        let intervalLoad = setInterval(() => {
            if (self.assetLoader) {

                if (Array.isArray(that)) {
                    for (let spr of that) {
                        spr.image.src = imageId
                    }

                } else {
                    that.image.src = imageId
                }

                clearInterval(intervalLoad)
            }

        }, 100)
        return that
    }

    SpriteSheet.prototype.useImage = function (imageId) {
        let that = this

        let intervalLoad = setInterval(() => {
            if (self.assetLoader) {

                if (Array.isArray(that)) {
                    for (let spr of that) {
                        spr.image.src = imageId
                    }

                } else {
                    that.image.src = imageId
                }

                clearInterval(intervalLoad)
            }

        }, 100)
        return that
    }

    self.use = (imageId, x, y, width, height) => {
        if (self.imageLoader) {
            if (this.images != undefined) {
                this.img = this.images[imageId];

                // console.log(`Using ${imageId} at (${x}, ${y}) with dimensions ${width}x${height}`);
            } else {
                console.error(`${imageId} is not loaded.`);
            }
            return this.image
        }
    }

    //knockback to push the target back
    self.knockBack = function (main, target, speed) {
        if (main.left) {
            target.vx = -speed
        } else {
            target.vx = speed
        }
        target.x += target.vx
        target.vx *= 0.6

        if (Math.abs(target.vx) < 0.1) {
            target.vx = 0;
        }

    }




    // Function to generate a short beep sound
    // Create an AudioContext

    let audioContext = new AudioContext();
    // Function to generate a short beep sound
    self.beep = function (beat, frequence) {

        try {

            if (audioContext == undefined) {
                audioContext = new AudioContext();
            }

            const oscillator = audioContext.createOscillator();
            oscillator.type = beat;
            var gainNode = audioContext.createGain();

            oscillator.frequency.setValueAtTime(frequence, audioContext.currentTime); // Adjust the frequency for the desired pitch
            oscillator.connect(gainNode).connect(audioContext.destination);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.09); // Adjust the duration of the keypress sound
        } catch (err) {

        }

        this.setVolume = (volume) => {
            gainNode.gain.value = volume; // Set volume between 0.0 and 1.0
        }

    }



    stage = self.stage
    stage2 = self.stage2
    stage3 = self.stage3
    stage4 = self.stage4

    if (self.scale == undefined) {
        self.scale = 1
    }

    self.stage.style.position = "fixed"
    self.stage.style.zIndex = 1
    self.stage2.style.zIndex = 2
    self.stage3.style.zIndex = 3
    self.stage3.style.zIndex = 9999



    self.stage.style.imageRendering = "pixelated"
    self.stage.style.background = "white"

    let Body = get("body")
    Body.style.margin = 0
    Body.style.display = "flex"
    Body.style.justifyContent = "center"
    Body.style.alignItems = "center"
    Body.style.overflow = "hidden"
    Body.style.background = "black"
    Body.style.userSelect = "none"


    self.zoom = function (zoomValue) {
        stage.style.zoom = zoomValue
    }

    self.aim = (main, entities, gap) => {
        let closestEntity = null;
        let minDistance = Infinity;
        // Iterate through all entities to find the closest one
        entities.forEach(entity => {
            const distance = self.getDistance(entity, main);
            entity.radius = entity.radius || entity.r || entity.w
            // Update the closest entity if the current one is closer
            if (distance < minDistance) {
                minDistance = distance;
                closestEntity = entity;
            }

            if (entity.w) {
                closestEntity.radius = Math.sqrt((entity.w / 2) ** 2 + (entity.h / 2) ** 2)
            } else {
                closestEntity.radius = entity.radius
            }
        });

        // If a closest entity was found and is within the aiming range
        if (closestEntity && (minDistance - closestEntity.radius) <= gap) {
            if (main.type == "polygon") {
                main.angle = self.getAngle(closestEntity, main);
            } else
                main.angle = self.getAngle(main, closestEntity);

        } else {
            main.angle = 0;  // No enemy in range, stop aiming

        }

    };





    //flash
    self.flash = function (sprite) {
        sprite.alpha = 0.3
        sprite.hasShadow = false
        //duration
        sprite.flashId = setTimeout(() => {
            sprite.alpha = 1
            clearTimeout(sprite.flashId)
        }, 70);
    }


    //squash
    self.squash = function (sprite, width) {
        sprite.w = width - 3
        //duration
        sprite.squashId = setTimeout(() => {
            sprite.w = width
            clearTimeout(sprite.squashId)
        }, 270);
    }



    // add  to the document
    self.add = function (x, b) {
        this.b = b
        if (b == undefined) {
            document.body.appendChild(x)
        }


        if (b !== undefined && b == "before") {
            document.body.before(x)
        }

    }

    // remove from the document
    self.delete = function (x) {
        document.body.removeChild(x)
    }

    self.loadImage = function (id, src) {
        this.src = src
        this.id = id
        return this
    }
    //set sprite image source
    self.setSpriteImage = function (currentImage,) {
        try {
            if (!Array.isArray(sprite) && sprite.id == currentImage.id) {
                return sprite.image.src = currentImage.src
            }

            for (let spr of sprite) {
                if (spr.id == currentImage.id) {
                    spr.image.src = currentImage.src
                }
            }
        } catch (err) {

        }
    }
    //set stage background
    var saveBg
    self.stage.setBg = function (c, repeat) {
        self.stage.style.backgroundRepeat = repeat
        self.stage.style.objectFit = "contain"


        this.c = c
        if (isFake) {
            saveBg = this.c || "transparent"
        }

        if (this.c == undefined || c == undefined || this.c == "") {
            self.stage.style.background = saveBg
            self.stage2.style.background = "transparent"
            self.stage3.style.background = "transparent"
            self.stage4.style.background = "transparent"

        }
        else if (isFake && this.c == undefined || c == undefined || this.c == "") {
            self.stage.style.background = "transparent"
            self.stage2.style.background = "transparent"
            self.stage3.style.background = "transparent"
            self.stage4.style.background = "transparent"
        } else if (this.c && !isFake) {
            saveBg = this.c
            self.stage.style.background = saveBg
            self.stage2.style.background = "transparent"
            self.stage3.style.background = "transparent"
            self.stage4.style.background = "transparent"


        } if (this.c == undefined && !isFake) {
            saveBg = "rgba(17,34,51,0.8)"
            self.stage.style.background = saveBg
            self.stage2.style.background = "transparent"
            self.stage3.style.background = "transparent"
            self.stage4.style.background = "transparent"

        }
    }


    // Function to convert tiled map positions to grid positions
    self.getGridPosition = function (x, y, tileWidth, tileHeight) {
        return {
            x: Math.floor(x / tileWidth),
            y: Math.floor(y / tileHeight)
        };
    }

    //1d to 2d Array
    self.parse2D = function (layer) {
        if (loader) {
            const grid = []
            for (let r = 0; r < layer.height; r++) {
                grid[r] = []
                for (let c = 0; c < layer.width; c++) {
                    const index = r * layer.width + c
                    grid[r][c] = layer.data[index]
                }

            }

            return grid
        }
    }


    //load
    self.pageLoad = false
    document.addEventListener("DOMContentLoaded", function () {
        try {
            self.create()
            self.pageLoad = true
        } catch (err) { log() }

    })




    self.setSize = function (a, b) {
        this.a = a * self.scale;
        this.b = b * self.scale;
        if (this.a && this.b) {
            // Maintain the aspect ratio of the canvas
            gW = self.stage.width = self.stage2.width = self.stage3.width = self.stage4.width = this.a;
            gH = self.stage.height = self.stage2.height = self.stage3.height = self.stage4.height = this.b;
        }
    };


    if (this.a == undefined && this.b == undefined) {
        gW = self.stage.width = self.stage2.width = self.stage3.width = 320
        gH = self.stage.height = self.stage2.height = self.stage3.height = 180
    }

    self.fullScreen = false

    function screenScale() {
        // Adjust styles while maintaining aspect 
        stage.style.objectFit = "contain"
        Body.style.objectFit = "contain"

        stage.width = gW * dpr
        stage.height = gH * dpr
        let aspectRatio = gW / gH

        const maxWidth = window.innerWidth * dpr;
        const maxHeight = window.innerHeight * dpr;

        let newWidth, newHeight;

        if (self.fullScreen) {
            if (maxWidth / maxHeight >= aspectRatio) {
                newHeight = maxHeight;
                newWidth = newHeight * aspectRatio;

                stage.style.width = (newWidth + dpr) * aspectRatio + "px"
                stage.style.height = (newHeight + dpr) * aspectRatio + "px"
                self.zoom(0.2)
                stage.style.transform = `scale(${MapScaleX},${MapScaleY})`
                stage.style.top = "32%"

            } else {
                newWidth = maxWidth;
                newHeight = newWidth / aspectRatio;
            }
        } else {

            stage.style.top = "35%"
            if (screen.availWidth >= 1000) {
                self.zoom(0.8);
                stage.style.transform = `scale(${MapScaleX},${MapScaleY})`
            }
            else if (screen.availWidth < 1000) {
                stage.style.top = "48%"
                self.zoom(0.42);
                stage.style.transform = `scale(${MapScaleX},${MapScaleY})`
            }
            if (get("body").className.includes("rotate-90")) {
                stage.style.top = "40%"
                self.zoom(0.45);
                stage.style.transform = `scale(${MapScaleX},${MapScaleY})`

            }


        }

    }


    window.addEventListener("DOMContentLoaded", screenScale)



    window.addEventListener("resize", function () {
        screenScale()
    })



    camera = { x: 0, y: 0, width: gW, height: gH };

    //Developper : Jean .F CÉRÉLUS
    // set the background color of the  stage 

    //Developper : Jean .F CÉRÉLUS


    self.stage.style.imageRendering = "pixelated"
    self.stage2.style.imageRendering = "pixelated"
    self.stage3.style.imageRendering = "pixelated"


    // grab context for the stage

    ctx = self.stage.getContext("2d")
    buffer = self.stage2.getContext("2d")
    buffer2 = self.stage3.getContext("2d")
    buffer3 = self.stage4.getContext("2d")

    // fill your canvas drawing with color
    rectColor = function (x) {
        buffer.fillStyle = x
    }

    // stroke your canvas drawing with color
    strokeColor = function (x) {
        buffer.strokeStyle = x
    }



    // fill your canvas  
    Rect = function (a, color = a.color) {
        buffer.fillStyle = color
        buffer.fillRect(a.x, a.y, a.w, a.h)
    }

    //Developper : Jean .F CÉRÉLUS
    // stroke your canvas 
    Stroke = function (a, color = a.color) {
        buffer.strokeStyle = color
        buffer.strokeRect(a.x, a.y, a.w, a.h)
    }

    //waypoint 
    let wayPoints = []



    //non-spriteSheet animation
    self.spriteAnimator = function (obj, src, nbFrame, startIndex, speed, parenth = false) {
        this.speed = speed
        this.src = src
        this.startIndex = startIndex
        this.nbFrame = nbFrame
        this.obj = obj
        if (this.startIndex > 0) {
            this.index = frame % this.nbFrame + 1
        } else {
            this.index = frame % this.nbFrame
        }

        this.parenth = parenth

        if (this.parenth) {
            this.anim = ` ${this.src}(${this.index}).png`
        } else {
            this.anim = ` ${this.src}${this.index}.png`
        }

        if (frame % this.speed == 0) {
            this.obj.image.src = this.anim

        }

        return this.index
    }


    // getObjectLayer
    self.getObjectLayer = (layerName) => {
        const objectLayer = data.layers.find(layer => layer.name == layerName && layer.type == "objectgroup")
        return objectLayer ? objectLayer.objects : null
    }


    //normalize diagonal speed
    self.normalized = function (obj) {
        let length = Math.sqrt(obj.vx * obj.vx + obj.vy * obj.vy)
        if (length > 0) {
            obj.vx = (obj.vx / length)
            obj.vy = (obj.vy / length)
        }
    }

    //start
    window.onload = function () {
        (!self.start) ? self.start = function () { } : self.start()
    }

    // empty tile
    self.setDetector = function (obj, show = false) {
        obj.show = show
        if (!obj.collider && typeof (show) != "boolean") return
        obj.detector = {
            x: obj.collider.x,
            y: obj.collider.y + obj.collider.h + 2,
            w: 15,
            h: 4,
            color: 'rgba(25,250,255,0.5)'

        }

        if (obj.left) {
            obj.detector.x = obj.x - 2
        } else {
            obj.detector.x = obj.detector.x + 4
        }
    }

    //detect empty tile
    self.isLimitReach = (detector, area) => {
        let gap = Math.abs((detector.y + detector.h) - (area.y + area.height))
        if (detector.x < area.x + area.width && detector.x + detector.w > area.x &&
            detector.y + detector.h > gap) {
            return false
        }
        return true
    }

    //second option
    self.patrolLimit = function (detector, obstacle) {
        if (isCollide(detector, obstacle)) {
            let gap = Math.abs(detector.y - obstacle.y)

            if (detector.x + detector.w / 2 <= obstacle.x || detector.x + detector.w >= obstacle.x + obstacle.width/*&& detector.y < Math.abs(obstacle.y - obstacle.height)*/) {
                return true
            }

            if (isCollide(detector, obstacle) && detector.x + detector.w / 2 <= obstacle.x ||
                detector.x + detector.w >= obstacle.x + obstacle.width) {
                return true
            }

            else {
                return false
            }

        }
    }

    //darkness

    self.useDarkness = function (dark) {
        buffer.save()
        buffer3.clearRect(0, 0, gW, gH)
        buffer3.fillStyle = `rgba(0,0,0,${dark})`
        buffer3.fillRect(0, 0, gW, gH)
        buffer.restore()


    }



    //Overlay
    self.overLay = function () {
        opacity = 1
        self.stage.style.zIndex = -999
        self.stage2.style.zIndex = -999
        var box = document.createElement("div")
        Body.appendChild(box);
        box.style.width = "2500px"
        box.style.height = "2500px"
        box.style.position = "fixed";

        box.style.zIndex = 99999
        box.style.background = `rgba(0, 0, 0, ${opacity})`
        box.style.left = '0%'
        box.style.top = '0%'

        setTimeout(function () {
            opacity -= 0.02
            box.style.background = `rgba(0, 0, 0, ${opacity})`
        }, 300)
        setTimeout(function () {
            opacity -= 0.04
            box.style.background = `rgba(0, 0, 0, ${opacity})`
        }, 600)
        setTimeout(function () {
            opacity -= 0.06
            box.style.background = `rgba(0, 0, 0, ${opacity})`
        }, 900)

        setTimeout(function () {
            opacity -= 0.08
            box.style.background = `rgba(0, 0, 0, ${opacity})`
        }, 1000)

        setTimeout(function () {
            opacity -= 0.2
            box.style.background = `rgba(0, 0, 0, ${opacity})`
        }, 1200)

        setTimeout(function () {
            opacity -= 0.4
            box.style.background = `rgba(0, 0, 0, ${opacity})`
        }, 1400)

        setTimeout(function () {
            opacity = 0
            box.style.background = `rgba(0, 0, 0, ${opacity})`
            document.body.removeChild(box);
        }, 1500)

    }

    //Developper : Jean .F CÉRÉLUS


    // draw text method
    Text = function (color, fontstyle, fontsize, fontfamily, t, x, y) {
        this.x = x
        this.y = y
        this.color = color || "gold"
        this.fontsize = fontsize
        this.fontstyle = fontstyle
        /*this.fontweight = fontweight*/
        this.fontfamily = fontfamily
        this.t = t

        // if not define by the developer
        if (this.fontweight == undefined) {
            this.fontweight = "bold"
        }

        //Developper : Jean .F CÉRÉLUS

        if (this.fontstyle == undefined) {
            this.fontstyle = "italic"
        }

        if (this.fontfamily == undefined || this.fontfamily == null) {
            this.fontfamily = "monospace"
        }


        buffer.fillStyle = this.color
        buffer.font = this.fontstyle + " " + this.fontsize + " " + this.fontfamily
        buffer.fillText(this.t, this.x, this.y)

    }


    // Clear the stage 
    clear = function () {
        buffer.clearRect(camera.x, camera.y, camera.width, camera.health)
    }

    //Developper : Jean .F CÉRÉLUS



    //get distance
    self.getDistance = function (a, b) {
        this.a = a
        this.b = b
        if (this.a.startX && this.a.type == "polygon") {
            var dx = Math.abs(this.a.startX - this.b.startX)
            var dy = Math.abs(this.a.startY - this.b.startY)
            var length = Math.hypot(dx, dy)
            return length
        }

        if (b.type == "line" || b.x1) {
            var dx = (this.a.x - this.b.x1)
            var dy = (this.a.y - this.b.y1)
            var length = Math.hypot(dx, dy)
            return length


        }



        if (this.a.collider != undefined && this.b.collider != undefined) {
            var dx = (this.a.collider.x - this.b.collider.x)
            var dy = (this.a.collider.y - this.b.collider.y)
            var length = Math.hypot(dx, dy)
            return length

        } else if (!this.a.collider && !this.b.collider) {
            var dx = (this.a.x - this.b.x)
            var dy = (this.a.y - this.b.y)
            var length = Math.hypot(dx, dy)
            return length
        }

        else if (this.a.collider && !this.b.collider) {
            var dx = (this.a.collider.x - this.b.x)
            var dy = (this.a.collider.y - this.b.y)
            var length = Math.hypot(dx, dy)
            return length
        }

        else if (!this.a.collider && this.b.collider) {
            var dx = Math.abs(this.a.x - this.b.collider.x)
            var dy = Math.abs(this.a.y - this.b.collider.y)
            var length = Math.hypot(dx, dy)
            return length
        }
    }


    //get angle
    self.getAngle = function (a, b) {
        try {
            this.a = a
            this.b = b

            if (!this.a.startX && !this.b.startX) {
                var angle = Math.atan2((this.a.y - this.b.y), (this.a.x - this.b.x))
                return angle + 90 * Deg2Rad


            }

            if (this.a.startX && this.b.startX) {
                var angle = Math.atan2((this.a.startY - this.b.startY), (this.a.startX - this.b.startX))
                return angle// + 90 * Deg2Rad
            }

            if (!this.a.startX && this.b.startX) {
                var angle = Math.atan2(Math.abs(this.a.y - this.b.startY), Math.abs(this.a.x - this.b.startX))
                return angle + 90 * Deg2Rad
            }
            return angle + 90 * Deg2Rad
        } catch (err) {
            log(err)
        }
        return angle
    }


    self.isClosest = function (obj1, obj2) {
        return distance = self.getDistance(obj1, obj2)
    }


    self.hasLineOfSight = function (obj2, obj1, obstacle) {
        let dx = obj1.x - obj2.x
        let dy = obj1.y - obj2.y
        let distance1 = Math.sqrt(dx * dx + dy * dy)

        let dx2 = obj2.x - obstacle.x
        let dy2 = obj2.y - obstacle.y
        let distance2 = Math.sqrt(dx2 * dx2 + dy2 * dy2)

        let line = {
            x: obj1.x + obj1.w / 2,
            y: obj1.y + obj1.h / 2,
            w: obj2.x + obj2.w / 2,
            h: obj2.y + obj2.h / 2,
            color: "green"
        }


        buffer.strokeStyle = line.color
        if (!isCollide(line, obstacle)) {
            buffer.moveTo(line.x, line.y)
            buffer.lineTo(line.w, line.h)
        }

        buffer.stroke()


        if (isCollide(line, obstacle)) {
            line.color = "red"
            return false
        } else {
            line.color = "green"
            return true
        }

    }


    //avoid self overlap

    self.avoidSameOverlapping = function (entityList) {
        for (let i = 0; i < entityList.length; i++) {
            for (let j = i + 1; j < entityList.length; j++) {
                const spaceX = 16 * delta
                const spaceY = 16 * delta

                if (isCollide(entityList[i], entityList[j])) {
                    entityList[i].x = entityList[i].x + spaceX
                    entityList[i].y = entityList[i].y + spaceY

                }

                if (entityList[i].type == "polygon" && entityList[j].type == "polygon") {
                    if (entityList[i].checkCollision(entityList[j])) {
                        entityList[i].startX = entityList[i].startX + spaceX + entityList[i].radius * 6
                        entityList[i].startY = entityList[i].startY + spaceY + entityList[i].radius * 6

                    }
                }
            }
        }
    }


    // moving object or platform
    self.onElevator = function (obj, el) {
        if (obj.collider.x + obj.collider.w >= el.x && obj.collider.x <= el.x + el.width &&
            obj.collider.y + obj.collider.h > (el.y - el.height) && obj.collider.y < el.y + el.height) {
            return true
        } else {
            return false
        }

    }

    // add boxCollider
    self.setCollider = (obj, isVisible) => {
        if (!isVisible) { isVisible = false }
        obj.isVisible = isVisible

        if (typeof (isVisible) != "boolean") {
            obj.isVisible = false;
            console.warn("Only a boolean is required in collider method !")
        }

        if (obj.sw > 100 || obj.sh > 100) {
            obj.collider = {
                x: obj.x + obj.w / 2.14,
                y: obj.y + obj.h / 3,
                w: obj.w / 8,
                h: obj.h / 3,
                vx: obj.vx,
                vy: obj.vy,
                color: "rgba(255,0,0,0.5)"
            }


        }

        else {

            obj.collider = {
                x: obj.x + obj.w / 1.7,
                y: obj.y + obj.h / 4.5,
                w: obj.w / 4,
                h: obj.h - 7,
                color: "rgba(255,0,0,0.5)"
            }


            if (obj.sh != obj.sw) {
                obj.collider = {
                    x: obj.x + obj.w / 3,
                    y: obj.y + obj.h / 3.5,
                    w: obj.w / 3.5,//Math.abs(obj.w - obj.sw) / 1.9,
                    h: obj.h / 1.35,
                    color: "rgba(255,0,0,0.5)"

                }

            }

            if (!obj.image) {
                obj.collider = {
                    x: obj.x,
                    y: obj.y,
                    w: obj.w,
                    h: obj.h,

                    color: "rgba(255,0,0,0.5)"
                }


            }


        }

    }

    // add boxCollider
    self.removeCollider = function (obj, flipX) {
        obj.hasShadow = false
        obj.flipX = flipX
        obj.collider = undefined

    }


    //timer

    self.timer = (task, delay) => {
        if (task == location.reload) {
            let id = setTimeout(function () {
                clearTimeout(id)
                return task
            }, delay)

        }
        else if (typeof (task) == "function") {
            let id = setTimeout(function () {
                clearTimeout(id)
                return task()
            }, delay)
        }
    }

    // handle camera with limit
    // worldtocamera

    self.worldThroughCamera = function (area) {
        this.area = area

        if (loader || isLoading && !this.area) {
            return { x: 0, y: 0, width: data.width * data.tilewidth, height: data.height * data.tileheight }
        }

        if (!loader || !isLoading && this.area) {
            return { x: this.area.x, y: this.area.y, width: this.area.w, height: this.area.h }
        }
    }

    //lerp method 
    function lerp(currentValue, destinationValue, time) {
        return currentValue + (destinationValue - currentValue) * time //* (0.1 - time) + destinationValue * time

    }

    var cameraSet = false
    self.cameraLimit = false
    self.type = null
    // stage.style.transform = `scale(${MapScaleX},${MapScaleY})`

    self.setCam = function (obj, world, debug) {

        debug = debug || false
        camera = {
            x: 0, y: 0, width: gW / Math.round(self.scale),
            height: gH / Math.round(self.scale), color: "red"
        }
        x = Math.floor((camera.width / 2) + obj.w / 2)
        y = Math.floor((camera.height / 2) + obj.h / 2)


        if (world == undefined) {
            buffer.translate((gW / 2 - (obj.x - 5)) >> 0, ((gH / 2) - (obj.y - 5)) >> 0)
            return
        }

        if (typeof (debug) == "boolean" && debug) {
            cameraSet = debug

        }

        camera.x = Math.round(lerp(camera.x, Math.floor(obj.x + obj.w + 1) - x, 1))
        camera.y = Math.round(lerp(camera.y, Math.floor(obj.y + obj.h + 1) - y, 1))



        if (camera.x <= 0) {
            camera.x = 0
        }

        if (camera.y <= 0) {
            camera.y = 0
        }


        if (camera.x >= world.width - camera.width) {
            camera.x = (world.width - camera.width)
        }

        if (camera.y > world.height - camera.height) {
            camera.y = (world.height - camera.height)
        }


        if (Math.round(obj.x + camera.width * self.scale) >= x) {
            buffer.translate(Math.floor((-camera.x) * self.scale), 0)

            isCamera = true
        }

        if (obj.y + camera.height * self.scale >= y) {
            buffer.translate(0, Math.floor((-camera.y) * self.scale))

            isCamera = true
        }



        if (obj.x < x) {
            isCamera = false
        }

        if (obj.y < y) {
            isCamera = false
        }

        if (camera.x >= world.width - camera.width || camera.x <= 0) {
            self.cameraLimit = true
        } else {
            self.cameraLimit = false
        }

        if (camera.y >= world.height - camera.height || camera.y <= 0) {
            if (self.type == 'topdown')
                self.cameraLimit = true
        } else {
            self.cameraLimit = false
        }

        return this

    }


    // end of camera with limit

    //cameraShake

    let shakeCount = 6
    self.cameraShake = function (intensity, timer) {
        this.intensity = intensity
        timer = timer
        shakeCount--

        if (shakeCount <= 0) shakeCount = 0
        var interval = setInterval(() => {
            if (shakeCount > 0) {
                dx = this.intensity * (Math.random() - 0.5) >> 0
                dy = this.intensity * (Math.random() - 0.5) >> 0
                buffer.setTransform(1, 0, 0, 1, dx, dy)

            }
        }, 50);

        setTimeout(() => {
            clearInterval(interval)
            shakeCount = 6
            buffer.setTransform(1, 0, 0, 1, 0, 0)
        }, timer)
    }


    // batchrender

    self.renderBatch = function (objects, type) {
        try {

            if (Array.isArray(objects)) {
                for (let object of objects) {
                    object.type = type
                    if (object.type == "sheet") {
                        if (objects.collider) {
                            if (canDraw(object.collider, camera))
                                self.renderObjects(object, object.type)
                        }
                        if (canDraw(object, camera))
                            self.renderObjects(object, object.type)
                    }
                    if (object.type == "single") {
                        if (object.collider) {
                            if (canDraw(object.collider, camera))
                                self.renderObjects(object, object.type)
                        }
                        if (canDraw(object, camera))
                            self.renderObjects(object, object.type)
                    }

                    if (object.type == "poly") {
                        self.renderObjects(object, object.type)
                    }


                    if (object.type == "circle") {
                        if (canDraw(object, camera))
                            self.renderObjects(object, object.type)
                    }

                    if (!object.type) {
                        if (canDraw(object, camera))
                            self.renderObjects(object)
                    }
                }

            } else {
                objects.type = type
                if (objects.type == "sheet") {
                    if (objects.collider) {
                        if (canDraw(objects.collider, camera))
                            self.renderObjects(objects, objects.type)

                    }
                    if (canDraw(objects, camera))
                        self.renderObjects(objects, objects.type)
                }

                if (objects.type == "single") {
                    if (objects.collider) {
                        if (canDraw(objects.collider, camera))
                            self.renderObjects(objects, objects.type)
                    }
                    if (canDraw(objects, camera))
                        self.renderObjects(objects, objects.type)
                }

                if (objects.type == "background") {
                    self.renderObjects(objects, objects.type)
                }

                if (objects.type == "poly") {
                    self.renderObjects(objects, objects.type)
                }

                if (objects.type == "circle") {
                    if (canDraw(objects, camera))
                        self.renderObjects(objects, objects.type)
                }

                if (!objects.type) {
                    if (canDraw(objects, camera)) {
                        self.renderObjects(objects)
                    }

                    if (!canDraw(objects, camera) && objects.w >= camera.x + camera.width) {
                        self.renderObjects(objects)
                    }
                }
            }
        } catch (err) { }
    }


    self.renderObjects = function (obj, type) {
        this.type = type
        if (this.type === "sheet") {
            obj.drawSpriteSheet()
        }
        if (this.type === "single") {
            obj.drawSpriteImg()
        }

        if (this.type === "background") {
            obj.drawSpriteImg()
        }

        if (this.type === "circle") {
            obj.drawCirc()
        }

        if (this.type === "poly") {
            obj.draw()
        }

        if (!this.type) {
            obj.drawSprite()
        }

    }

    //set background
    self.stage.setBg(saveBg);

    //game Loop

    let then = 0, fpsInterval;
    let getFps = false;
    let accumulator = 0;
    const maxFrameTime = 1000; // Max 1 second frame time
    let reqA;
    let isLoopStop = false
    const fullScreenScale = { width: 1, height: 1 };
    self.freezeVal = 1;
    self.isFrozen = false;

    // Freeze the game
    self.freeze = function (duration, slowFactor) {
        self.isFrozen = true;
        const startTime = performance.now();
        fpsInterval = 1000 / (self.speed / slowFactor);
        self.freezeVal = self.speed / slowFactor;

        // Use setTimeout to pause briefly, only re-enable animations after freeze duration
        const freezeLoop = () => {
            if (then - startTime < duration) {
                setTimeout(freezeLoop, duration);
            } else {
                self.isFrozen = false;
                fpsInterval = 1000 / self.speed;
                self.freezeVal = self.speed;
            }
        };
        freezeLoop();

    };

    // Set animation FPS and frame interval
    self.setAnimation = function (fps) {
        this.fps = fps;

        if (!getFps) {
            self.speed = this.fps;
            getFps = true;
        }

        fpsInterval = 1000 / self.speed;
        isLoopStop = false
        reqA = requestAnimationFrame(gameLoop);
        return this.fps;
    };

    // Stop animation

    self.stopAnimation = function () {
        isLoopStop = true
        if (isLoopStop)
            cancelAnimationFrame(reqA);
    };

    function gameLoop(timeStamp) {
        buffer.clearRect(camera.x, camera.y, camera.width, camera.height);
        let elapsed = timeStamp - then;
        then = timeStamp;
        // Cap the elapsed time to avoid a spiral of death
        elapsed = Math.min(elapsed, maxFrameTime);

        // Adjust freeze interval
        if (self.isFrozen) {
            fpsInterval = 1000 / self.freezeVal;
            elapsed -= self.freezeVal
        } else {
            elapsed += self.fps
        }

        let deltaTime = (fpsInterval / 1000)
        delta = deltaTime.toFixed(3)
        accumulator += elapsed;

        if (frame % 8 === 0 && isLayer) {
            layerframe++;
        }
        if (frame % 8 === 0 && isObject) {
            objframe++;
        }

        // Handle update cycles based on accumulator
        while (accumulator >= fpsInterval) {
            self.update(delta);
            accumulator -= elapsed;
            frame += 1;

        }



        ctx.save();
        buffer.save();

        // Render main game and additional elements conditionally
        if (!self.drawGame) {
            ctx.save()
            self.render();
            ctx.restore()
        } else {
            self.drawGame();
        }

        if (particlePool.pool.length > 0) {
            renderParticles();
        }

        if (snows.length > 0) {
            renderSnows();
        }

        if (rains.length > 0) {
            renderRain();
        }

        // Render camera boundary if needed
        if (cameraSet) {
            buffer.strokeStyle = camera.color;
            buffer.lineWidth = self.scale * 2;
            buffer.strokeRect(
                camera.x * self.scale,
                camera.y * self.scale,
                camera.width * self.scale,
                camera.height * self.scale
            );
        }

        buffer.restore();
        ctx.clearRect(camera.x, camera.y, camera.width, camera.height);
        buffer.scale(1, 1)
        buffer.setTransform(1, 0, 0, 1, 0, 0)
        renderToMainCanvas();
        ctx.restore();
        reqA = requestAnimationFrame(gameLoop);
    }


    function renderParticles() {
        for (let i = 0; i < particlePool.pool.length; i++) {
            let particle = particlePool.pool[i]
            particle.update();
            particle.draw();
        }
    }


    function renderSnows() {
        snows.forEach(function (snow, i) {
            if (canDraw(snow, camera)) {
                buffer.beginPath()
                buffer.fillStyle = snow.color
                buffer.arc(snow.x, snow.y += snow.vy, snow.r, 1.8, Math.PI * 1.7)
                buffer.fill()
                buffer.closePath()

            } else {
                kill(snows, i)

            }

        })
    }

    function renderRain() {
        rains.forEach((rain, index) => {
            buffer.save()
            rain.drawSprite()
            if (!canDraw(rain, camera)) {
                kill(rains, index)
            }
            buffer.restore()

        })

    }


    let cachedStage2 = null;

    function cacheStage2() {
        cachedStage2 = new Image();
        cachedStage2.src = stage2.toDataURL();
    }

    function renderToMainCanvas() {
        buffer.imageSmoothingEnabled = false;
        buffer.imageSmoothingQuality = "low";


        // Draw cached layers
        if (cachedStage2) {
            ctx.drawImage(cachedStage2, 0, 0);
        } else {
            ctx.drawImage(stage2, 0, 0);
        }

        // Draw dynamic layers
        ctx.drawImage(stage3, 0, 0);
        ctx.drawImage(stage4, 0, 0);

    }


    setInterval(function () {
        if (isLoopStop) {
            return
        }
        self.complexUpdate(delta);

    }, 30)



    kill = function (arr, index) {
        return arr.splice(index, 1)

    }


    self.isHoriBorder = function (a, b) {
        if (a.r == null && b.x == null && camera) {
            if (a.x <= 0 || a.x >= b.width - a.w) {
                return true
            }
        }

        else if (a.r == null && b.x == null) {
            if (a.x <= 0 || a.x + a.w >= b.width) {
                return true
            }
        }


        else if (a.r == undefined && b.x !== undefined) {
            if (a.x <= b.x + 2 || a.x + a.w >= b.width) {

                return true
            }
        }


        else if (a.r != undefined && b.x != undefined) {
            if (a.x <= b.x || a.x + a.r >= b.width - a.r || a.x + a.r >= b.w - a.r) {
                return true
            }

        }


        else if (a.r != undefined && b.x == undefined) {
            if (a.x - a.r <= 0 || a.x + (a.r + a.r * 2) >= b.width - a.r) {
                return true
            }

        }

        if (a.r == undefined && a.w == undefined && a.startX && b.x == undefined) {
            if (a.startX <= a.radius - 4 || a.startX + a.radius - 2 >= b.width) {
                return true
            }
        }

        if (a.r == undefined && a.h == undefined && a.startX && b.x != undefined) {
            if (a.startX <= a.radius - 4 || a.startX + a.radius - 2 >= b.w) {
                return true
            }
        }

    }



    self.isVertiBorder = function (a, b) {
        if (a.r == undefined && b.y !== undefined) {
            if (a.y <= b.y || a.y + a.h >= b.height - a.h || a.y + a.h >= b.h) {
                return true
            }
        }

        //Developper : Jean .F CÉRÉLUS
        else if (a.r != undefined && b.y !== undefined) {
            if (a.y - a.r <= b.y || a.y + a.r >= b.height - a.r || a.x + a.r >= b.h) {
                return true
            }

        }


        if (a.r == undefined && b.y == undefined) {
            if (a.y <= 0 || a.y + a.h >= b.height) {
                return true
            }
        }
        else if (a.r != undefined && b.y == undefined) {
            if (a.y - a.r <= 0 || a.y + (a.r + a.r) >= b.height) {
                return true
            }

        }

        if (a.r == undefined && a.h == undefined && a.startY && b.y == undefined) {
            if (a.startY <= a.radius - 3 || a.startY + a.radius - 2 >= b.height) {
                return true
            }
        }

        if (a.r == undefined && a.h == undefined && a.startY && b.y != undefined) {
            if (a.startY <= a.radius - 3 || a.startY + a.radius - 2 >= b.h) {
                return true
            }
        }

    }

    //astar preparation
    self.setAstar = function (tileSize, grid, acceptableTiles, timer, diagonal) {

        let astar = new Astar()

        grid2d = new self.parse2D(grid)
        astar.setGrid(grid2d)
        astar.setAcceptableTiles(acceptableTiles)
        astar.setIterations(timer)

        if (diagonal) {
            astar.setDiagonal(diagonal)
        }
        return astar
    }


    // preventOverlapping
    self.preventOverlapping = function (arr) {
        for (let i = 0; i < arr.length; i++) {
            const group1 = arr[i];

            for (let j = 0; j < arr.length; j++) {
                const group2 = arr[j];

                if (group1.checkCollision(group2)) {
                    kill(arr, i);
                    kill(arr, j);


                    // Adjust the index to account for the removed enemies
                    if (j > i) {
                        j--;
                    }
                    return
                }

            }
        }
    }


    /*let complexId = setInterval(function(){
    try{
    if(!self.complexUpdate)return
            self.complexUpdate(delta)
      }catch(err){}
    },60)
    
    self.stopComplex = function(){
    clearInterval(complexId)
    }
    
    self.restartComplex = function(){
    let complexId = setInterval(function(){
    try{
    if(!self.complexUpdate)return
            self.complexUpdate(delta)
      }catch(err){}
    },260)
    
    }*/

    return self
}





// deg2Rad to handle rotation
var Deg2Rad = Math.PI / 180;


//createLine
class Line {
    constructor(x1, x2, y1, y2, color, width) {
        this.x1 = x1
        this.x2 = x2
        this.y1 = y1
        this.y2 = y2
        this.color = color
        this.width = width
        this.vx = 0
        this.vy = 0
        this.round = false
        this.type = "line"
    }

    drawLine() {
        buffer.beginPath()
        buffer.strokeStyle = this.color

        if (this.round) {
            buffer.lineJoin = "round";
            buffer.lineCap = "round";
        } else {
            buffer.lineJoin = "miter";
            buffer.lineCap = "butt";
        }
        buffer.moveTo(this.x1, this.y1)
        buffer.lineTo(this.x2, this.y2)
        buffer.lineWidth = this.width
        buffer.stroke()
        buffer.closePath()

    }

    updateLine() {
        this.x2 += this.vx * delta
        this.y2 += this.vy * delta

    }

    lineItersect = function (b) {
        var dist = Game.getDistance(this, b)
        if (b.r) {
            if (dist <= this.y1 && b.y + b.r >= this.y1 - 5) {
                b.y = (this.y1 - 5) - b.r
                b.vy = 0

            }
        } else {
            if (dist <= this.y1 && b.y + b.h >= this.y1 - 5) {
                b.y = (this.y1 - 5) - b.h
                b.vy = 0
            }
        }

    }

}


//create polygons

function PolyGons(startX, startY, sides, radius, color, angle, speedX, speedY, fill, canFire) {
    this.startX = startX;
    this.startY = startY;
    this.sides = sides;
    this.radius = radius;
    this.angle = angle
    this.color = color;
    this.speedX = speedX;
    this.speedY = speedY;
    this.effect = false
    this.fill = fill || false
    this.canFire = canFire || false
    this.isRot = false
    this.type = "polygon"
    this.alpha = 1
    if (typeof (this.fill) != "boolean") {
        ("fill must be a boolean ")
        return
    }

    this.bullet = []

    this.draw = function () {

        drawPolyBullet(this)
        buffer.save()
        buffer.beginPath();
        buffer.moveTo(
            this.startX + this.radius * Math.cos(0 + this.angle),
            this.startY + this.radius * Math.sin(0 + this.angle)
        );

        for (var i = 1; i <= this.sides; i++) {
            if (this.sides == 3 && this.flipX) {
                this.currentAngle = (1 - (i * (Math.PI * 2)) / this.sides + this.angle);
            } else {
                this.currentAngle = ((i * (Math.PI * 2)) / this.sides + this.angle);
            }


            if (!this.fill) {
                this.x = this.startX + this.radius * Math.cos(this.currentAngle);
                this.y = this.startY + this.radius * Math.sin(this.currentAngle);

                buffer.strokeStyle = this.color;
                buffer.lineWidth = 1;
                buffer.lineTo(Math.round(this.x), Math.round(this.y));
                buffer.stroke();
            } else if (this.fill) {
                this.x = this.startX + this.radius * Math.cos(this.currentAngle);
                this.y = this.startY + this.radius * Math.sin(this.currentAngle);
                if (this.alpha != 1) {
                    buffer.globalAlpha = this.alpha
                } else {
                    buffer.globalAlpha = this.alpha
                }
                buffer.lineWidth = 1;
                buffer.fillStyle = this.color;
                buffer.lineTo(Math.round(this.x), Math.round(this.y));
                buffer.fill();

            }
        }

        // Connect the last point back to the starting point
        buffer.lineTo(
            Math.round(this.startX + this.radius * Math.cos(0 + this.angle)),
            Math.round(this.startY + this.radius * Math.sin(0 + this.angle))
        );

        // Stroke or fill the shape
        if (!this.fill) {
            if (this.alpha != 1) {
                buffer.globalAlpha = this.alpha
            } else {
                buffer.globalAlpha = this.alpha
            }
            buffer.strokeStyle = this.color;
            buffer.lineWidth = 2;
            buffer.stroke();
        } else if (this.fill) {

            buffer.fillStyle = this.color;
            buffer.fill();
        }

        buffer.closePath()
        buffer.restore()


    };

    this.update = function () {
        buffer.save()
        this.startX += this.speedX;
        this.startY += this.speedY;
        if (this.angle != null) this.angle += 0.05;
        buffer.restore()
    };


    this.checkCollision = function (otherPolygon) {
        var dx = this.startX - otherPolygon.startX;
        var dy = this.startY - otherPolygon.startY;

        var distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.radius + otherPolygon.radius) {
            // Collision detected
            return true;
        }

        return false;
    };

    this.overlap = function (objects) {
        for (let b = 0; b < objects.length; b++) {
            let main = objects[b]
            for (let c = b + 1; c < objects.length; c++) {
                let other = objects[c]
                if (main.checkCollision(other)) {
                    kill(objects, c)

                }

            }

        }

    }


    this.addBullet = function (x, y, w, h, color, r, angle, speed) {
        this.obj = {
            x: x,
            y: y,
            w: w,
            h: h,
            color: color,
            r: r,
            angle: angle || null,
            direction: this.direction(),
            fired: false,
            speed
        }
        if (this.obj.direction != null || this.obj.angle != null) {
            this.bullet.push(this.obj)
        }
    }

    // bullet direction 
    this.direction = function () {
        if (this.angle != null) return
        if (this.speedX > 0) {
            return 1
        }

        if (this.speedX < 0) {
            return - 1
        }

        if (this.speedY > 0) {
            return 2
        }

        if (this.speedY < 0) {
            return - 2
        }

    }

}



function drawPolyBullet(PolyGon) {
    this.bullet = PolyGon.bullet
    for (let j = 0; j < this.bullet.length; j++) {
        var bullet = bul = this.bullet[j]

        if (PolyGon.effect) {
            particlePool.createParticle(bul, 0.00001, "fire")
        }

        if (!bul.image) {
            buffer.fillStyle = bul.color
            if (!this.isRot /* &&   bul.direction == - 1 || bul.direction == 1 || bul.direction == - 2 || bul.direction == 2*/) {
                buffer.fillRect(Math.round(bul.x * self.scale), Math.round(bul.y * self.scale), Math.round(bul.w * self.scale), Math.round(bul.h * self.scale))
                this.isRot = false
            }



            if (bul.w == 0 && bul.h == 0 && bul.angle == null && bul.direction == - 1 || bul.direction == 1 || bul.direction == - 2 || bul.direction == 2) {
                buffer.beginPath()
                buffer.arc(Math.round(this.bullet[j].x * self.scale), Math.round(this.bullet[j].y * self.scale), Math.round(this.bullet[j].r * self.scale), 0, Math.round(Math.PI * 2))
                buffer.fill()
                buffer.closePath()

            }

            if (bul.w == 0 && bul.h == 0 && bul.angle !== null) {
                buffer.beginPath()
                buffer.arc(Math.round(bul.x * self.scale), Math.round(bul.y * self.scale), Math.round(bul.r * self.scale), 0, Math.round(Math.PI * 2))
                buffer.fill()
                buffer.closePath()
                bul.x += Math.cos(bul.angle + 90 * Deg2Rad) * bul.speed
                bul.y += Math.sin(bul.angle + 90 * Deg2Rad) * bul.speed
                this.isRot = true

            }

            if (bul.w != 0 && bul.h != 0 && bul.angle != null) {
                buffer.save()
                buffer.translate(Math.round((bul.x + bul.w / 2) * self.scale), Math.round((bul.y + bul.h / 2) * self.scale))
                buffer.rotate(bul.angle + 90 * Deg2Rad)
                buffer.fillRect(Math.round(-this.bullet[j].w / 2 * self.scale), Math.round(-this.bullet[j].h / 2 * self.scale), Math.round(this.bullet[j].w * self.scale), Math.round(this.bullet[j].h * self.scale))
                buffer.restore()
                bul.x += Math.cos(bul.angle + 90 * Deg2Rad) * bul.speed
                bul.y += Math.sin(bul.angle + 90 * Deg2Rad) * bul.speed
                this.isRot = true


            }

        }

    }


}

function isCollideBoxPolygon(pol, obj) {
    var polygonLeft = pol.startX - pol.radius;
    var polygonRight = pol.startX + pol.radius;
    var polygonTop = pol.startY - pol.radius;
    var polygonBottom = pol.startY + pol.radius;

    if (obj.w == undefined) {
        var dx = pol.startX - obj.x;
        var dy = pol.startY - obj.y;
        var distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= obj.r + pol.radius / 2 + obj.r) {
            return true
        }

    } else


        var squareLeft = obj.x;
    var squareRight = obj.x + obj.w;
    var squareTop = obj.y;
    var squareBottom = obj.y + obj.h;

    if (polygonRight >= squareLeft &&
        polygonLeft <= squareRight &&
        polygonBottom >= squareTop &&
        polygonTop <= squareBottom) {
        return true;
    }

    return false;


}




// handle sprite with color and single image
let Sprite = function (x, y, w, h, vx, vy, color, id, rotation) {
    this.x = x
    this.y = y
    this.w = w
    this.h = h
    this.vx = vx
    this.vy = vy
    this.id = id
    this.rotation = rotation || 0
    this.angle
    this.isRot = false
    this.flipX = false
    this.flipY = false
    this.left = false
    this.alpha = 1
    this.fadeOut = false
    this.hasShadow = false
    this.strong = false
    this.setGravity = function (x) {
        this.gravity = x
        this.createShadow
    }

    this.jumpTime = 0
    this.isJumping = false

    this.color = color

    //handle gravity
    this.setBody = (gv) => {
        if (camera)
            if (!canDraw(this, camera)) return

        this.gv = gv
        if (this.gv == undefined) {
            this.setGravity(20)
            this.vy += this.gravity * 0.017
            this.y += Math.floor(this.vy)
            this.hasShadow = false
        }
        else {
            if (this.gv > 20) this.gv = 20
            this.setGravity(this.gv)
            this.setGravity(this.gv)
            this.vy += this.gravity * 0.017
            this.y += Math.floor(this.vy)
            this.hasShadow = false
        }
    }

    this.removeBody = () => {
        this.vy = 0
        this.strong = false
        this.onFloor = true
    }



    this.createShadow = function (shape) {
        this.shape = shape
        this.hasShadow = true
        this.r = 8

        if (this.onFloor) {
            this.shadowY = this.collider.y + this.collider.h - 2

        }
        if (!this.onFloor) {
            this.shadowY = this.collider.y + this.collider.h * 2
        }
    }


    // draw sprite with image

    if (!this.color) {
        this.image = new Image()
    }

    this.bullet = []

    this.bullet.image = new Image()


    // draw sprite

    this.drawSprite = function () {

        if (this.hasShadow) {
            buffer.save()
            if (this.shape == "circle") {
                buffer.beginPath()
                buffer.scale(1, 0.5)
                buffer.fillStyle = "rgba(0,0,0,0.5)"
                buffer.arc((this.x + this.w / 2) * self.scale, this.shadowY * self.scale * 2, this.r * self.scale, 0, Math.PI * 2)
                buffer.fill()
                buffer.closePath()

            }
            if (this.shape == "rect") {
                buffer.fillStyle = "rgba(0,0,0,0.5)"
                if (!this.collider) {
                    buffer.fillRect(this.x * self.scale, this.shadowY * self.scale, this.w * self.scale, this.h * self.scale)
                } else
                    buffer.fillRect(this.collider.x * self.scale, this.shadowY * self.scale, this.collider.w * self.scale, this.collider.h * self.scale)
            }

            buffer.restore()

        }

        if (this.vx > 0) {
            this.left = false
        } else if (this.vx < 0) {
            this.left = true
        }

        if (typeof (this.angle) == "number") this.isRot = true


        for (var j = 0; j < this.bullet.length; j++) {
            var bul = this.bullet[j]
            if (!bul.image) {
                buffer.fillStyle = bul.color
                if (!this.isRot || bul.angle == null && bul.direction == - 1 || bul.direction == 1 || bul.direction == - 2 || bul.direction == 2) {
                    if (bul.w == 0 && bul.h == 0 && bul.r > 0) {
                        buffer.beginPath()
                        buffer.arc(this.bullet[j].x * self.scale, this.bullet[j].y * self.scale, this.bullet[j].r * self.scale, 0, Math.PI * 2)
                        buffer.fill()
                        buffer.closePath()

                    } else {
                        buffer.fillRect(bul.x * self.scale, bul.y * self.scale, bul.w * self.scale, bul.h * self.scale)
                    }


                }

                if (bul.r > 0 && bul.w == 0 && bul.h == 0 && bul.angle != null && !bul.direction) {
                    buffer.save()
                    buffer.beginPath()
                    buffer.arc(bul.x * self.scale, bul.y * self.scale, bul.r * self.scale, 0, Math.PI * 2)
                    buffer.fill()
                    buffer.closePath()
                    bul.x += Math.cos(bul.angle + 90 * Deg2Rad) * bul.speed
                    bul.y += Math.sin(bul.angle + 90 * Deg2Rad) * bul.speed
                    this.isRot = true
                    buffer.restore()

                }

                if (bul.w > 0 && bul.h > 0 && bul.r == 0 && bul.angle != null && !bul.direction) {
                    buffer.save()
                    buffer.translate((bul.x + bul.w / 2) * self.scale, (bul.y + bul.h / 2) * self.scale)
                    buffer.rotate(bul.angle + 90 * Deg2Rad)
                    buffer.fillRect(-this.bullet[j].w / 2 * self.scale, -this.bullet[j].h / 2 * self.scale, this.bullet[j].w * self.scale, this.bullet[j].h * self.scale)
                    buffer.restore()
                    bul.x += Math.cos(bul.angle + 90 * Deg2Rad) * bul.speed
                    bul.y += Math.sin(bul.angle + 90 * Deg2Rad) * bul.speed
                    this.isRot = true
                    buffer.restore()
                }


            }

            if (bul.image) {
                if (!this.isRot) {
                    buffer.drawImage(this.bullet[j].image, this.bullet[j].x * self.scale, this.bullet[j].y * self.scale, this.bullet[j].w * self.scale, this.bullet[j].h * self.scale)
                }

                if (bul.angle) {
                    buffer.save()
                    buffer.translate((bul.x + bul.w / 2) * self.scale, (bul.y + bul.h / 2) * self.scale)
                    buffer.rotate(bul.angle)
                    buffer.drawImage(this.bullet[j].image, -(this.bullet[j].w / 2) * self.scale, -(this.bullet[j].h / 2) * self.scale, this.bullet[j].w * self.scale, this.bullet[j].h * self.scale)
                    buffer.restore()
                    bul.x += Math.cos(bul.angle + 90 * Deg2Rad) * bul.speed
                    bul.y += Math.sin(bul.angle + 90 * Deg2Rad) * bul.speed
                    this.isRot = true
                    buffer.restore()
                }

            }

        }

        if (this.flipX && !this.rotation) {
            for (var j = 0; j < this.bullet.length; j++) {
                if (this.bullet[j].image) {
                    buffer.save()
                    buffer.scale(-1, 1)
                    buffer.drawImage(this.bullet[j].image, -this.bullet[j].x * self.scale, this.bullet[j].y * self.scale, -this.bullet[j].w * self.scale, this.bullet[j].h * self.scale)
                    buffer.restore()
                    return
                } else {
                    if (this.bullet[j].w > 0 && this.bullet[j].h > 0) {
                        buffer.save()
                        buffer.scale(-1, 1)
                        buffer.fillStyle = this.bullet[j].color
                        buffer.fillRect(-this.bullet[j].x * self.scale, this.bullet[j].y * self.scale, -this.bullet[j].w * self.scale, this.bullet[j].h * self.scale)
                        buffer.restore()
                        return
                    }

                    if (this.bullet[j].w == 0 && this.bullet[j].h == 0) {
                        buffer.beginPath()
                        buffer.save()
                        buffer.scale(-1, 1)
                        buffer.arc(-this.bullet[j].x * self.scale, this.bullet[j].y * self.scale, -this.bullet[j].r * self.scale, 0, Math.PI * 2)
                        buffer.fill()
                        buffer.closePath()
                        buffer.restore()
                        return

                    }

                }


            }


        }

        if (this.rotation && !this.flipX && !rotImage) {

            buffer.save()
            buffer.translate(this.x + this.w / 2 * self.scale, this.y + this.h / 2 * self.scale)
            buffer.rotate(this.rotation)  //(Math.sin(this.rotation)*180/Math.PI)
            buffer.fillStyle = this.color
            buffer.fillRect((-this.w / 2) * self.scale, (-this.h / 2) * self.scale, this.w * self.scale, this.h * self.scale)
            buffer.translate(-this.x * self.scale, -this.y * self.scale)
            buffer.restore()
            return
        }


        if (this.rotation && this.flipX && !rotImage) {
            buffer.save()
            //this.x = (this.x - this.w / 2) * self.scale
            //this.y = (this.y - this.h / 2.8) * self.scale
            buffer.translate((this.x - this.w / 2), (this.y - this.h / 2) * self.scale)
            buffer.scale(-1, 1)
            buffer.rotate(this.rotation)
            buffer.fillStyle = this.color
            buffer.fillRect((-this.w / 2) * self.scale, (-this.h / 2) * self.scale, this.w * self.scale, this.h * self.scale)
            buffer.restore()
            return
        }

        buffer.globalAlpha = this.alpha
        buffer.fillStyle = this.color
        buffer.fillRect(this.x * self.scale, this.y * self.scale, this.w * self.scale, this.h * self.scale)

        if (this.isVisible) {
            buffer.fillStyle = this.collider.color
            buffer.fillRect(this.collider.x * self.scale, this.collider.y * self.scale, this.collider.w * self.scale, this.collider.h * self.scale)
            if (this.flipX) {
                buffer.save()
                buffer.scale(-1, 1)
                buffer.fillRect(-(this.collider.x + 4.2) * self.scale, this.collider.y * self.scale, -this.w / 2 * self.scale, this.collider.h * self.scale)
                buffer.restore()
            }

        }

    }//Developper : Jean .F CÉRÉLUS

    // control reverse of rotation
    this.reverse = false
    //single image
    this.drawSpriteImg = function () {
        if (this.hasShadow) {
            buffer.save()
            if (this.shape == "circle") {
                buffer.beginPath()
                buffer.fillStyle = "rgba(0,0,0,0.5)"
                buffer.arc((this.x + this.w / 2) * self.scale, this.shadowY * self.scale, this.r * self.scale, 0, Math.PI * 2)
                buffer.fill()
                buffer.closePath()
            }
            if (this.shape == "rect") {
                buffer.fillStyle = "rgba(0,0,0,0.5)"
                if (!this.collider) {
                    buffer.fillRect(this.x * self.scale, this.shadowY * self.scale, this.w * self.scale, this.h * self.scale)
                } else
                    buffer.fillRect(this.collider.x * self.scale, this.shadowY * self.scale, this.collider.w * self.scale, this.collider.h * self.scale)
            }

            buffer.restore()

        }


        if (this.vx > 0) {
            this.left = false
        } else if (this.vx < 0) {
            this.left = true
        }


        if (this.isVisible) {
            buffer.save()
            buffer.fillStyle = this.collider.color
            buffer.fillRect(this.collider.x * self.scale, this.collider.y * self.scale,
                this.collider.w * self.scale, this.collider.h * self.scale)
            buffer.restore()
        }


        if (this.show) {
            buffer.save()
            buffer.fillStyle = this.detector.color
            buffer.fillRect(this.detector.x * self.scale, this.detector.y * self.scale,
                this.detector.w * self.scale, this.detector.h * self.scale)
            buffer.restore()
        }


        if (this.flipX && !rotImage) {
            for (var j = 0; j < this.bullet.length; j++) {
                if (imSet) {
                    buffer.save()
                    buffer.scale(-1, 1)
                    buffer.globalAlpha = this.alpha
                    buffer.drawImage(this.bullet[j].image, -this.bullet[j].x * self.scale, this.bullet[j].y * self.scale, -this.bullet[j].w * self.scale, this.bullet[j].h * self.scale)
                    buffer.restore()
                    return

                } else {
                    for (var i = 0; i < this.bullet.length; i++) {
                        buffer.save()
                        buffer.scale(-1, 1)
                        buffer.fillStyle = this.bullet[i].color
                        buffer.fillRect((-this.bullet[i].x - this.bullet[i].w) * self.scale, this.bullet[i].y * self.scale, this.bullet[i].w * self.scale, this.bullet[i].h * self.scale)
                        buffer.globalAlpha = 1
                        buffer.restore()
                        return
                    }
                }

            }

        }

        this.isRot = false
        if (this.angle != 0) {
            this.isRot = true
        } else {
            this.isRot = false
        }

        for (var j = 0; j < this.bullet.length; j++) {
            var bul = this.bullet[j]
            if (!bul.image) {
                buffer.fillStyle = this.bullet[j].color
                if (!bul.angle) {
                    //  if (!this.isRot || !this.angle && bul.direction == - 1 || bul.direction == 1 || bul.direction == - 2 || bul.direction == 2) {
                    //     buffer.fillRect(Math.round(this.bullet[j].x * self.scale), Math.round(this.bullet[j].y * self.scale), Math.round(this.bullet[j].w * self.scale), Math.round(this.bullet[j].h * self.scale))
                    // }


                    if (this.bullet[j].r != 0 &&
                        bul.direction == - 1 ||
                        bul.direction == 1 || bul.direction == - 2 || bul.direction == 2) {
                        buffer.save()
                        buffer.beginPath()
                        buffer.lineWidth = 1;
                        buffer.arc(Math.round(this.bullet[j].x * self.scale), Math.round(this.bullet[j].y * self.scale), Math.round(this.bullet[j].r * self.scale), 0, Math.PI * 2)
                        buffer.fill()
                        buffer.closePath()
                        buffer.restore
                    }
                } else

                    if (this.bullet[j].w == 0 && this.bullet[j].h == 0 && bul.angle != undefined) {
                        buffer.beginPath()
                        buffer.arc(Math.round(this.bullet[j].x + bul.r / 2 * self.scale), Math.round(this.bullet[j].y + bul.r / 2 * self.scale), Math.round(this.bullet[j].r * self.scale), 0, Math.PI * 2)
                        buffer.fill()
                        buffer.closePath()
                        bul.x += Math.cos(bul.angle - 90 * Deg2Rad) * bul.speed
                        bul.y += Math.sin(bul.angle - 90 * Deg2Rad) * bul.speed
                        this.isRot = true


                    }

                if (bul.r == 0 && bul.angle != undefined) {
                    buffer.save()
                    buffer.translate(Math.round((bul.x + bul.w / 2) * self.scale), Math.round((bul.y + bul.h / 2) * self.scale))
                    buffer.rotate(bul.angle)
                    buffer.fillRect(-Math.round(this.bullet[j].w / 2 * self.scale), Math.round(-this.bullet[j].h / 2 * self.scale), Math.round(this.bullet[j].w * self.scale), Math.round(this.bullet[j].h * self.scale))
                    buffer.restore()
                    bul.x += Math.cos(bul.angle - 90 * Deg2Rad) * bul.speed
                    bul.y += Math.sin(bul.angle - 90 * Deg2Rad) * bul.speed
                    this.isRot = true
                }
            }


            if (bul.image) {
                if (!isRot && bul.direction == - 1 || bul.direction == 1 || bul.direction == - 2 || bul.direction == 2) {
                    if (!bul.flipX)
                        buffer.drawImage(this.bullet[j].image, Math.round(this.bullet[j].x * self.scale), Math.round(this.bullet[j].y * self.scale), Math.round(this.bullet[j].w * self.scale), Math.round(this.bullet[j].h * self.scale))
                }

                if (bul.angle != undefined) {
                    buffer.save()
                    buffer.translateMath.round(((bul.x + bul.w / 2) * self.scale), Math.round((bul.y + bul.h / 2) * self.scale))
                    buffer.rotate(bul.angle)
                    buffer.drawImage(this.bullet[j].image, Math.round(-this.bullet[j].w / 2 * self.scale), Math.round(-this.bullet[j].h / 2 * self.scale), Math.round(this.bullet[j].w * self.scale), Math.round(this.bullet[j].h * self.scale))
                    buffer.restore()
                    bul.x += Math.cos(bul.angle + 90 * Deg2Rad) * bul.speed
                    bul.y += Math.sin(bul.angle + 90 * Deg2Rad) * bul.speed
                    isRot = true

                }

            }


            if (this.bullet[j].image && this.bullet[j].flipX) {
                buffer.save()
                buffer.scale(-1, 1)
                buffer.drawImage(this.bullet[j].image, Math.round(-this.bullet[j].x * self.scale), Math.round(this.bullet[j].y * self.scale), Math.round(-this.bullet[j].w * self.scale), Math.round(this.bullet[j].h * self.scale))
                buffer.restore()
                return
            }


            else if (this.bullet[j].image && this.bullet[j].flipY) {
                buffer.save()
                buffer.scale(1, -1)
                buffer.drawImage(this.bullet[j].image, Math.round(this.bullet[j].x * self.scale), Math.round(-this.bullet[j].y * self.scale), Math.round(this.bullet[j].w * self.scale), Math.round(-this.bullet[j].h * self.scale))
                buffer.restore()
                return
            }

        }



        if (this.angle && this.look == "up" || this.angle && this.look == "down") {
            buffer.save()
            centerX = Math.round((this.x + this.w * 0.5) * self.scale)
            centerY = Math.round((this.y + this.h * 0.5) * self.scale)
            buffer.translate(centerX, centerY)
            buffer.rotate(this.angle)

            if (this.angle <= 3 && this.reverse) {
                buffer.scale(1, -1)
            }

            if (this.angle <= -0 && this.reverse) {
                buffer.scale(1, -1)
            }

            buffer.globalAlpha = this.alpha
            buffer.drawImage(this.image, Math.round(-this.w / 2 * self.scale), Math.round(-this.h / 2 * self.scale), Math.round(this.w * self.scale), Math.round(this.h * self.scale))
            buffer.restore()

            return
        }


        else if (this.angle && this.look == "left" || this.look == "right") {
            buffer.save()
            centerX = (this.x + this.w / 2) * self.scale
            centerY = (this.y + this.h / 2) * self.scale
            buffer.translate(Math.round(centerX), Math.round(centerY))
            buffer.rotate(this.angle)
            if (this.angle <= 3 && this.reverse) {
                buffer.scale(1, -1)
            }

            if (this.angle <= -0 && this.reverse) {
                buffer.scale(1, -1)
            }

            buffer.globalAlpha = this.alpha
            buffer.drawImage(this.image, -this.w / 8 * self.scale,
                -this.h / 2 * self.scale, this.w * self.scale, this.h * self.scale)

            buffer.restore()
            return
        }


        if (this.rotation) { rotImage = true }
        if (this.flipX && !this.rotation) {
            for (var j = 0; j < this.bullet.length; j++) {
                if (this.bullet[j].image) {
                    buffer.drawImage(this.bullet[j].image, Math.round(-this.bullet[j].x * self.scale), Math.round(this.bullet[j].y * self.scale), Math.round(-this.bullet[j].w * self.scale), Math.round(this.bullet[j].h * self.scale))
                    buffer.globalAlpha = 1

                } else {
                    if (this.bullet[j].w > 0 && this.bullet[j].h > 0) {
                        buffer.save()
                        buffer.scale(-1, 1)
                        buffer.fillStyle = this.bullet[j].color
                        buffer.fillRect(Math.round(-this.bullet[j].x * self.scale), Math.round(this.bullet[j].y * self.scale), Math.round(-this.bullet[j].w * self.scale), Math.round(this.bullet[j].h * self.scale))
                        buffer.restore()
                        return
                    }

                    if (this.bullet[j].w == 0 && this.bullet[j].h == 0) {
                        buffer.beginPath()
                        buffer.save()
                        buffer.scale(-1, 1)
                        buffer.arc(Math.round(-this.bullet[j].x * self.scale), Math.round(this.bullet[j].y * self.scale), Math.round(-this.bullet[j].r * self.scale), 0, Math.round(Math.PI * 2))
                        buffer.fill()
                        buffer.closePath()
                        buffer.restore()
                        return
                    }

                }


            }


        }


        if (this.flipX && !rotImage) {
            if (rotImage) { return }
            buffer.save()
            buffer.scale(-1, 1)
            buffer.globalAlpha = this.alpha
            buffer.drawImage(this.image, Math.round(-this.x * self.scale), Math.round(this.y * self.scale), Math.round(-this.w * self.scale), Math.round(this.h * self.scale))
            buffer.globalAlpha = 0
            buffer.restore()
            return
        }

        if (this.flipY && !rotImage) {
            if (rotImage) { return }
            buffer.save()
            buffer.scale(1, -1)
            buffer.globalAlpha = this.alpha
            buffer.drawImage(this.image, Math.round(this.x * self.scale), Math.round(-this.y * self.scale),
                Math.round(this.w * self.scale), Math.round(-this.h * self.scale))
            buffer.restore()
            return
        }


        if (!this.flipX && imSet && !rotImage) {
            if (rotImage) { return }
            buffer.globalAlpha = this.alpha
            buffer.drawImage(this.image, this.x * self.scale, this.y * self.scale, this.w * self.scale, this.h * self.scale)
        }

        if (!this.flipY && !this.rotation) {
            if (rotImage) { return }
            buffer.globalAlpha = this.alpha
            buffer.drawImage(this.image, this.x * self.scale, this.y * self.scale, this.w * self.scale, this.h * self.scale)
            return
        }

        if (this.rotation && this.flipX && rotImage) {

            buffer.save()
            centerX = (this.x) * self.scale
            centerY = (this.y) * self.scale
            buffer.translate(Math.round(centerX), Math.round(centerY))
            buffer.scale(-1, 1)
            buffer.rotate((this.rotation))
            buffer.globalAlpha = this.alpha
            buffer.drawImage(this.image, Math.round(-this.w / 8), Math.round(-this.h / 2), this.w, this.h)
            buffer.restore()

            return
        }

        if (this.rotation && !this.flipX && rotImage) {

            buffer.save()
            centerX = (this.x) * self.scale
            centerY = (this.y) * self.scale
            buffer.translate(Math.round(centerX), Math.round(centerY))
            buffer.rotate((this.rotation + 90 * Deg2Rad))
            buffer.globalAlpha = this.alpha
            buffer.drawImage(this.image, Math.round(-this.w / 8), Math.round(-this.h / 2), this.w, this.h)
            buffer.restore()

            return
        }

    }

    //Developper : Jean .F CÉRÉLUS


    this.addBullet = function (x, y, w, h, color, r, angle, speed) {
        this.obj = {
            x: x,
            y: y,
            w: w,
            h: h,
            color: color,
            r: r,
            angle: angle,
            direction: this.direction(),
            fired: false,
            speed
        }



        if (this.obj.direction != null || this.obj.angle != null) {
            this.bullet.push(this.obj)

        }



    }


    this.addBulletIm = function (x, y, w, h, imSrc, angle, speed) {
        this.obj = {
            x: x,
            y: y,
            w: w,
            h: h,
            flipX: false,
            flipY: false,
            angle: angle,
            direction: this.direction(),
            fired: false,
            speed
        }


        imSet = true
        this.obj.image = new Image()

        this.obj.image.src = imSrc

        if (this.obj.direction || this.obj.angle) {
            this.bullet.push(this.obj)
        }

    }

    // bullet durection direction

    this.direction = () => {
        if (this.angle != null) return
        if (this.vx > 0) {
            return 1
        }

        if (this.vx < 0) {
            return - 1
        }

        if (this.vy > 0) {
            return 2
        }

        if (this.vy < 0) {
            return - 2
        }



    }


    // rotate sprite
    var i = 0;
    this.SpriteRot = function () {
        i += 8
        this.drawSpriteRot(i);

    }


    this.drawSpriteRot = function (angle) {
        buffer.save()
        buffer.translate(x, y);
        buffer.rotate(angle * Deg2Rad);
        buffer.fillStyle = this.color
        buffer.fillRect(Math.round((-this.w / 2) * self.scale), Math.round((-this.h / 2) * self.scale), this.w * self.scale, this.h * self.scale);
        buffer.restore()

    }



    // rotate spriteImage


    var i = 0;
    this.SpriteRot = function () {
        i += 8
        this.drawSpriteRot(i);

    }


    this.drawSpriteImgRot = function (angle) {

        buffer.save()
        buffer.translate(x, y);
        buffer.rotate(angle * Deg2Rad);
        buffer.fillRect(Math.round((-this.w / 2) * self.scale), Math.round((-this.h / 2) * self.scale), this.w * self.scale, this.h * self.scale);
        buffer.restore()
        return this

    }

}


// circle method

let Circle = function (x, y, r, vx, vy, color, id) {
    this.x = x
    this.y = y
    this.r = r
    this.vx = vx
    this.vy = vy
    this.id = id
    this.left = false
    this.setGravity = function (x) {
        this.gravity = x
        this.isDrawn = false
        this.hasShadow = false
    }


    this.jumpTime = 0
    this.color = color

    this.bullet = []

    this.bullet.image = new Image()

    this.createShadow = function (shape) {
        this.shape = shape
        this.hasShadow = true
        this.r = 8

        if (this.onFloor) {
            this.shadowY = this.collider.y + this.collider.h - 2

        }
        if (!this.onFloor) {
            this.shadowY = this.collider.y + this.collider.h * 2
        }
    }


    //handle gravity
    this.setBody = (gv) => {
        if (camera)
            if (!canDraw(this, camera)) return

        this.gv = gv
        if (this.gv == undefined) {
            this.setGravity(20)
            this.vy += this.gravity * 0.017
            this.y += Math.floor(this.vy)
            this.hasShadow = false
        }
        else {
            if (this.gv > 20) this.gv = 20
            this.setGravity(this.gv)
            this.setGravity(this.gv)
            this.vy += this.gravity * 0.017
            this.y += Math.floor(this.vy)
            this.hasShadow = false
        }
    }

    // draw circle

    this.drawCirc = function () {

        if (this.hasShadow) {
            buffer.save()
            if (this.shape == "circle") {
                buffer.beginPath()
                buffer.scale(1, 0.5)
                buffer.fillStyle = "rgba(0,0,0,0.5)"
                buffer.arc((this.x + this.w / 2) * self.scale, this.shadowY * self.scale * 2, this.r * self.scale, 0, Math.PI * 2)
                buffer.fill()
                buffer.closePath()

            }
            if (this.shape == "rect") {
                buffer.fillStyle = "rgba(0,0,0,0.5)"
                if (!this.collider) {
                    buffer.fillRect(this.x * self.scale, this.shadowY * self.scale, this.w * self.scale, this.h * self.scale)
                } else
                    buffer.fillRect(this.collider.x * self.scale, this.shadowY * self.scale, this.collider.w * self.scale, this.collider.h * self.scale)
            }

            buffer.restore()

        }

        if (this.vx > 0) {
            this.left = false
        } else if (this.vx < 0) {
            this.left = true
        }

        buffer.beginPath()
        buffer.fillStyle = this.color
        buffer.arc(this.x * self.scale, this.y * self.scale, this.r * self.scale, 0, Math.PI * 2)
        buffer.fill()
        buffer.closePath()

        this.isDrawn = true


        for (b of this.bullet) {
            buffer.fillStyle = b.color
            if (b.w > 0 && b.h > 0) {
                buffer.fillStyle =
                    buffer.fillRect(b.x * self.scale, b.y * self.scale, b.w * self.scale, b.h * self.scale)
            }

            if (b.w == 0 && b.h == 0) {
                buffer.beginPath()
                buffer.arc(b.x * self.scale, b.y * self.scale, b.r * self.scale, 0, Math.PI * 2)
                buffer.fill()
                buffer.closePath()
            }


        }


    }


    this.addBullet = function (x, y, w, h, color, r, speed) {
        this.obj = {
            x: x,
            y: y,
            w: w,
            h: h,
            color: color,
            r: r,
            direction: this.direction(),
            fired: false,
            speed

        }

        if (this.obj.direction || this.obj.angle) {
            this.bullet.push(this.obj)
        }

    }



    this.addBulletIm = function (x, y, w, h, imSrc, speed) {
        this.obj = {
            x: x,
            y: y,
            w: w,
            h: h,
            flipX: false,
            flipY: false,
            direction: this.direction(),
            fired: false,
            speed

        }


        imSet = true
        this.obj.image = new Image()
        this.obj.image.src = imSrc

        if (this.obj.direction || this.obj.angle) {
            this.bullet.push(this.obj)
        }

    }


    // bullet durection direction

    this.direction = function () {

        if (this.vx < 0) {
            return - 1
        }

        else if (this.vx > 0) {
            return 1
        }

        else if (this.vy < 0) {
            return - 2
        }

        else if (this.vy > 0) {
            return 2
        }




    }

}
// spriteSheet
let SpriteSheet = function (col, row, sw, sh, x, y, w, h, vx, vy, id) {
    this.row = row
    this.col = col
    this.sw = sw
    this.sh = sh
    this.x = x
    this.y = y
    this.w = w
    this.h = h
    this.vx = vx
    this.vy = vy
    this.id = id
    this.angle
    this.fadeOut = false
    this.isDead = false
    this.flipX = false
    this.flipY = false
    this.left = false
    this.isRot = false
    this.isFalling = false
    this.hasShadow = false
    this.setGravity = function (x) {
        this.gravity = x
        this.isDrawn = false

    }
    this.alpha = 1

    this.jumpTime = 0
    // reverse for rotation
    this.reverse = false

    this.createShadow = function (shape) {
        this.shape = shape
        this.hasShadow = true
        this.r = 8

        if (this.onFloor) {
            this.shadowY = this.collider.y + this.collider.h - 2

        }
        if (!this.onFloor) {
            this.shadowY = this.collider.y + this.collider.h * 2
        }
    }



    //handle gravity
    this.setBody = (gv) => {
        if (camera)
            if (!canDraw(this, camera)) return

        this.gv = gv
        if (this.gv == undefined) {
            this.setGravity(20)
            this.vy += this.gravity * 0.017
            this.y += Math.floor(this.vy)
            this.hasShadow = false
        }
        else {
            if (this.gv > 20) this.gv = 20
            this.setGravity(this.gv)
            this.setGravity(this.gv)
            this.vy += this.gravity * 0.017
            this.y += Math.floor(this.vy)
            this.hasShadow = false
        }
    }

    this.isVisible = false
    this.show = false

    imSet = true
    this.image = new Image()
    this.bullet = []

    this.bullet.image = new Image()


    //spritesheet image
    this.drawSpriteSheet = function () {

        if (this.hasShadow) {
            buffer.save()

            if (this.shape == "circle") {

                buffer.beginPath()
                buffer.scale(1, 0.5)
                buffer.fillStyle = "rgba(0,0,0,0.3)"
                if (this.flipX) {
                    if (this.collider) {
                        buffer.arc(Math.round(((this.x) + this.w / 2) * self.scale), Math.round(this.shadowY * self.scale * 2, this.r * self.scale), 0, Math.PI * 2)
                        buffer.fill()
                    } else {
                        buffer.arc((Math.round((this.x + 6) + this.w / 2) * self.scale), Math.round(this.shadowY * self.scale * 2), this.r * self.scale, 0, Math.PI * 2)
                        buffer.fill()
                    }
                } else {

                    buffer.arc(Math.round((this.x + this.w / 2) * self.scale), Math.round(this.shadowY * self.scale * 2), this.r * self.scale, 0, Math.PI * 2)
                    buffer.fill()
                    buffer.closePath()
                }
            }
            if (this.shape == "rect") {
                buffer.fillStyle = "rgba(0,0,0,0.3)"
                if (!this.collider) {
                    buffer.fillRect(this.x * self.scale, this.shadowY * self.scale, this.w * self.scale, this.h * self.scale)
                } else
                    if (this.flipX) {
                        buffer.fillRect((this.x + this.w / 3.5) * self.scale, (this.shadowY - 4) * self.scale, this.r * self.scale, this.r * self.scale)
                    } else {
                        buffer.fillRect(this.x + this.w / 3.5 * self.scale, (this.shadowY - 4) * self.scale, this.r * self.scale, this.r * self.scale)

                    }
            }

            buffer.restore()

        }


        if (this.vx > 0) {
            this.left = false
        }
        if (this.vx < 0) {
            this.left = true
        }
        if (this.vy > 0 && !this.onFloor) {
            this.isFalling = true
        }


        if (!this.angle) {
            this.isRot = true
        } else {
            this.isRot = false
        }

        for (var j = 0; j < this.bullet.length; j++) {
            var bul = this.bullet[j]

            this.drawAngularBullet(bul)
            this.drawPixelBullet(bul)
            this.drawImageBullet(bul)

        }

        if (this.angle && this.look == "up" || this.angle && this.look == "down") {
            buffer.save()
            centerX = Math.round((this.x + this.w * 0.5) * self.scale)
            centerY = Math.round((this.y + this.h * 0.5) * self.scale)
            buffer.translate(centerX, centerY)
            buffer.rotate(this.angle)
            if (this.angle <= 3 && this.reverse) {
                buffer.scale(1, -1)
            }

            if (this.flipY) {
                buffer.scale(1, -1)
            }

            if (this.angle <= -0 && this.reverse) {
                buffer.scale(1, -1)
            }
            buffer.drawImage(this.image, this.col * this.sw, this.row * this.sh,
                this.sw, this.sh, Math.round(-this.w / 2 * self.scale), Math.round(-this.h / 2 * self.scale),
                Math.round(this.w * self.scale), Math.round(this.h * self.scale))
            buffer.restore()

        }
        else if (this.angle && this.look == "left" || this.angle && this.look == "right") {
            buffer.save()
            centerX = Math.round((this.x + this.w * 0.5) * self.scale)
            centerY = Math.round((this.y + this.h * 0.5) * self.scale)
            buffer.translate(centerX, centerY)
            buffer.rotate(this.angle)
            if (this.angle <= 3 && this.reverse) {
                buffer.scale(1, -1)
            }

            if (this.angle <= -0 && this.reverse) {
                buffer.scale(1, -1)
            }
            buffer.drawImage(this.image, this.col * this.sw, this.row * this.sh,
                this.sw, this.sh, Math.round(-this.w / 2 * self.scale), Math.round(-this.h / 2 * self.scale),
                Math.round(this.w * self.scale), Math.round(this.h * self.scale))
            buffer.restore()

        }


        if (this.flipY) {
            buffer.save()
            buffer.scale(1, -1)
            buffer.drawImage(this.image, this.col * this.sw, this.row * this.sh, this.sw, this.sh, Math.round(this.x * self.scale), Math.round(-this.y * self.scale), Math.round(this.w * self.scale), Math.round(-this.h * self.scale))
            buffer.restore()

        }

        if (this.flipX) {
            buffer.save()
            buffer.scale(-1, 1)
            buffer.globalAlpha = this.alpha
            buffer.drawImage(this.image, this.col * this.sw, this.row * this.sh, this.sw,
                this.sh, Math.round(-(this.x + this.w) * self.scale), Math.round(this.y * self.scale),
                Math.round(this.w * self.scale), Math.round(this.h * self.scale))
            buffer.restore()
        }

        if (!this.flipX && !this.rotation && this.look == undefined) {
            buffer.globalAlpha = this.alpha
            buffer.drawImage(this.image, this.col * this.sw, this.row * this.sh, this.sw, this.sh,
                (this.x) * self.scale, this.y * self.scale, this.w * self.scale, this.h * self.scale)
        }


        if (this.isVisible) {
            buffer.save()
            buffer.fillStyle = this.collider.color
            buffer.fillRect(this.collider.x * self.scale, this.collider.y * self.scale,
                this.collider.w * self.scale, this.collider.h * self.scale)
            buffer.restore()
        }

        if (this.fadeOut) {
            buffer.save()
            buffer.putImageData(this.pixel, this.x, this.y);
            buffer.restore()
        }

        if (this.show) {
            buffer.save()
            buffer.fillStyle = this.detector.color
            buffer.fillRect(this.detector.x * self.scale, this.detector.y * self.scale,
                this.detector.w * self.scale, this.detector.h * self.scale)
            buffer.restore()
        }

        if (this.enable) {
            buffer2.save()
            this.render()
            buffer2.restore()
        }

    }

    this.addBullet = function (x, y, w, h, color, r, angle, speed) {
        this.obj = {
            x: x,
            y: y,
            w: w,
            h: h,
            color: color,
            r: r,
            angle: angle,
            direction: this.direction(),
            fired: false,
            speed
        }

        if (this.obj.direction != null || this.obj.angle != undefined) {
            this.bullet.push(this.obj)

        }
    }

    this.addBulletIm = function (x, y, w, h, imSrc, angle, speed) {
        this.obj = {
            x: x,
            y: y,
            w: w,
            h: h,
            flipX: false,
            flipY: false,
            angle: angle,
            direction: this.direction(),
            fired: false,
            speed

        }

        var imSet = true
        this.obj.image = new Image()
        this.obj.image.src = imSrc
        this.bullet.push(this.obj)
    }

    // bullet direction 

    this.direction = function () {
        if (this.angle != undefined) return
        if (this.vx > 0) {
            return 1
        }

        if (this.vx < 0) {
            return - 1
        }

        if (this.gravity == 0 && this.vy > 0) {
            return 2
        }

        if (this.gravity == 0 && this.vy < 0) {
            return - 2
        }
        return null
    }

    // rotate spriteSheet
    var i = 0;
    this.SpriteSheetRot = function (i) {
        i += 8;
        this.drawSpriteSheetRot(i);
    }

    this.drawSpriteSheetRot = function (angle) {
        buffer.save()
        buffer.translate(Math.round(x * self.scale), Math.round(y * self.scale));
        buffer.rotate(angle * Deg2Rad);
        buffer.drawImage(this.image, this.col * this.sw, this.row * this.sh,
            this.sw, this.sh, Math.round(-(this.w / 2) * self.scale), Math.round(-(height / 2) * self.scale),
            Math.round(this.w * self.scale), Math.round(this.h * self.scale));
        buffer.restore()
    }

    this.drawPixelBullet = function (bul) {
        if (!bul.image && !bul.angle) {
            if (bul.w > 0 && bul.direction == 1 || bul.direction == -1 || bul.direction == - 2 || bul.direction == 2) {
                buffer.fillStyle = bul.color
                buffer.fillRect(Math.round(bul.x * self.scale), Math.round(bul.y * self.scale), Math.round(bul.w * self.scale), Math.round(bul.h * self.scale))
            }

            if (bul.w == 0 && !bul.angle && bul.direction == - 1 || bul.direction == 1 || bul.direction == - 2 || bul.direction == 2) {
                buffer.fillStyle = bul.color
                buffer.beginPath()
                buffer.arc(Math.round(bul.x * self.scale), Math.round(bul.y * self.scale), Math.round(bul.r * self.scale), 0, Math.round(Math.PI * 2))
                buffer.fill()
                buffer.closePath()
            }
        }

    }


    this.drawAngularBullet = function (bul) {

        if (!bul.image && bul.angle) {
            if (bul.r > 0 && bul.w == 0 && bul.h == 0) {
                buffer.fillStyle = bul.color
                buffer.save()
                buffer.beginPath()
                buffer.arc(Math.round((bul.x + bul.r / 3.5) * self.scale), Math.round((bul.y + bul.r / 3.5) * self.scale),
                    Math.round(bul.r * self.scale), 0, Math.round(Math.PI * 2))
                buffer.fill()
                buffer.closePath()
                bul.x += Math.cos(bul.angle + 90 * Deg2Rad) * bul.speed
                bul.y += Math.sin(bul.angle + 90 * Deg2Rad) * bul.speed
                this.isRot = true
                buffer.restore()
            }

            if (bul.r == 0 && bul.angle && bul.w > 0) {
                buffer.fillStyle = bul.color
                buffer.save()
                buffer.translate(Math.round((bul.x + bul.w / 2) * self.scale), Math.round((bul.y + bul.h / 2) * self.scale))
                buffer.rotate(bul.angle)
                buffer.fillRect(Math.round(-bul.w / 2 * self.scale), Math.round(-bul.h / 2 * self.scale), Math.round(bul.w * self.scale), Math.round(bul.h * self.scale))
                bul.x += Math.cos(bul.angle + 90 * Deg2Rad) * bul.speed
                bul.y += Math.sin(bul.angle + 90 * Deg2Rad) * bul.speed
                this.isRot = true
                buffer.restore()

            }
        }

        else if (bul.image && bul.angle) {
            buffer.save()
            buffer.translate(Math.round((bul.x + bul.w / 3.5) * self.scale), Math.round((bul.y + bul.h / 3.5) * self.scale))
            buffer.rotate(bul.angle + 90 * Deg2Rad)
            buffer.drawImage(bul.image, Math.round(-bul.w / 3.5 * self.scale), Math.round(-bul.h / 3.5 * self.scale), Math.round(bul.w * self.scale), Math.round(bul.h * self.scale))
            buffer.restore()
            bul.x += Math.cos(bul.angle + 90 * Deg2Rad) * bul.speed
            bul.y += Math.sin(bul.angle + 90 * Deg2Rad) * bul.speed
            this.isRot = true

        }

    }


    this.drawImageBullet = function (bul) {

        if (bul.image && !bul.angle) {
            if (!bul.flipX && !bul.flipY && !bul.angle) {
                buffer.drawImage(bul.image, Math.round((bul.x - 5) * self.scale), Math.round(bul.y * self.scale), Math.round(bul.w * self.scale), Math.round(bul.h * self.scale))
            }

            if (bul.flipX && !bul.angle) {
                buffer.save()
                buffer.scale(-1, 1)
                buffer.globalAlpha = 1
                buffer.drawImage(bul.image, Math.round(-(bul.x - 5) * self.scale), Math.round(bul.y * self.scale), Math.round(-bul.w * self.scale), Math.round(bul.h * self.scale))
                buffer.restore()
                buffer.globalAlpha = 0
            }

            if (bul.flipY && !bul.angle) {
                buffer.save()
                buffer.scale(1, -1)
                buffer.drawImage(bul.image, Math.round(bul.x * self.scale), Math.round(-bul.y * self.scale), Math.round(bul.w * self.scale), Math.round(-bul.h * self.scale))
                buffer.restore()

            }
        }
    }
}

// light from object
SpriteSheet.prototype.useLight = function (radius, opacity, darkness) {
    this.r = radius
    this.opacity = opacity
    this.darkness = darkness || 0.0
    this.enable = true
    this.light = {
        x: this.x + this.w / 2,
        y: this.y + this.h / 2,
        r: this.r
    }

    this.update = function () {
        this.light.x = this.x - (camera.x - this.w / 2) + this.w * delta
        this.light.y = this.y - (camera.y - this.h / 2) + this.y * delta
    }

    this.render = function () {
        ctx.clearRect(0, 0, gW, gH)
        buffer3.clearRect(0, 0, gW, gH)
        buffer3.save()
        buffer3.imageSmoothingEnabled = false
        self.useDarkness(this.darkness)
        ctx.globalCompositeOperation = "lighter"
        buffer3.beginPath()
        buffer3.fillStyle = `rgba(255,255,255,${this.opacity})`
        ctx.globalCompositeOperation = "overlay"
        buffer3.arc(this.light.x * self.scale, this.light.y * self.scale, this.light.r * self.scale, 0, Math.PI * 2)
        buffer3.fill()
        buffer3.closePath()
        buffer3.restore()

    }

    return this

}


//all possible simple collisions detection


//this is for cirlcle and square or rect collision
function isOverlap(b, a) {
    var dx = Math.abs(a.x - (b.x + b.w / 2));
    var dy = Math.abs(a.y - (b.y + b.h / 2));
    if (dx <= a.r + a.r + b.w / 2 && dy <= a.r + a.r + b.h / 2) {
        return true

    }




}



//this is for AABB Collision
function isCollide(a, b) {

    try {
        let dist = a.y - b.y
        if (a.x + a.w >= b.x &&
            a.x <= b.x + b.w &&
            a.y + a.h >= b.y &&
            a.y <= b.y + b.h ||
            a.x + a.w >= b.x &&
            a.x <= b.x + b.width &&
            a.y + a.h >= b.y &&
            a.y <= b.y + b.height) {
            if (b.gid != undefined) return false
            return true
        }
        else if (dist <= 1 && b.gid && a.x + a.w >= b.x &&
            a.x <= b.x + b.width &&
            a.y + a.h >= b.y - b.height &&
            a.y <= (b.y - b.height) + b.height) {
            return true
        } else {
            return false
        }
    } catch (err) {

    }
}




//this is for Circle vs  circle Collision
function isInterCirc(a, b) {
    dx = a.x - b.x
    dy = a.y - b.y

    sumr = a.r + b.r
    distance = Math.sqrt(dx * dx + dy * dy)

    if (distance <= sumr) {
        return true
    }

}




/* tilemap without using tiled editor
or else */


function tileMap(lev, colTCount, rowTCount, total, ts, s, Src, w, h) {
    this.image = new Image()
    this.image.src = Src
    this.lev = lev
    this.total = total
    this.colTCount = colTCount
    this.rowTCount = lev.length
    this.ts = ts * self.scale
    this.s = s * self.scale
    this.w = w
    this.h = h

    this.image.onload = () => this.drawLayer();

    this.drawLayer = function () {

        for (var r = 0; r < this.rowTCount; r++) {
            for (var col = 0; col < this.colTCount; col++) {
                var tile = this.lev[r][col]

                var tileRow = (tile / this.total) >> 0
                var tileCol = (tile % this.total) >> 0

                if ((tileCol + ts) < camera.x || (tileCol + ts) > camera.x + camera.width + 100) { /*isDrawable = false*/ } else { isDrawable = true }
                if (isDrawable) {

                    if (this.w == undefined && this.h == undefined) {
                        buffer.drawImage(this.image, (tileCol * ts), (tileRow * ts), ts * self.scale, ts * self.scale, col * s, r * s, s * self.scale, s * self.scale)

                    }

                    if (this.w != undefined && this.h != undefined) {
                        buffer.drawImage(this.image, (tileCol * ts), (tileRow * ts), ts * self.scale, ts * self.scale, col * s, r * s, this.w * self.scale, this.h * self.scale)
                    }
                }
            }

        }


    }


    return this

}









/*Jcerelus Dev All Rights Reserved
Developper : Jean .F CÉRÉLUS
canvasJs is a javascript canvas library, 
that makes you develop game very  quick
all of the work is done behind the scene.
Developper : Jean .F CÉRÉLUS
*/


function isFollow(a, b, width) {
    b.goLeft = false
    b.goRight = false
    width = width | 140
    if (b.collider && a.collider) {
        var gap = Math.abs(a.collider.x - b.collider.x)
        var diffY = Math.abs(a.collider.y - b.collider.y)

        if (gap <= 20 && gap >= -25) {
            return
        }

        if (gap <= width && diffY <= 30 && b.collider.x > a.collider.x) {
            b.goLeft = true
            b.goRight = false
            return true
        }

        if (gap <= width && diffY <= 30 && b.collider.x < a.collider.x) {
            b.goLeft = false
            b.goRight = true
            return true
        }
        return false
    }
}


function createGrid(gap, gW, gH, color) {
    this.gap = gap
    this.w = gW
    this.h = gH
    this.color = color

    this.drawGrid = function () {
        buffer.beginPath()
        for (var x = this.gap; x < this.w; x += this.gap) {
            buffer.moveTo(x * self.scale, 0)
            buffer.lineTo(x * self.scale, this.h * self.scale)
            buffer.strokeStyle = this.color
            buffer.stroke()
            buffer.closePath()

        }

        for (var y = this.gap; y < this.h; y += this.gap) {
            buffer.beginPath()
            buffer.moveTo(0, y * self.scale)
            buffer.lineTo(this.w * self.scale, y * self.scale)
            buffer.strokeStyle = this.color
            buffer.stroke()
            buffer.closePath()
        }




    }

}



function addNumber(col, row, tSize, color) {
    this.col = col;
    this.row = row;
    this.tSize = tSize;
    this.color = color;
    let offset = 6
    this.spaceX = spaceX = tSize / 2 - offset;
    this.spaceY = spaceY = tSize / 2;

    this.show = () => {
        for (var r = 0; r <= this.row; r++) {
            for (var cl = 0; cl <= this.col; cl++) {
                var count = cl + r * (this.col); // Adjust count calculation

                buffer.font = "10px arial bold";
                buffer.fillStyle = this.color;
                buffer.fillText(count, cl * this.tSize * self.scale + this.spaceX * self.scale, r * this.tSize * self.scale + this.spaceY * self.scale);
            }
        }
    };

    return this;
}




//tileMap with tiled Editor
var row
var column
let loader = false
let that
var data

let isLoading = false
var isLayer = false
var isObject = false

//collection of image map
function MapFromCollection(path, imageSrc) {
    that = this
    that.path = path
    that.src = imageSrc
    that.load = function () {
        var xhr = new XMLHttpRequest();
        xhr.open("get", that.path);
        xhr.responseType = "json";
        xhr.send();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                isLoading = true;
                data = xhr.response;
                return data

            }
        };


    }

}

MapFromCollection.prototype.renderLayer = function (layer) {
    const tilesets = data.tilesets;
    if (layer.type === 'tilelayer' && layer.type != "objectgroup") {
        const chunks = layer.chunks;
        chunks.forEach(chunk => {
            // Draw tiles based on chunk data
            const data = chunk.data;
            const tilesetWidth = tilesets[0].tilewidth;
            const tilesetHeight = tilesets[0].tileheight;
            const tiles = tilesets[0].tiles;

            data.forEach((tile, index) => {
                if (tile != null) {

                    const tileImage = new Image();
                    try {
                        layerImsrc = tilesets[0].tiles[tile].image
                        tileImage.src = layerImsrc//tiles[tile ].image;
                    } catch (err) { }
                    const tileX = chunk.x + (index % chunk.width) * tilesetWidth;
                    const tileY = chunk.y + Math.floor(index / chunk.width) * tilesetHeight; buffer2.imageSmoothingEnabled = false;
                    buffer.imageSmoothingEnabled = false;
                    buffer.drawImage(tileImage, tileX, tileY, tilesetWidth, tilesetHeight);
                }
            });
        });
    }
}

MapFromCollection.prototype.renderObjectLayer = function (layer) {
    const tilesets = data.tilesets;
    if (layer.type === 'objectgroup') {
        const objects = layer.objects;
        objects.forEach(object => {
            let pattern = /..\/+/
            const objectImage = new Image();
            objectImage.src = tilesets[0].tiles[object.gid - 1].image.replace(pattern, `${that.src}/`);
            buffer.drawImage(objectImage, object.x, object.y, object.width, object.height);


        });
    }


}



//tileset based map
let isErrorDisplay = false
function tiledMap(path, size) {

    that = this
    that.path = path
    that.size = size

    that.load = function () {
        xhr = new XMLHttpRequest()
        xhr.onload = function () {
            if (this.readyState == 4) {
                try {
                    data = JSON.parse(xhr.response)

                    for (let prop in data) {
                        if (prop) {
                            loader = true
                        } else {
                            log("no data")
                        }
                    }

                } catch (err) {

                }


            }

        }

        xhr.open("get", that.path)
        xhr.send(true)

    }

    return that
}


/*tiledMap.prototype.renderLayer = function (layer, tilesetImage) {
    let size = that.size
    layer.image = new Image()
    layer.image.src = tilesetImage
    const layerWidth = layer.width;
    const layerHeight = layer.height;

    let tid, tX, tY, dX, dY, isDrawable;


    for (let r = 0; r < layerHeight; r++) {
        for (let col = 0; col < layerWidth; col++) {
            const index = col + r * layerWidth;
            tid = layer.data[index];
            // Find the corresponding tileset
            var tile = data.tilesets.find((ts) => tid >= ts.firstgid && tid < ts.firstgid + ts.tilecount);

            if (tid == 0) continue
            if (!tile) continue
            let localId = tid - tile.firstgid

            const tilesPerRow = Math.floor(tile.imagewidth / tile.tilewidth)

            tX = (localId % tilesPerRow) * size;
            tY = Math.floor(localId / tilesPerRow) * size;
            dX = (index % layerWidth) * size;
            dY = Math.floor(index / layerWidth) * size;

            // Check if tile is within camera bounds
            isDrawable =
                (dX + size >= camera.x && dX <= camera.x + camera.width + 100) &&
                (dY + size >= camera.y && dY <= camera.y + camera.height + 100);

            if (isDrawable) {
                buffer.drawImage(layer.image, tX, tY, size, size, dX * self.scale, dY * self.scale, size * self.scale, size * self.scale);

            }

        }


    }


}*/




var animLayer = false
tiledMap.prototype.renderLayer = function (layer, tilesetImage) {
    let size = that.size
    layer.image = new Image()
    layer.image.src = tilesetImage
    const layerWidth = layer.width;
    const layerHeight = layer.height;

    for (let r = 0; r < layerHeight; r++) {
        for (let col = 0; col < layerWidth; col++) {
            const index = col + r * layerWidth;
            let tid = layer.data[index];
            // Skip empty tiles
            if (tid == 0) continue;

            // Find the corresponding tileset
            const tile = data.tilesets.find((ts) => tid >= ts.firstgid && tid < ts.firstgid + ts.tilecount);
            if (!tile) continue;

            // Handle animated tiles if they exist
            if (tile.tiles && isDrawable) {

                // Get the local ID first
                const localId = tid - tile.firstgid;
                // Find the tile info by matching the local ID
                const tileInfo = data.tilesets.find((ts) => tid >= ts.firstgid && tid < ts.firstgid + ts.tilecount);

                if (tileInfo) {
                    // Animation handling
                    for (let t in tileInfo.tiles) {
                        const anim = tileInfo.tiles[t].animation;
                        const now = Date.now();
                        const totalDuration = anim.reduce((sum, frame) => sum + frame.duration, 0);
                        const elapsed = now % totalDuration;

                        let durationSum = 0;
                        for (const frame of anim) {
                            durationSum += frame.duration;
                            if (elapsed < durationSum) {
                                tid = tile.firstgid + frame.tileid;

                                break;
                            }
                        }
                    }
                }
            }

            let localId = tid - tile.firstgid;
            const tilesPerRow = Math.floor(tile.imagewidth / tile.tilewidth);

            tX = (localId % tilesPerRow) * size;
            tY = Math.floor(localId / tilesPerRow) * size;
            dX = (index % layerWidth) * size;
            dY = Math.floor(index / layerWidth) * size;

            // Check if tile is within camera bounds
            isDrawable =
                (dX + size >= camera.x && dX <= camera.x + camera.width + 100) &&
                (dY + size >= camera.y && dY <= camera.y + camera.height + 100);

            if (isDrawable) {
                buffer.save();
                buffer.globalAlpha = 1;
                buffer.drawImage(
                    layer.image,
                    tX, tY, size, size,
                    dX * self.scale, dY * self.scale,
                    size * self.scale, size * self.scale
                );
                buffer.restore();
            }
        }

    }
}


//Gestion d'animation

var canAnimate = false
tiledMap.prototype.objectAnimation = tileAnimation = function (gidValue, nom, tilesetImage) {
    that.val = gidValue
    this.nom = nom
    that.image = new Image()
    that.image.src = tilesetImage
    for (layer of data.layers) {
        if (layer.type == "objectgroup" && this.nom == layer.name) {

            const tile = data.tilesets.find((ts) => that.val >= ts.firstgid && that.val < ts.firstgid + ts.tilecount)

            if (tile.tiles) {
                var sw = tile.tileheight
                var sh = tile.tilewidth

                isObject = true
                if (data.tiledversion >= "1.11.0") {
                    for (let t in tile.tiles) {
                        anim = tile.tiles[t].animation
                        var numberFrames = anim.length
                        frameIndex = objframe % numberFrames
                        var value
                        value = anim[frameIndex].tileid

                        for (var effect of layer.objects) {

                            if (effect.hasOwnProperty("gid") && effect.gid == that.val && this.nom == layer.name && effect.name != "auto" || !effect.hasOwnProperty("properties")) {
                                canAnimate = true

                            }

                            else {
                                canAnimate = false
                                if (!isErrorDisplay) {
                                    log(" Animation Layer's name is not defined or gidValue is incorrect in tileAnimation \n\n please read the documentation so that you may use tileAnimation correctly !!")
                                    isErrorDisplay = true
                                }

                            }



                            //check for different tsize
                            column = Math.floor((value % tile.columns))
                            objrow = Math.floor(value / tile.columns)


                            if (effect.x + sw < camera.x || effect.x + sw / 2 > camera.x + camera.width) { isDrawable = false } else { isDrawable = true }
                            if (!isDrawable) {
                                canAnimate = false
                            }

                            if (canAnimate) {
                                buffer.save()
                                buffer.globalAlpha = effect.alpha || 1
                                buffer.drawImage(that.image, sw * column, sh * objrow, sw, sh,
                                    effect.x * self.scale, (effect.y - sh) * self.scale, effect.width * self.scale, effect.height * self.scale)
                                buffer.restore()
                            }

                        }

                    }
                }

                else {

                    for (let i = 0; i < tile.tiles.length; i++) {
                        let t = tile.tiles[i]
                        anim = t.animation
                        var numberFrames = anim.length
                        frameIndex = objframe % numberFrames
                        var value
                        value = anim[frameIndex].tileid

                        for (var effect of layer.objects) {

                            if (effect.hasOwnProperty("gid") && effect.gid == that.val && this.nom == layer.name && effect.name != "auto" || !obl.hasOwnProperty("properties")) {
                                canAnimate = true

                            }

                            else {
                                canAnimate = false
                                if (!isErrorDisplay) {
                                    log(" Animation Layer's name is not defined or gidValue is incorrect in tileAnimation \n\n please read the documentation so that you may use tileAnimation correctly !!")
                                    isErrorDisplay = true
                                }

                            }

                            column = Math.floor((value % tile.columns))
                            objrow = Math.floor(value / tile.columns)


                            if (effect.x + sw < camera.x || effect.x + sw / 2 > camera.x + camera.width) { isDrawable = false } else { isDrawable = true }
                            if (!isDrawable) {
                                canAnimate = false
                            }

                            if (canAnimate) {
                                buffer.save()
                                buffer.globalAlpha = effect.alpha || 1
                                buffer.drawImage(that.image, sw * column, sh * objrow, sw, sh,
                                    effect.x * self.scale, (effect.y - sh) * self.scale, effect.width * self.scale, effect.height * self.scale)
                                buffer.restore()
                            }

                        }

                    }

                }

            }

        }
    }

}



//render object layers

tiledMap.prototype.RenderObjectLayer = function (layer, tilesetImage, Gid) {
    layer.image = new Image()
    layer.image.src = tilesetImage
    this.gid = Gid

    layer.objects.forEach(function (obl) {
        obl.alpha = 1
        let gid = obl.gid

        const tile = data.tilesets.find((ts) => gid >= ts.firstgid && gid < ts.firstgid + ts.tilecount);
        tile.rows = tile.tilecount / tile.columns

        var sw = Math.floor(tile.imagewidth / tile.columns)
        var sh = Math.floor(tile.imageheight / tile.rows)

        // it's important for different tile size

        let localId = Math.floor(obl.gid - tile.firstgid)

        let column = (localId % tile.columns)
        let row = Math.floor(localId / tile.columns)
        //log(column)
        if ((obl.x + tile.tilewidth) < (camera.x) || (obl.x + tile.tilewidth) * self.scale > (camera.x + camera.width) * self.scale) { iDrawable = false } else { isDrawable = true }
        if (obl.hasOwnProperty("gid") && obl.gid != that.val && isDrawable) {
            buffer.save()
            buffer.globalAlpha = obl.alpha
            buffer.drawImage(layer.image, sw * column, sh * row, sw, sh
                , obl.x * self.scale, (obl.y - obl.height) * self.scale, obl.width * self.scale, obl.height * self.scale)
            buffer.restore()

        }


    })


}



//return that
//}





function canDraw(a, b) {
    if (a.gid) {
        if ((a.x + a.width) < b.x || (a.x + a.width) > (b.x + b.width)) {
            return false
        } else {
            return true
        }
    } else {
        if ((a.x + a.w) < b.x || (a.x + a.w) >= (b.x + b.width + 100) ||
            (a.y + a.h) < b.y || (a.y + a.h) >= (b.y + b.height + 100) ||
            (a.x + a.r) < b.x || (a.x + a.r) >= (b.x + b.width + 100)) {
            return false
        } else {
            return true
        }
    }
}


function tiledCollider(a, b) {
    if (!b.gid && a.x + a.w >= b.x &&
        a.x <= b.x + b.width &&
        a.y + a.h >= b.y &&
        a.y <= b.y + b.height
    ) {
        return true
    }

    else if (b.gid && a.x + a.w >= b.x &&
        a.x <= b.x + b.width &&
        a.y + a.h >= b.y - b.height &&
        a.y <= (b.y - b.height) + b.height) {
        return true
    }


}



var isX = false

//Vertical rpg Collider
function VrpgCollider(layer, obj) {
    layer.objects.forEach(function (ob) {
        const body = obj.collider


        if (!obj.collider) {
            if (obj.x + obj.w >= ob.x && obj.x <= ob.x + ob.width &&
                obj.y + obj.h >= ob.y && obj.y <= ob.y + ob.height) {
                obj.y = obj.oldY;

            }

        } else {
            if (isCollide(body, ob)) {

                if (obj.vy < 0 && body.y > ob.y) {
                    obj.vy = 0

                    if (obj.vy == 0) {
                        if (obj.shape == "circle")
                            this.shadowY = this.shadowY - 27
                        if (obj.shape == "rect")
                            this.shadowY = this.shadowY - 33
                    }

                    const offset = body.y - obj.y;
                    obj.y = ob.y + ob.height - offset + 0.01
                    body.y = ob.y + ob.height - offset + 0.01
                    return

                }


                if (obj.vy > 0 && ob.y + ob.height >= body.y) {

                    obj.vy = 0
                    obj.jumpTime = 0
                    const offset = body.y - obj.y + body.h;
                    obj.y = ob.y - offset - 0.01
                    //body.y = ob.y - body.h - 0.01
                    return
                }


            }


        }

    })

    return
}


//horizontal rpg collider

function HrpgCollider(layer, obj) {
    if (obj.vx != 0) {
        isX = true
    } else {
        isX = false
    }

    if (isX && !obj.isJumping) { obj.vy = 0 }

    if (!obj.vy == 0) return

    layer.objects.forEach(function (ob) {
        const body = obj.collider
        if (!obj.collider) {
            if (obj.x + obj.w >= ob.x && obj.x <= ob.x + ob.width &&
                obj.y + obj.h >= ob.y && obj.y <= ob.y + ob.height) {
                obj.x = obj.oldX;
                obj.y = obj.oldY;

            }

        } else {

            if (isCollide(body, ob)) {

                if (obj.vx > 0) {
                    obj.onFloor = true
                    obj.vy = 0
                    const offset = body.x - obj.x + body.w;
                    obj.x = ob.x - offset - 0.01;
                    return true
                }



                else if (obj.vx < 0) {
                    obj.onFloor = true
                    obj.vy = 0
                    const offset = body.x - obj.x
                    obj.x = ob.x + ob.width - offset + 0.01

                    return true;
                }

            }
        }

    })


}

//rpg follow

function avoidWalls(obstacles, b, avoidRadius) {

    for (let obstacle of obstacles) {
        var dx = (b.x - obstacle.x)
        var dy = (b.y - obstacle.y)

        let distance = Math.hypot(dx, dy)

        if (distance < avoidRadius) {
            let angleToObstacle = Math.atan2(obstacle.y - b.y, obstacle.x - b.x)
            b.vx -= Math.cos(angleToObstacle)
            b.vy -= Math.sin(angleToObstacle)

        }



    }
}


//rpg follow




function RpgFollow(a, b, gap, obstacles) {
    this.gap = gap
    this.a = a
    this.b = b
    var angle = Math.atan2(this.a.y - this.b.y, this.a.x - this.b.x)

    var dx = (this.a.x - this.b.x)
    var dy = (this.a.y - this.b.y)

    var dist = Math.hypot(dy, dx)
    if (Math.abs(dist) <= 18) return
    if (dist <= this.gap) {


        this.b.vx = Math.cos(angle)
        this.b.vy = Math.sin(angle)
        this.b.x += this.b.vx
        this.b.y += this.b.vy


        let diffX = Math.abs(this.a.x - this.b.x)
        let diffY = (this.a.y - this.b.y)




        if (a.x < b.x && diffX >= 5) {
            this.b.Rside = false;
            this.b.Uside = false;
            this.b.Dside = false;
            avoidWalls(obstacles, b, 300)
            return this.b.Lside = true;

        }
        else if (a.x > b.x && diffX >= 5) {
            this.b.Lside = false;
            this.b.Uside = false;
            this.b.Dside = false;
            avoidWalls(obstacles, b, 300)
            return this.b.Rside = true;

        }

        else if (a.y < b.y) {
            this.b.Rside = false
            this.b.Dside = false
            this.b.Lside = false
            avoidWalls(obstacles, b, 300)
            return this.b.Uside = true;

        }

        else if (a.y > b.y) {
            this.b.Rside = false;
            this.b.Uside = false;
            this.b.Lside = false;
            avoidWalls(obstacles, b, 300)
            return this.b.Dside = true;
        }
        else {
            this.b.vx = 0
            this.b.vy = 0
            return false
        }

    }
}


function sideCollision(obj, layerName) {
    const blocks = self.getObjectLayer(layerName)
    for (let ob of blocks) {
        if (isCollide(obj, ob)) {
            const dx = (obj.x + obj.w / 2) - (ob.x + ob.width / 2)
            const dy = (obj.y + obj.h / 2) - (ob.y + ob.height / 2)
            const width = (obj.w + ob.width) / 2
            const height = (obj.h + ob.height) / 2
            const crossWidth = width * dy
            const crossHeight = height * dx

            if (Math.abs(dx) <= width && Math.abs(dy) <= height) {
                if (crossWidth > crossHeight) {

                    if (crossWidth > - crossHeight) {
                        //bottom
                        obj.y = ob.y + ob.height - 0.01
                    } else {
                        //left
                        obj.x = ob.x - obj.w + 0.01
                    }
                } else {
                    if (crossWidth > - crossHeight) {
                        //right
                        obj.x = ob.x + ob.width - 0.01

                    } else {
                        //top
                        obj.y = ob.y - obj.h + 0.01

                        if (obj.hasOwnProperty("gravity")) {
                            obj.jumpTime = 0
                            obj.onFloor = true
                        }
                    }
                }
            }
            obj.vx = 0
            obj.vy = 0

        }
    }

}


function topdownCollision(obj, layerName) {
    const blocks = self.getObjectLayer(layerName)
    for (let ob of blocks) {
        if (!obj.collider) return
        let body = obj.collider
        let minHeight = Math.abs(ob.height - body.h) >> 0
        let dist = Math.abs(ob.y - body.y)

        if (isCollide(body, ob) && canDraw(ob, camera)) {
            if (obj.vy > 0 && ob.y + ob.height > body.y && ob.y > body.y - obj.vy) {
                const offset = Math.abs(body.y - obj.y + body.h)
                obj.y = ob.y - offset - 0.01
                obj.vy = 0
                obj.onFloor = true
                obj.jumpTime = 0
                return
            }
            if (obj.vy < 0 && (body.x - obj.vx) + body.w >= ob.x - obj.vx && ob.y + ob.height > body.y && body.y + body.h > ob.y && body.x - obj.vx <= ob.x + ob.width - obj.vx && body.y <= ob.y + ob.height && body.y + body.h >= ob.y + ob.height && body.y > ob.y) {
                const offset = Math.abs(body.y - obj.y)
                obj.y = ob.y + ob.height - offset + 0.01
                obj.vy = 0
                return
            }
            if (obj.vx > 0 && dist < minHeight) {
                const offset = Math.abs(body.x - obj.x + body.w)
                obj.x = ob.x - offset - 0.01
                return
            }
            if (obj.vx < 0 && dist < minHeight) {
                const offset = Math.abs(body.x - obj.x)
                obj.x = ob.x + ob.width - offset + 0.01
                return
            }

        }
    }
}


// load entity

function SpawnEntities(name, id, col, row, sw, sh, type, array, size, health) {
    this.name = name
    this.type = type
    this.array = array
    this.id = id
    this.col = col
    this.sw = sw
    this.sh = sh
    this.row = row
    this.size = size
    this.health = health
    this.asyncOperation = async function () {
        if (!loader) return
        try {

            if (this.type == "sheet") {
                this.container = self.getObjectLayer(this.name)
                for (let arr of this.container) {
                    if (arr.name == this.id) { //used to render different type of enemies while each obj layer name == sprite id
                        this.array.push(new SpriteSheet(this.col, this.row, this.sw, this.sh, arr.x, arr.y, this.size,
                            this.size, 0, 0, this.id))
                    }
                }

                for (let obj of this.array) {
                    obj.health = this.health
                }

            } else {
                this.container = self.getObjectLayer(this.name)
                for (let arr of this.container) {
                    if (arr.name == this.id) { //used to render different type of enemies while each obj layer name == sprite id
                        this.array.push(new Sprite(arr.x, arr.y, this.size,
                            this.size, 0, 0, this.id))
                    }
                }
                for (let obj of this.array) {
                    obj.health = this.health
                }

            }

            return this.container
        } catch (err) { log("failed" + err) }

    }


}



function gameRadar(x, y) {
    this.x = x
    this.y = y
    var cvIm = new Image()
    cvIm.src = this.x.toDataURL()
    this.y.style.background = `url(${cvIm.src})`
    this.y.style.backgroundRepeat = "no-repat"
    this.y.style.backgroundSize = "cover"

}

/*Fake 3d effect*/

var gameFrame = 0
var gameSpeed = 5

class layerB {
    constructor(image, x, y, w, h, speedModifier) {
        //if (w != gW) w = gW

        this.x = x
        this.y = y
        this.image = image
        this.w = w
        this.h = h
        this.speedModifier = speedModifier
        this.speed = gameSpeed * this.speedModifier

    }

    update() {
        this.speed = gameSpeed * this.speedModifier
        this.x = gameFrame * this.speed % this.w
        isFake = true
    }

    draw() {
        isFake = true
        buffer.save()
        if (gameFrame == 0) {
            buffer.drawImage(this.image, this.x * self.scale, this.y * self.scale, this.w * self.scale, this.h * self.scale)
        }
        if (gameFrame < 0) {
            buffer.drawImage(this.image, this.x * self.scale, this.y * self.scale, this.w * self.scale, this.h * self.scale)
            buffer.drawImage(this.image, this.x * self.scale + this.w * self.scale, this.y * self.scale, this.w * self.scale, this.h * self.scale)
        } else if (gameFrame > 0) {
            buffer.drawImage(this.image, this.x * self.scale, this.y * self.scale, this.w * self.scale, this.h * self.scale)
            buffer.drawImage(this.image, this.x * self.scale - this.w * self.scale, this.y * self.scale, this.w * self.scale, this.h * self.scale)
        }
        buffer.restore()

    }

}





// side platformer collider
var isJumping = false

function LeftCollider(grid, obj, ts, tindex) {
    for (var r = 0; r < grid.length; r++) {
        for (var c = 0; c < grid[0].length; c++) {

            if (grid[r][c] == tindex) {
                var tx = c * ts
                var ty = r * ts
                block = new Sprite(tx, ty, ts, ts, 0, 0, "red")



                if (obj.collider) {
                    const body = obj.collider

                    if (obj.vx > 0 && body.x + body.w >= block.x && body.x <= block.x + block.w &&
                        body.y + body.h >= block.y && body.y <= block.y + block.h && body.y > block.y) {
                        const offset = body.x - obj.x + body.w

                        obj.x = block.x - offset - 0.01

                        break;

                    }

                } else {

                    if (obj.vx > 0 && obj.x + obj.w >= block.x && obj.x <= block.x + block.w &&
                        obj.y + obj.h >= block.y && obj.y <= block.y + block.h) {
                        obj.x = block.x - obj.w - 1  //obj.oldX + 0.01
                    }

                }

            }

        }

    }

}





function RightCollider(grid, obj, ts, tindex) {


    for (var r = 0; r < grid.length; r++) {
        for (var c = 0; c < grid[0].length; c++) {


            if (grid[r][c] == tindex) {
                var tx = c * ts
                var ty = r * ts
                block = new Sprite(tx, ty, ts, ts, 0, 0, "red")


                if (obj.collider) {

                    const body = obj.collider
                    if (obj.vx < 0 && body.x + body.w >= block.x && body.x <= block.x + block.w &&
                        body.y + body.h >= block.y && body.y <= block.y + block.h && body.y > block.y) {
                        const offset = body.y - obj.y
                        obj.x = obj.oldX + 0.01

                        break;
                    }

                }
                else {


                    if (obj.vx < 0 && obj.x + obj.w >= block.x && obj.x <= block.x + block.w &&
                        obj.y + obj.h >= block.y && obj.y <= block.y + block.h) {
                        obj.x = block.x + block.w + 1
                        break;
                    }

                }

            }
        }
    }

}





function TopCollider(grid, obj, ts, tindex) {

    for (var r = 0; r < grid.length; r++) {
        for (var c = 0; c < grid[0].length; c++) {
            var tx = c * ts
            var ty = r * ts
            var blocks = []
            if (grid[r][c] == tindex) {

                blocks.push(new Sprite(tx, ty, ts, ts, 0, 0, "red"))

                for (var b = 0; b < blocks.length; b++)
                    var block = blocks[b]

                if (obj.collider) {

                    const body = obj.collider

                    if (isCollide(body, block)) {
                        if (obj.vy > 0 && block.y + block.h >= body.y && block.y >= body.y + body.h / 2) {
                            const offset = body.y - obj.y + body.h;
                            obj.vy = 0;
                            obj.onFloor = true;
                            obj.isFalling = false

                            obj.isJumping = false;
                            obj.jumpTime = 0
                            return obj.y = ~~(block.y - offset - 0.01)

                        }

                    }

                } else {

                    if (isCollide(body, block)) {
                        if (obj.vy > 0 && block.y + block.h > body.y && block.y > body.y + body.h / 2) {

                            obj.vy = 0

                            if (obj.vy == 0) {
                                if (obj.shape == "circle")
                                    this.shadowY = this.shadowY - 27
                                if (obj.shape == "rect")
                                    this.shadowY = this.shadowY - 33
                            }

                            obj.y = block.y - obj.h - 0.01

                            obj.jumpTime = 0
                            obj.onFloor = true
                            break;

                        }


                    }



                }

            }
        }
    }
}


function BottomCollider(grid, obj, ts, tindex) {
    for (var r = 0; r < grid.length; r++) {
        for (var c = 0; c < grid[0].length; c++) {
            var block

            if (grid[r][c] == tindex) {
                tx = c * ts
                ty = r * ts
                block = { x: tx, y: ty, w: ts, h: ts }

                if (obj.collider) {
                    const body = obj.collider

                    if (obj.isJumping || isJumping && obj.vy < 0 && (body.x - obj.vx) + body.w > block.x - obj.vx && body.y + body.h >= block.y &&
                        body.x - obj.vx <= block.x + block.w - obj.vx && body.y <= block.y + block.h) {

                        const offset = body.y - obj.y

                        obj.y = (block.y + block.h - 5) - offset + 9


                        obj.isJumping = false
                        isJumping = false
                        obj.vy = 0
                        break;
                    }

                } else {

                    if (obj.isJumping || isJumping && obj.x + obj.w > block.x && obj.y + obj.h >= block.y &&
                        obj.x <= block.x + block.w && obj.y <= block.y + block.h) {

                        obj.y = block.y + block.h + 0.01

                        obj.vy = 0
                        // obj.isJumping = false
                        isJumping = false
                        break;


                    }


                }

            }
        }

    }

}


// tiled  platformer side collision

function TopTiledCollider(layer, obj) {
    layer.objects.forEach(function (ob) {
        const body = obj.collider
        if (isCollide(body, ob)) {
            if (obj.vy > 0 && ob.y + ob.height >= body.y && ob.y > body.y - body.h) {
                const offset = body.y - obj.y + body.h;
                obj.vy = 0;
                obj.gravity = 0
                obj.onFloor = true;
                obj.isFalling = false
                obj.isJumping = false;
                obj.jumpTime = 0
                obj.y = (ob.y - offset - 0.001)
                obj.collider.y = obj.y
                return
            }

        }
    })

}




function BottomTiledCollider(layer, obj) {
    layer.objects.forEach(function (ob) {
        const body = obj.collider
        if (canDraw(ob, camera)) {
            if (obj.isJumping && obj.vy < 0 && (body.x - obj.vx) + body.w > ob.x - obj.vx && body.y + body.h >= ob.y &&
                body.x - obj.vx <= ob.x + ob.width - obj.vx && body.y <= ob.y + ob.height && body.y + body.h > ob.y + ob.height) {

                obj.vy = 0
                const offset = body.y - obj.y
                obj.y = (ob.y + ob.height - 7) - offset + 9  //ob.y + ob.height
                //obj.collider.y = ob.y + ob.height - offset + 9
                obj.onFloor = false
                obj.isJumping = false
                return

            }
        }

    })

}



function LeftTiledCollider(layer, obj) {
    layer.objects.forEach(function (ob) {
        if (!canDraw(ob, camera)) { return }
        const body = obj.collider
        let dist = ob.y - body.y
        let minHeight = Math.abs(ob.height - body.h) >> 0

        if (isCollide(body, ob) && obj.vx > 0.5 && dist <= minHeight) {

            const offset = body.x - obj.x + body.w
            obj.x = ob.x - offset - 0.01

            return

        }

    })

}





function RightTiledCollider(layer, obj) {
    layer.objects.forEach(function (ob) {
        if (!canDraw(ob, camera)) { return }
        const body = obj.collider
        let dist = ob.y - body.y
        let minHeight = Math.abs(data.tileheight - body.h) >> 0

        if (isCollide(body, ob) && obj.vx < 0 && dist <= minHeight) {
            const offset = body.x - obj.x
            obj.x = ob.x + ob.width - offset + 0.01

            return

        }

    })

}



//all in one platformer

function Platformer(obj, layerName, isSideJump) {
    if (!canDraw(obj, camera)) { return; }
    for (let layer of data.layers) {
        if (layer.name != layerName) continue
        for (let ob of layer.objects) {
            if (!canDraw(ob, camera)) { return false }
            body = obj.collider
            if (!isCollide(body, ob) && Math.floor(obj.vy) > 0) obj.onFloor = false
            //top
            if (isCollide(body, ob)) {
                dist = ob.y - body.y
                minHeight = Math.abs(ob.height - body.h) >> 0

                if (obj.vy > 0 && ob.y + ob.height > body.y && ob.y > body.y - obj.vy) {
                    const offset = body.y - obj.y + body.h;
                    obj.vy = 0;
                    obj.gravity = 0
                    obj.onFloor = true;
                    obj.isFalling = false
                    obj.isJumping = false;
                    obj.jumpTime = 0
                    obj.y = (ob.y - offset - 0.01)
                    //obj.collider.y = obj.y
                    return
                }

            }

            //bottom
            body = obj.collider
            if (isCollide(body, ob)) {
                if (canDraw(ob, camera)) {
                    if (obj.isJumping && (body.x - obj.vx) + body.w >= ob.x - obj.vx && obj.vy < 0 && ob.y + ob.height > body.y && body.y + body.h > ob.y &&
                        body.x - obj.vx <= ob.x + ob.width - obj.vx && body.y <= ob.y + ob.height && body.y + body.h >= ob.y + ob.height && body.y > ob.y) {
                        const offset = body.y - obj.y
                        obj.y = (ob.y + ob.height) - offset + 0.01
                        //obj.collider.y = ob.y + ob.height - offset + 0.01
                        obj.onFloor = false

                        obj.vy = 0
                        return
                    }
                    //left
                    body = obj.collider
                    if (!canDraw(ob, camera)) { return }
                    body = obj.collider
                    dist = ob.y - body.y
                    minHeight = Math.abs(ob.height - body.h) >> 0

                    if (isCollide(body, ob) && obj.vx > 0 && dist < minHeight) {

                        const offset = body.x - obj.x + body.w
                        obj.x = ob.x - offset - 0.01
                        if (isSideJump) {
                            obj.jumpTime = 0
                        }
                        return

                    }

                    //right
                    if (!canDraw(ob, camera)) { return }
                    body = obj.collider
                    dist = ob.y - body.y
                    minHeight = Math.abs(ob.height - body.h) >> 0

                    if (isCollide(body, ob) && obj.vx < 0 && dist < minHeight) {

                        const offset = body.x - obj.x
                        obj.x = ob.x + ob.width - offset + 0.01
                        if (isSideJump) {
                            obj.jumpTime = 0
                        }
                        return


                    }

                }
            }



        }

    }
}




//HealthBar
class HealthBar {
    constructor({ x, y }, height, bordColor, juiceColor, obj) {
        this.height = height
        this.bCol = bordColor
        this.jCol = juiceColor
        this.position = { x, y }
        this.obj = obj
        this.flip = false
        this.visible = false
        this.radius = "2.5px"
        this.isSet = false
        this.scale = 1.5
        if (screen.width >= 1000) {
            this.scale = 5
        }


        if (this.border) return

        this.border = document.createElement("div");
        this.border.style.border = `2px solid ${this.bCol}`
        this.border.style.position = "absolute"
        this.border.style.zIndex = 3
        this.border.style.width = this.obj.health * this.scale + "px"
        this.border.style.height = this.height + "px"
        this.border.style.left = this.position.x + "px"
        this.border.style.top = this.position.y + "px"
        this.border.style.borderRadius = this.radius
        this.juice = document.createElement("div");
        this.border.appendChild(this.juice);


        this.jH = this.height - 2.5
        this.juice.style.position = "absolute"
        this.juice.style.zIndex = 99999
        this.juice.style.width = this.obj.health * this.scale + "px"
        this.juice.style.height = this.jH + "px"
        this.juice.style.background = this.jCol
        this.juice.style.borderRadius = this.radius
        let id = setInterval(() => {
            if (this.visible && !this.isSet) {
                self.add(this.border);
                this.isSet = true
                clearInterval(id)
            }
        }, 16)

    }


    destroy() {
        this.visible = false
    }

    update() {

        if (!this.visible) {
            this.border.style.visibility = "hidden"
        } else {
            this.border.style.visibility = "visible"
        }

        if (this.flip) {
            this.border.style.transform = "scaleX(-1)"
            this.juice.style.width = this.obj.health * this.scale + "px"
            this.border.style.overflow = "hidden"
        } else {
            this.juice.style.width = this.obj.health * this.scale + "px"
        }
    }
}




class PlaySound {
    constructor(x, volume, type) {
        this.x = x;
        this.volume = volume;
        this.type = type;
        this.audio = new Audio(this.x);
        this.audio.volume = this.volume;

        // Preload the audio to reduce delay
        this.audio.preload = 'auto';
    }

    run() {
        try {
            this.audio.currentTime = 0; // Reset to the beginning
            if (this.type === "loop") {
                this.audio.autoplay = true;
                this.audio.loop = true;
                this.audio.play();
            } else {
                try {
                    this.audio.play();
                } catch (err) { }

            }

        } catch (err) {
            console.error("Error playing audio:", err);
        }
    }

    stop() {
        try {
            this.audio.pause();
        } catch (err) {
            console.error("Error stopping audio:", err);
        }
    }
}



//astar algo
class Astar {
    constructor() {

        this.closedList = [];
        this.startNode = null;
        this.endNode = null;
        this.acceptableTiles = []; // Default acceptable tile value
        this.diagonalMovement = false
    }

    setGrid(grid) {
        return this.grid = grid;
    }

    setAcceptableTiles(acceptableTiles) {
        return this.acceptableTiles = acceptableTiles;
    }

    setDiagonal(diagonal) {
        return this.diagonalMovement = diagonal;
    }

    setIterations(timer) {
        this.timer = timer
    }

    findPath(startX, startY, endX, endY, callback) {

        if (!this.grid || startX < 0 || startY < 0 || endX < 0 || endY < 0 ||
            startX > this.grid[0].length || startY > this.grid.length ||
            endX > this.grid[0].length || endY > this.grid.length) {
            callback(null);
            return;
        }

        this.startNode = new Node(startX, startY);
        this.endNode = new Node(endX, endY);

        this.openList = [this.startNode];
        this.closedList = [];

        let attempts = 0;
        const maxAttempts = 300; // Maximum attempts before failing

        const findPathDelayed = () => {
            let timeout = setTimeout(() => {
                while (this.openList.length > 0 && attempts < maxAttempts) {
                    this.currentNode = this.openList[0];
                    this.currentIndex = 0;

                    for (let i = 0; i < this.openList.length; i++) {
                        if (this.openList[i].f < this.currentNode.f || (this.openList[i].f === this.currentNode.f && this.openList[i].h < this.currentNode.h)) {
                            this.currentNode = this.openList[i];
                            this.currentIndex = i;
                        }
                    }

                    this.openList.splice(this.currentIndex, 1);
                    this.closedList.push(this.currentNode);

                    if (this.currentNode.x === this.endNode.x &&
                        this.currentNode.y === this.endNode.y) {
                        // Path found, start reconstructing the path
                        let path = [];
                        let temp = this.currentNode;

                        while (temp !== null) {
                            path.push({ x: temp.x | 0, y: temp.y | 0 });
                            temp = temp.parent;
                        }
                        if (path == null) {
                            path.push(temp)
                        }

                        try {
                            callback(path.reverse());
                            clearTimeout(timeout); // Clear the timeout upon successful pathfinding
                        } catch (err) { }
                        return;
                    }

                    var directions
                    if (!this.diagonalMovement) {
                        directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
                    } else {
                        directions = [[1, 1], [1, 0], [-1, 1], [-1, 0], [1, -1], [0, 1], [-1, -1], [0, -1]];
                    }

                    for (let dir of directions) {
                        let neighborX = this.currentNode.x + dir[0];
                        let neighborY = this.currentNode.y + dir[1];


                        if (neighborX > 0 && neighborX < this.grid[0].length &&
                            neighborY > 0 && neighborY < this.grid.length) {
                            let neighbor = new Node(neighborX, neighborY);
                            neighbor.isrunable = this.acceptableTiles.includes(this.grid[neighborY][neighborX]);
                            if (neighbor.isrunable && !this.closedList.some((node) => node.x === neighbor.x
                                && node.y === neighbor.y)) {
                                let tempG = this.currentNode.g + 1;

                                if (!this.openList.some((node) => node.x === neighbor.x && node.y === neighbor.y)) {
                                    neighbor.g = tempG;
                                    neighbor.h = Math.abs(neighbor.x - this.endNode.x) + Math.abs(neighbor.y - this.endNode.y);
                                    neighbor.f = neighbor.g + neighbor.h;
                                    neighbor.parent = this.currentNode;
                                    this.openList.push(neighbor);
                                } else if (tempG < neighbor.g) {
                                    neighbor.g = tempG;
                                    neighbor.f = neighbor.g + neighbor.h;
                                    neighbor.parent = this.currentNode;
                                }
                            }
                        }
                    }
                }

                attempts++;
                if (attempts > maxAttempts) {
                    callback(null); // If no path is found after maximum attempts
                    clearTimeout(timeout); // Clear the timeout upon failure to avoid further retries
                } else {
                    findPathDelayed(); // Retry pathfinding with a delay
                }
            }, this.timer); // Adjust the delay time (in milliseconds) as needed
        };
        findPathDelayed(); // Initial call to start pathfinding

    }

}

class Node {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.parent = null;
        this.g = 0;
        this.h = 0;
        this.isrunable = true; // By default, all nodes are runable
    }
}


//end of astar


function isFlipCollide(a, b) {
    var dx = Math.abs(a.x - (b.x));
    var dy = Math.abs(a.y - (b.y));
    if (b.r) {
        if (dx <= b.r + b.r + a.w / 2 && dy <= b.r + b.r + a.h / 2) {
            if (a.flipX && a.x < b.x) { return false }
            if (!a.flipX && a.x > b.x) { return false }
            return true

        }

    }

    if (b.r == undefined) {
        var dx = Math.abs(a.x - (b.x));
        var dy = Math.abs(a.y - (b.y));


        if (!a.flipX && a.x + a.w >= b.x && a.x <= b.x + b.w &&
            a.y + a.h >= b.y && a.y <= b.y + b.h * 1.8) {
            return true
        }

        if (a.flipX && a.x + a.w >= b.x && a.x - a.w * 1.8 <= b.x + b.w &&
            a.y + a.h >= b.y && a.y <= b.y + b.h * 1.8
        ) {
            if (a.flipX && a.x < b.x + b.w) { return }
            return true
        }

    }

}


var partImage = new Image();

function Particles(x, y, size, target, name, isRpg) {
    this.name = name || "rainbow";
    this.speed = (Math.random() * 4) - 2;
    this.angle = Math.random() * Math.PI * 6;

    if (target.collider) {
        this.x = target.collider.x + size / 2;
        this.y = target.collider.y + 5;
    } else {
        this.x = x + size / 2;
        this.y = y + 5;
    }

    this.size = (size) * self.scale;
    this.alpha = 1;
    this.speed = (Math.random() * 1.5) - 2;
    this.friction = 0.95;
    this.vx = Math.cos(this.angle) * this.speed;
    this.vy = Math.sin(this.angle) * this.speed;

    this.reset = function (target, name) {
        this.name = name || "rainbow";
        this.speed = (Math.random() * 3) - 2;
        this.angle = Math.random() * Math.PI * 3;

        if (target.collider) {
            this.x = target.collider.x + this.collider.w / 2;
            this.y = target.collider.y + 5;
        } else {
            this.x = x + size / 4;
            this.y = y + 5;
        }

        this.size = (size) * self.scale;
        this.alpha = 1;
        this.speed = (Math.random() * 0.5) - 2;
        this.friction = 0.95;
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;
    };



    this.update = function () {

        this.vx *= this.friction + 0.3
        this.vy *= this.friction + 0.3
        this.x += this.vx
        this.vy -= 0.5
        if (frame % 4 === 0)
            this.y += this.vy

        if (this.name == "fire") {
            this.color = "#720"
            this.speed = 0.8
            this.vx = Math.cos(this.angle) * this.speed
            this.vy = Math.sin(this.angle) * this.speed
            this.y += this.vy * this.friction
            this.vx *= this.friction
            this.x += this.vx * delta

        }


        else if (this.name == "dust") {

            this.vx = (Math.random() * -0.5)
            this.vy = (Math.random() + 2.2) * Math.random() * (-2) //(Math.random()*(-7)) + 4
            if (!target.onFloor) { return }
            this.color = "lightgray"
            this.vy += 1.5 + 0.1
            this.y = target.y + target.h - 0.4
            this.y += this.vy * 0.9
            this.size = 0.8

            if (target.vx > 0 && !target.isJumping) {
                this.x -= 0.5 + (Math.random() * 0.2 * self.scale)
            } else if (target.vx > 0 && target.isJumping) {
                this.x -= 0.5 + (Math.random() * 0.2 * self.scale)
            }

            else if (target.vx < 0 && !target.isJumping) {
                this.x -= (Math.random() * 0.3) - 5

            } else if (target.vx < 0 && target.isJumping) {
                this.x -= (Math.random() * 3) - 5
            }


            else if (target.vy > 0 && !target.isJumping) {
                this.y += (Math.random() * -5)

            }

            else if (target.vy < 0 && !target.isJumping) {
                this.y -= (Math.random() * -5)

            }


        }

        else if (target.image && this.name == "self") {
            this.vx *= this.friction * 0.8
            this.x += this.vx * delta
            this.vy += 0.5
            this.y += this.vy * delta
        }


        else if (this.name == "rainbow") {
            this.color = "#" + (Math.random().toString(16).substr(-6));
            this.speed = 0.5
            this.vx = Math.cos(this.angle) * this.speed
            this.vy = Math.sin(this.angle) * this.speed

            this.y += this.vy * this.friction
            this.vx *= this.friction
            this.x += this.vx * delta
        }

        else if (!target.image && this.name == "self") {
            this.color = target.color
            this.speed = 1
            this.vx = Math.cos(this.angle) * this.speed
            this.vy = Math.sin(this.angle) * this.speed
            this.y += this.vy * this.friction
            this.vx *= this.friction
            this.x += this.vx * delta
        }

        else if (this.name == "waterfall") {

            this.y -= this.vy * this.friction * 10
            this.vx *= this.friction
            this.x += this.vx * delta
            this.size = (Math.random() * 5 + 0.9)
            this.color = "rgba(200,200,200,0.7)"
        }

        else if (this.name == "blood") {

            this.color = "rgba(255,000,000,1)"
            this.speed = 1
            this.vx = Math.cos(this.angle) * this.speed
            this.vy = Math.sin(this.angle) * this.speed
            this.y += this.vy * this.friction
            this.vx *= this.friction
            this.x += this.vx * delta
        }

        else if (this.name == "poison") {

            this.color = "rgba(205,80,255,0.8)"
            this.friction = 0.04
            this.vx *= this.friction
            this.vy -= 0.5
            this.y += this.vy
            this.x += this.vx

        }

        else if (this.name == "smoke") {
            this.color = "rgba(0,0,0,0.5)"
            this.friction = 0.4
            this.vx *= this.friction
            this.vy -= 0.1
            this.y += this.vy
            this.x += this.vx * delta
        } else {
            if (target.color) {
                this.color = target.color //"#"+(Math.random().toString(16).substr(-6));
            }

        }

        if (frame % 10 == 0 && this.name != "dust") {

            for (let i = 0; i < particlePool.pool.length; i++) {
                let particle = particlePool.pool[i]

                particle.dx = target.x - particle.x
                particle.dy = target.y - particle.y


                var distance = Math.hypot(particle.dx, particle.dy)

                if (this.name != 'dust' && distance >= 10) {
                    particle.alpha -= 0.1
                    if (particle.alpha <= 0.8) { // Use your actual fade-out threshold
                        particle.reset(target, this.name)
                        particlePool.pool.pop(particle); // Return it directly to the pool
                    }

                }

            }
        } else if (frame % 2 == 0 && this.name == "dust") {

            for (let i = 0; i < particles.length; i++) {
                var part = particles[i]
                part.dx = target.x - part.x
                part.dy = target.y - part.y


                var distance = Math.hypot(part.dx, part.dy)


                if (distance >= 2 && this.name == "dust") {
                    this.alpha -= 0.05

                    if (this.alpha <= 0.6) {
                        if (particlePool.pool[0]) {
                            this.alpha = 1
                        }
                        kill(particlePool.pool, i)
                    }


                }


            }


        }

    }

    this.draw = function () {

        // Check if the target has an image and if the current object is named "self"
        if (target.image && this.name == "self") {
            partImage.src = target.image.src

            if (canDraw(target, camera)) {

                buffer.drawImage(partImage, this.x * self.scale, this.y * self.scale,
                    (this.size * 1),
                    (this.size * 1))
            }

        }

        else {

            if (canDraw(target, camera)) {
                buffer.fillStyle = this.color
                if (this.name == "fire") {
                    buffer.shadowBlur = 1
                    buffer.shadowColor = 'rgba(240,200,10,0.8)'
                } else {
                    buffer.shadowColor = this.color
                }
            }

            if (canDraw(target, camera)) {
                if (this.name != "poison") {
                    if (target.type == "polygon") {
                        buffer.globalAlpha = this.alpha
                        buffer.beginPath()
                        buffer.arc(this.x, this.y, (this.size * Math.random() * 0.3 + 0.5), 1.2, Math.PI * 2)
                        buffer.fill()
                        buffer.closePath()

                    } else {
                        buffer.save()
                        buffer.beginPath()
                        buffer.arc(this.x * self.scale, this.y * self.scale,
                            (this.size * Math.random() * 0.3 + 0.5), 0, Math.PI * 2)
                        buffer.fill()
                        buffer.closePath()
                        buffer.restore()
                    }
                }



                if (this.name == "poison") {

                    buffer.beginPath()
                    if (target.type == "polygon") {
                        buffer.beginPath()
                        buffer.arc(this.x, this.y, (this.size * Math.random() * 0.8 + 1), 1.2, Math.PI * 2)
                        buffer.fill()
                        buffer.closePath()

                    } else {
                        buffer.beginPath()
                        buffer.arc(this.x * self.scale, this.y * self.scale,
                            (this.size * Math.random() * 0.8 + 1), 1.2, Math.PI * 2)
                        buffer.fill()
                        buffer.closePath()
                    }
                }

            }

        }



    }

}


class ParticlePool {
    constructor() {
        this.pool = [];
        this.index = 0;
    }

    createParticle(target, size, name) {

        for (let i = 0; i < size; i++) {
            let particle;
            if (this.index < this.pool.length) {
                particle = this.pool[this.index++];
                particle.reset(target, name);
            } else {
                particle = new Particles(
                    target.x + (target.w || 0) / 2,
                    target.y,
                    (Math.random() * 2 + 0.05),
                    target,
                    name
                );
                this.pool.push(particle);
                if (size > 40) size = 5
                this.index++;

            }
        }
    }

    getPoolSize() {
        return this.pool.length;
    }

    resetPool() {
        this.index = 0;
    }
}


var particlePool = new ParticlePool();


//dom text 
class UseText {
    constructor(text, value, size, x, y, color) {
        this.text = text
        this.color = color
        this.size = size
        this.x = x
        this.y = y
        this.degree = 0
        this.value = value
        this.visible = false

        if (!this.paragraph) {
            this.paragraph = document.createElement("p")
            document.addEventListener("DOMContentLoaded", () => {
                document.body.appendChild(this.paragraph)
            })
            if (this.text == null) {
                this.paragraph.innerText = this.value
            }
            else {
                if (typeof (this.text) == "number") {
                    this.paragraph.innerText = this.text + this.value
                } else
                    this.paragraph.innerText = this.text + " " + this.value
            }
            this.paragraph.style.position = "absolute";
            //this.paragraph.style.fontFamily = "monospace"
            this.paragraph.style.zIndex = 3
            this.paragraph.style.left = `${this.x}px`
            this.paragraph.style.top = `${this.y}px`
            this.paragraph.style.fontSize = `${this.size}px`
            this.paragraph.style.color = `${this.color}`


            let id = setInterval(() => {
                if (!this.visible) {

                    this.paragraph.style.visibility = "hidden"
                    // clearInterval(id)
                } else {
                    this.paragraph.style.visibility = "visible"
                    // clearInterval(id)
                }

            }, 16)

        }

    }

    rotate(degree) {
        this.degree = degree
    }

    destroy() {
        document.body.removeChild(this.paragraph)
        this.paragraph.innerText = null
    }

    animate(otherColor) {
        setTimeout(() => {
            this.paragraph.style.color = this.color
        }, 1000)

        setTimeout(() => {
            this.paragraph.style.color = otherColor
        }, 2500)
    }

    update(updatedValue) { //to update the rendered text
        this.updatedValue = updatedValue
        this.updator = this.updatedValue
        this.paragraph.style.transform = `rotate(${this.degree}deg)`
        this.paragraph.style.position = "absolute";
        //this.paragraph.style.fontFamily = "monospace"
        this.paragraph.style.zIndex = 3
        this.paragraph.style.left = `${this.x}px`
        this.paragraph.style.top = `${this.y}px`
        this.paragraph.style.fontSize = `${this.size}px`
        this.paragraph.style.color = `${this.color}`
        this.paragraph.style.zIndex = 3

        if (this.text == null) {

            this.paragraph.innerText = this.updator
        } else {

            this.paragraph.innerText = this.text + " " + this.updator
        }

        if (!this.visible) {
            this.paragraph.style.visibility = "hidden"
        } else {
            this.paragraph.style.visibility = "visible"
        }
    }
}


function hitBox(a, b, gap) {
    if (a.collider && b.collider) {
        var dx = Math.abs(a.collider.x - b.collider.x)
        var dy = Math.abs(a.collider.y - b.collider.y)

    }

    if (a.collider && !b.collider) {
        var dx = Math.abs(a.collider.x - b.x)
        var dy = Math.abs(a.collider.y - b.y)

    } else {
        var dx = Math.abs(a.x - b.x)
        var dy = Math.abs(a.y - b.y)

    }

    var dist = Math.hypot(dx, dy)
    if (dist <= gap) {
        if (a.left) {
            if (a.collider && b.collider) {
                if (a.collider.x > b.collider.x) { return true }
            }
            if (a.collider && !b.collider) {
                if (a.collider.x > b.x) { return true }
            } else if (!a.collider && !b.collider) {
                if (a.x > b.x) { return true }
            }

        }
        if (!a.left) {
            if (a.collider && b.collider) {
                if (a.collider.x < b.collider.x) { return true }
            }

            if (a.collider && !b.collider) {
                if (a.collider.x < b.x) { return true }
            } else if (!a.collider && !b.collider) {
                if (a.x < b.x) { return true }
            }
        }
        else { return false }

    }
    return false
}


function SnowEffect(space) {
    num = [-3, 3]
    this.space = space
    var cs = {
        x: Math.round(Math.random() * camera.width) + camera.x,
        y: 0,
        s: Math.floor(Math.random() * 1) + 0.5,
        color: `rgb(255, 255, 255)`
    }

    for (var i = 0; i < 15; i += 2) {
        rand = Math.random() * num.length
        snows.push(new Circle(cs.x, cs.y, cs.s, Math.cos(num[rand]), Math.floor(Math.random() * 1) + 1, cs.color))
    }

    for (var j = 0; j < snows.length; j++) {
        snow = snows[j]
        snow.y += 1

    }
}


function RainEffect(space) {
    this.space = space
    var num = [-1, 3]

    var cr = {
        x: Math.floor(Math.random() * camera.width) + camera.x,
        y: 0,
        w: Math.floor(Math.random() * 1) + 0.05 * 3,
        h: 8,
        color: `rgba(255, 255, 255, 0.3)`
    }


    for (var i = 0; i < 10; i += 2) {
        rand = Math.random() * num.length
        rains.push(new Sprite(cr.x, cr.y, cr.w, cr.h, Math.cos(num[rand]), Math.floor(Math.random() * 1) + 2, cr.color))
    }

    rains.forEach(function (rain, k) {
        rain.y += 5
    })

}


log("CanvasGameJs is running !!")

let isPoint = false


function renderRWayPoint() {
    if (isPoint) {

        buffer.beginPath()
        buffer.strokeStyle = "darkblue"
        buffer.moveTo(wayPoints[0].x * self.scale, wayPoints[0].y * self.scale)
        for (let w = 0; w < wayPoints.length; w++) {
            let wp = wayPoints[w]
            buffer.lineTo(wp.x * self.scale, wp.y * self.scale)
            //buffer.arc(wp.x * self.scale, wp.y * self.scale, 5, 0, Math.PI * 2)

        }
        buffer.stroke()
        buffer.closePath()

    }
}

//pathfindind
let wp;

function isPath(a, b, c, obstacles) {
    let obstacleDetected = false;

    for (let obstacle of obstacles) {
        if (lineSegmentIntersectsObstacle(b, c, obstacle)) {
            obstacleDetected = true;
            break;
        }
    }

    if (obstacleDetected) {
        // Change direction toward the first waypoint
        wp = a[0];
        return false; // No clear path found, but updated waypoint
    }

    moveAlongPath(a, b, c, obstacles);

    return true; // Successfully moved along the path
}

// Assuming these functions are defined elsewhere
function lineSegmentIntersectsObstacle(start, end, obstacle) {
    const x1 = start.x;
    const y1 = start.y;
    const x2 = end.x;
    const y2 = end.y;

    const x3 = obstacle.x;
    const y3 = obstacle.y;
    const x4 = obstacle.x + obstacle.width;
    const y4 = obstacle.y + obstacle.height;

    const ua =
        ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) /
        ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));

    const ub =
        ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) /
        ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));

    return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
}



function moveAlongPath(a, b, c, obstacles) {
    if (pathIndex < 0 || pathIndex >= a.length - 1) {
        return;
    }

    wp = a[pathIndex];

    isPoint = true
    // Calculate direction towards the waypoint
    let dx = wp.x - b.x;
    let dy = wp.y - b.y;
    let angle = Math.atan2(dy, dx);

    // Check if the enemy is close to an obstacle
    let isCloseToObstacle = obstacles.some(obstacle =>
        lineSegmentIntersectsObstacle(
            { x: b.x, y: b.y },
            { x: wp.x, y: wp.y },
            { x: obstacle.x + 8, y: obstacle.y + 8, width: obstacle.width + 8, height: obstacle.height + 8 }
        )
    );

    let speed = 1;

    if (isCloseToObstacle) {
        // Change direction to avoid obstacle
        let avoidanceAngle = self.getAngle(b, a[0]) //Math.PI; // 90 degrees to the right (you can adjust this)
        b.vx = Math.cos(avoidanceAngle) * speed;
        b.vy = Math.sin(avoidanceAngle) * speed;
    } else {
        // Move towards the waypoint
        b.vx = Math.cos(angle) * speed;
        b.vy = Math.sin(angle) * speed;
    }

    if (a.length > 0) {
        b.x += b.vx;
        b.y += b.vy;
        pathIndex++
    }

    if (
        Math.abs(Math.round(b.x) - Math.round(wp.x)) < Math.abs(b.vx) &&
        Math.abs(Math.round(b.y) - Math.round(wp.y)) < Math.abs(b.vy) &&
        pathIndex < a.length - 1
    ) {
        pathIndex++;
        isPoint = true
        // Remove visited waypoints
        a.splice(0, pathIndex);
    }
}


// gridSize
class GridSize {
    constructor(cellSize, gridSize) {
        this.cellSize = cellSize
        this.grid = gW / this.cellSize
        this.gridSize = this.grid
    }

}


//snake class
class Snake extends GridSize {
    constructor(headColor, x, y, cellSize, color, gridSize) {
        super(cellSize, gridSize)
        this.cellSize = cellSize
        this.color = color
        this.headColor = headColor
        this.dir = { x: 0, y: 0 }
        this.lost = false
        this.length = 5
        this.segments = []
        this.oldDir = { x: 0, y: 0 } // previous direction
        this.position = { x, y }
    }

    grow() {
        this.length++
    }

    update() {
        if (frame % 2.5 == 0) {
            this.position.x += this.dir.x * this.cellSize
            this.position.y += this.dir.y * this.cellSize

            this.segments.unshift({ x: this.position.x, y: this.position.y })
            if (this.segments.length > this.length) {
                this.segments.pop()
            }

            if (this.segments[0].x * self.scale < 0 || Math.round((this.segments[0].x + this.cellSize) * self.scale) >= gW ||
                Math.round(this.segments[0].y * self.scale) < 0 || Math.round((this.segments[0].y + this.cellSize) * self.scale) >= gH) {
                this.lost = true

            }

            // decision and movement
            if ((this.dir.x == - this.oldDir.x && this.dir.x != 0) ||
                (this.dir.y == - this.oldDir.y && this.dir.y != 0)) {
                this.lost = true
            }

            this.oldDir.x = this.dir.x
            this.oldDir.y = this.dir.y
        }

    }

    draw() {
        for (var i = 0; i < this.segments.length; i++) {
            if (i == 0) {
                buffer.fillStyle = this.headColor
            }
            else {
                buffer.fillStyle = this.color
            }
            buffer.fillRect(Math.round(this.segments[i].x * self.scale), Math.round(this.segments[i].y * self.scale), Math.round(this.cellSize * self.scale), Math.round(this.cellSize * self.scale))
        }


    }

    eatSelf() {
        for (let i = 0; i < this.segments.length; i++) {
            let segment = this.segments[i]
            if (i > 5 && segment.x === this.position.x && segment.y === this.position.y) {
                this.lost = true
            }


        }

    }

}


function collidedFood(obj1, obj2) {
    if (obj1.x == obj2.x && obj1.y == obj2.y) {
        return true
    }
}

class Food extends GridSize {
    constructor(cellSize, gridSize, color) {
        super(cellSize, gridSize)
        this.cellSize = cellSize
        this.color = color
        this.useImage = false
        this.image = new Image()

        this.size = this.cellSize;
        this.generateFood()

    }

    generateFood() {

        this.randomX = Math.floor(Math.random() * this.gridSize) * this.cellSize;
        this.randomY = Math.floor(Math.random() * this.gridSize) * this.cellSize;
        this.x = this.randomX;
        this.y = this.randomY;

    }

    update() {
        if (this.x * self.scale <= 15 || (this.x + this.cellSize) * self.scale > gW || (this.y * self.scale) <= 15 || ((this.y + this.cellSize) * self.scale) > gH) { this.generateFood() }
    }

    draw() {
        if (!this.useImage) {
            buffer.fillStyle = this.color
            buffer.fillRect(Math.round(this.x * self.scale), Math.round(this.y * self.scale), Math.round(this.size * self.scale), Math.round(this.size * self.scale))
        }
        else {
            buffer.drawImage(this.image, Math.round(this.x * self.scale), Math.round(this.y * self.scale), Math.round(this.size * self.scale), Math.round(this.size * self.scale))
        }
    }

}


class TinyBar {
    constructor(h, color, obj, borderColor) {
        this.obj = obj
        this.x = this.obj.x + 10
        this.y = obj.y - 10
        this.h = h
        this.color = color
        this.borderColor = borderColor
        this.value = this.obj.health * 1.3
        this.w = this.obj.health * 1.3

        if (this.obj.startX) {
            this.x = this.obj.startX - this.obj.radius / 2.5
            this.y = this.y - 10
        }
    }


    update(remain) {
        this.remain = remain
        this.x = this.obj.x + 10
        this.y = this.obj.y - 10
        this.w = this.remain * 1.3
        if (this.w <= 0) this.w = 0
        this.destroy()

        if (this.obj.startX) {
            this.x = this.obj.startX - this.obj.radius / 2.5
            this.y = this.y - 10
        }
    }

    draw() {
        buffer.clearRect(this.x, this.y, this.w, this.h)
        buffer.save()
        buffer.strokeStyle = this.borderColor || "silver"
        buffer.strokeRect(this.x * self.scale, this.y * self.scale,
            this.value * self.scale, this.h * self.scale)
        buffer.fillStyle = this.color
        buffer.fillRect(this.x * self.scale, this.y * self.scale,
            this.w * self.scale, this.h * self.scale)
        buffer.restore()

    }

    destroy() {
        if (this.w <= 0) {
            this.value = 0
            this.w = 0
            this.h = 0

        }
    }

}



let getEntityCount = function (layerName, checkEntityLength, callback) {
    let id = setInterval(() => {
        if (loader)
            if (!checkEntityLength) {
                let entity = self.getObjectLayer(layerName);
                clearInterval(id); // Stop the interval once the value is retrieved
                callback(entity.length); // Pass the value to the callback
            } else {
                // If checkEntityLength is true, maybe handle this scenario differently
                let entity = self.getObjectLayer(layerName);
                if (entity.length > maxEntity) {
                    maxEntity = entity.length;
                }
                clearInterval(id); // Stop the interval once the value is retrieved or condition met
                callback(maxEntity); // Pass the value to the callback
            }

    }, 16);
}


window.getEntityCount = getEntityCount