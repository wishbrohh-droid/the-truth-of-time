const menu = document.getElementById("menu")
const levelPage = document.getElementById("levelPage")
const levelTitle = document.getElementById("levelTitle")

function openLevel(level){

menu.style.display="none"
levelPage.classList.remove("hidden")

levelTitle.innerText="Level "+level

document.getElementById("story1ujryhusiuoj").innerText=""
document.getElementById("story2").innerText=""
document.getElementById("story3").innerText=""
document.getElementById("story4").innerText=""
document.getElementById("story5").innerText=""
document.getElementById("story6").innerText=""
document.getElementById("story7").innerText=""
document.getElementById("story8").innerText=""
document.getElementById("story9").innerText=""
document.getElementById("story10").innerText=""

}

function goBack(){

menu.style.display="block"
levelPage.classList.add("hidden")

}

/* STAR BACKGROUND */

const canvas=document.getElementById("universe")
const ctx=canvas.getContext("2d")

canvas.width=window.innerWidth
canvas.height=window.innerHeight

let stars=[]

for(let i=0;i<250;i++){

stars.push({
x:Math.random()*canvas.width,
y:Math.random()*canvas.height,
size:Math.random()*2,
speed:Math.random()*0.6
})

}

function animate(){

ctx.clearRect(0,0,canvas.width,canvas.height)

ctx.fillStyle="white"

stars.forEach(star=>{

star.y+=star.speed

if(star.y>canvas.height){
star.y=0
}

ctx.beginPath()
ctx.arc(star.x,star.y,star.size,0,Math.PI*2)
ctx.fill()

})

requestAnimationFrame(animate)

}

animate()
