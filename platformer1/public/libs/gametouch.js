"use-strict"
const joystick = document.createElement("template")
const cross = document.createElement("template")
const freebutton = document.createElement("template")
document.body.innerHTML=`
<style>
*{
margin:0;
padding:0;
box-sizing:border-box;
user-select:none;
overflow:hidden;

}

</style>

`

/*cross style*/
joystick.innerHTML = `
<style>

#btncontainer{
position:fixed;
background:rgba(255,255,255,0.2);
width:100px;
height:100px;
border-radius:50%;
border:6px double gray;
z-index:2;
}

#btncontainer:before{
content:'';
position:absolute;
background:rgba(0,255,0,0.1);
width:30px;
height:30px;
border-radius:50%;
border:6px solid gray;
left:26.7%;
top:30px;
z-index:2;
}

#movable{
position:absolute;
background:rgba(0,0,0,0.1);
width:50px;
height:50px;
border-radius:50%;
top:29%;
left:22%;
border:3px dotted gray;
z-index:2;
}



</style>
`

/*cross style*/

cross.innerHTML = `
<style>
.cross-container{
position:fixed;
width:180px;
height:180px;
z-index:999;
.left,.right,.up,.down{
border:none;
border-radius:50%;
}

}




.left {
  width: 50px;
  height: 50px;
  background: rgba(3, 3, 3, 0.2);
  position: relative;
  top:35%;
  left:8%;
}

.left::before {
  content: '';
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 15px 25px 15px 0; /* Adjust as needed for the arrow size */
  border-color: transparent rgba(255, 255, 255, 0.2) transparent transparent; /* Arrow color */
  position: absolute;
  top: 50%;
  right: 30%; /* Adjust the position of the arrow */
  transform: translate(0, -50%);
}



.right {
  width: 50px;
  height: 50px;
  background: rgba(3, 3, 3, 0.2);
  position: relative;
  top:35%;
  left:30%;

}

.right::before {
  content: '';
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 15px 0 15px 25px; /* Adjust as needed for the arrow size */
  border-color: transparent transparent transparent rgba(255, 255, 255, 0.2); /* Arrow color */
  position: absolute;
  top: 50%;
  left: 50%; /* Adjust the position of the arrow */
  transform: translate(-50%, -50%);
}

.up {
  width: 50px;
  height: 50px;
  background: rgba(3, 3, 3, 0.2);
  position: relative;
  right:25%;
}

.up::before {
  content: '';
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0px 15px 25px 15px; /* Adjust as needed for the arrow size */
  border-color: transparent transparent rgba(255, 255, 255, 0.2) transparent ; /* Arrow color */
  position: absolute;
  top: 50%; /* Adjust the position of the arrow */
  left: 50%;
  transform: translate(-50%, -50%);
}


.down {
  width: 50px;
  height: 50px;
  background: rgba(3, 3, 3, 0.4);
  position: relative;
  top:40%;
  left: 35%;
}

.down::before {
  content: '';
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 25px 15px 0 15px; /* Adjust as needed for the arrow size */
  border-color: rgba(255, 255, 255, 0.2) transparent transparent transparent ; /* Arrow color */
  position: absolute;
  top: 50%; /* Adjust the position of the arrow */
  left: 50%;
  transform: translate(-50%, -50%);
}

.left:active,.right:active,.up:active,.down:active{
transform:scale(0.5,0.5);
transition: all 0.3s;
 }


</style>
`


/*freebutton style*/
freebutton.innerHTML =`
<style>
:root{
--dimension:35px;
--size:calc(var(--dimension)/3);/*for fontSize of text*/
--left:calc(var(--dimension)/2 - var(--size)/1.4);
--top:calc(var(--dimension)/3 - var(--size)/2);
}
.custom-button{
position:fixed;
 width:30px;
 height:30px;
 border-radius:50%;
 background: rgba(3, 3, 3, 0.2);
z-index:999;
 }
 
 .jump{
 width: 50px;
 height: 50px;
 background: rgba(3, 3, 3, 0.4);
 position:absolute;
 border:none;
 }
 
 .jump::before {
 content: '';
 width: 0;
 height: 0;
 border-style: solid;
 border-width: 0px 15px 25px 15px; /* Adjust as needed for the arrow size */
 border-color: transparent transparent rgba(255, 255, 255, 0.5) transparent ; /* Arrow color */
 position: absolute;
 top: 50%; /* Adjust the position of the arrow */
 left: 50%;
 transform: translate(-50%, -50%);
 }
 
 .jump:active{
 transform:scale(0.5,0.5);
 }
 
 .alphabet{
 width:var(--dimension);
 height:var(--dimension);
 color:white;
 padding-left:var(--left);
 padding-top:var(--top);
  font-size:var(--size);
  font-family:sans-serif;
border:5px double rgba(55,225,235,0.5);
 }
 
 .alphabet:active{
transform:scale(0.8,0.8);
transition: all 0.3s;
 }
 
</style>
`

//end of style

let moveLeft=false
let moveRight=false
let moveUp=false
let moveDown=false

let movable
let Joystick

function Swiper(){
this.btncontainer = document.createElement("div")
this.movable = document.createElement("div")
movable = this.movable
this.btncontainer.setAttribute("id","btncontainer")
this.movable.setAttribute("id","movable")
this.addContainer = function(x){
document.body.appendChild(x)
}

this.addMovable = function(x){
this.btncontainer.appendChild(x)
}

this.visible = function(value){
this.btncontainer.style.visibility=value
}

const cloneJoystick = joystick.content.cloneNode(true)

document.body.appendChild(cloneJoystick)


this.btncontainer.ontouchmove = move
this.btncontainer.ontouchstart = action
this.btncontainer.ontouchend = end


}

Joystick = Swiper

let startX,startY,moveX,moveY;

function action(e){
e.preventDefault()
startX = e.targetTouches[0].clientX
startY = e.targetTouches[0].clientY 
}


function move(e){
moveX = e.touches[0].clientX
moveY = e.touches[0].clientY

if(startX -20 > moveX){
moveLeft = true
moveRight = false
moveUp = false
moveDown = false
movable.style.left = -1.5+"px"
}

else if(startX+20 < moveX){
moveRight = true
moveReft = false
moveUp = false
moveDown = false
movable.style.left = 40+"px"

}

if(startY-20 > moveY){
moveUp = true
moveLeft = false
moveRight = false
moveDown = false
movable.style.top = -1.5+"px"

}

else if(startY+20 < moveY){
moveUp = false
moveLeft = false
moveRight = false
moveDown = true
movable.style.top = 40+"px"
}

}


function end(e){
movable.style.left = 19.5+"px"
movable.style.top = 26+"px"
moveLeft = false
moveRight = false
moveUp = false
moveDown = false

}


// cross button

let arrowL = false
let arrowR = false
let arrowU = false
let arrowD = false;

function crossButton(){
 this.container = document.createElement("div")
 this.container.classList.add("cross-container")
 document.body.appendChild(this.container)
 
 this.visible = function(value,args=[]){
 if(args.length<=0){
 this.container.style.visibility=value
 }else{
  args.map((arg,i)=>{
   this.container.children[i].style.visibility=value
  })
 
 }
 }
 
 this.container.innerHTML =`
 <button id="left" class="left"></button>
 <button id="right" class="right"></button>
 <button id="up" class="up"></button>
 <button id="down" class="down"></button>
 
 `
 
 //get input to attach event
 let inputL = document.querySelector("#left")
 let inputR = document.querySelector("#right")
 let inputU = document.querySelector("#up")
 let inputD = document.querySelector("#down")

inputL.ontouchstart = function(){
 arrowL = true
}

inputL.ontouchend = function(){
 arrowL = false
}

inputR.ontouchstart = function(){
 arrowR = true
}

inputR.ontouchend = function(){
 arrowR = false
}

inputU.ontouchstart = function(){
 arrowU = true
}

inputU.ontouchend = function(){
 arrowU = false
}

inputD.ontouchstart = function(){
 arrowD = true

}

inputD.ontouchend = function(){
 arrowD = false
}

 
}

const cloneCross = cross.content.cloneNode(true)

document.body.appendChild(cloneCross)


//freebutton js
function freeButton(id=null,imageSrc,opacity){
this.id = id
this.imageSrc = imageSrc
this.opacity = opacity
this.container = document.createElement("div")
this.container.classList.add("custom-button")

document.body.appendChild(this.container)
this.setLetter = function(x){
if(x.length === 1){
 x = x.toUpperCase()
}
this.container.innerHTML= `
  <h4>${x}</h4>
`

}

this.visible = function(value){
   this.container.style.visibility=value
}

this.container.innerHTML =`
<div id="btn"></div>
`
this.but = document.querySelector("#btn")

if(this.id =="jump"){
 this.but.classList.add(this.id)
 this.but.parentNode.style.background='rgba(0,0,0,0)'
}

 if(this.imageSrc){
this.image = new Image()
this.container.children[0].appendChild(this.image)
this.image.width = 40
this.image.style.marginTop="5%"
this.image.style.marginLeft="5%"
this.container.style.zIndex=9999
this.image.style.opacity = this.opacity
this.image.src = this.imageSrc
this.image.style.transition = "5s"

}

if(!this.id && !this.imageSrc){
this.container.classList.add("alphabet")
}



}

const cloneFreeButton = freebutton.content.cloneNode(true)

document.body.appendChild(cloneFreeButton)


let gametouch = {
crossButton,
freeButton,
Joystick,moveUp,
moveDown,moveLeft,
moveRight,movable
}



//export default gametouch