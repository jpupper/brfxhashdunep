//import Particula3 from './particle.js';
//Probar shaders. Bloom . 

import { Particula } from './particle.js'
import { ParticleSystem } from './particlesystem.js'
import { FlowField } from './flowfield.js'
import { ShaderManager} from './rendermanager.js'
//var express = require("express");


const io = require('socket.io-client');


const socket = io('http://localhost:3300/?target=http%3A%2F%2Flocalhost%3A3301');


function genR(min, max) {
	let result = 0;
	if (!max) { result = fxrand() * (min - 0) + 0; } else { result = fxrand() * (max - min) + min; }
	return result;
}


$fx.params([
  {
    id: "color_1",
    name: "Color 1",
    type: "color",
  },
  {
    id: "color_2",
    name: "Color 2",
    type: "color",
  },
  {
    id: "xys_id",
    name: "XYS",
    type: "string",
  },
  
])


/*oscPort.on("message", function (oscMsg) {
  console.log("An OSC message just arrived!", oscMsg);
});*/

const sketch = (p) => {
  let a = 100 ;
  let gc1,gc2,bgc1,bgc2; // COLORES 
  let lr ;//LIFE DURATION
  let rl ; // rect or ellipse
  let bs ;//borde size
  let maxsize ;//tamaño maximo de borde
  let ff;
  let ps;
  let fff ; //flowfield force
  let maxalpha ;
  let bw; //SI VA DE NEGRO A BLANCO O DE BLANCO A NEGRO
  let cw;  // Si el color es sinuidal o no. 
  let sizeamp;
  let sizespeed;

  let modocolor;
  let automatic = false;
  let duration = 40 ; //Tiempo que tarda para estar disponible para poder volver a spawnear una particula. 
  let lasttime ;
  let pgparticles;
  let pgshader1;
  let pg2_light;

  let sh1 ;
  let dibp ; //DIBUJO DE PRUEBA
  let shloaded = false; //Si cargo el shader o no.
  let ps2 ;
  let gp ; 

  let shmanag,shmanag2 ;
  let points;

  let activable;
  let durationaf = 3000; //DURATION DESDE QUE PUEDO REINICIAR.
  let lasttimeaf = 0;



  //0 = Modo Mint //Acá lo de ponerle los puntos y eso.
  //1 = Modo Freestyle.

  let modomint = 1; 

  p.preload = () => {
    //Asignamos valores iniciales para que no crashee ? 

    shmanag = new ShaderManager(p,"shaders/imageprocessing/feedbackbr.frag");
    shmanag2 = new ShaderManager(p,"shaders/imageprocessing/lighting3dminimal.frag");
   
    //console.log(shmanag.sh);
    p.gp = {
      bw:true,
      maxsize:10,
      lr:10,
      bs:3,
      rl:0,
      maxalpha:255,
      fff:30
    }
    //console.log("PRELOAD");
    sh1 = p.loadShader('shaders/base.vert', "shaders/imageprocessing/feedbackbr.frag", () => {
      shloaded = true;
      //console.log("CARGO SHADER");
    });
    //ff = new FlowField();
    lasttime = 0;
    pg2_light = p.createGraphics(p.windowWidth,p.windowHeight,p.WEBGL);
    pg2_light.translate(-p.windowWidth /2,-p.windowHeight/2)
    pgparticles = p.createGraphics(p.windowWidth,p.windowHeight,p.WEBGL);
    pgparticles.translate(-p.windowWidth /2,-p.windowHeight/2)
    pgshader1 = p.createGraphics(p.windowWidth,p.windowHeight,p.WEBGL);
    pgshader1.translate(-p.windowWidth /2,-p.windowHeight/2)
    //p.generative();

    points = []
  }
  
  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
    p.rectMode(p.CENTER);
    /*ptest = new Particula(p,p.width/2,p.height/2,
                           p.color(255,0,0), p.color(0,0,255),p.color(0,0,255),p.color(0,255,0),
                          bw,maxsize,lr,bs,rl,maxalpha);*/
    //ps = new ParticleSystem(p);
    p.generative();
    //socket = io.connect("https://cocaemoji-bad03ba08de2.herokuapp.com");
	  //socket = io.connect();
	  //socket.on("mouse",  p.newDrawing);
     // Escuchar mensajes de socket
  socket.on('mousePressed', (data) => {
    console.log('Mouse pressed at', data.mouseX, data.mouseY);
    // Aquí puedes agregar el código para manejar este evento, como dibujar algo en la pantalla
  });
  };
 
  p.draw = () => {
    p.translate(-p.windowWidth /2,-p.windowHeight/2)
   // ptest.display(pgparticles);
    ps.display(pgparticles);
   // ps.update();
    p.update();
    p.updateShader();
    //p.image(pgshader1,0,0,p.windowWidth,p.windowHeight);
    p.image(pgshader1,0,0,p.windowWidth,p.windowHeight);
   //p.ellipse(p.mouseX,p.mouseY,40,40);
    
    p.fill(255);
   // console.log("cnt points " + points.length);
  };
  p.updateShader = () =>{
    shmanag.update(pgparticles,pgshader1);
    shmanag.sh.setUniform("r1",p.red(p.gp.gc1)/255.)
    shmanag.sh.setUniform("g1",p.green(p.gp.gc1)/255.)
    shmanag.sh.setUniform("b1",p.blue(p.gp.gc1)/255.)
    shmanag.sh.setUniform("r2",p.red(p.gp.gc2)/255.)
    shmanag.sh.setUniform("g2",p.green(p.gp.gc2)/255.)
    shmanag.sh.setUniform("b2",p.blue(p.gp.gc2)/255.)

    pgshader1.push();
    pgshader1.shader(shmanag.sh);
    pgshader1.rect(0,0,p.width,p.height);
    pgshader1.pop();
  }

  p.newDrawing = (data2) => {
    console.log(data2);
    //dibujarCoso(data2);
    if (renderMode) {
      addParticle(data2);
    }
  }
  p.update = () =>{
    ps.update();
    ff.updatePS(ps);

    if(modomint == 0){
      p.updateMintMode();
    }
    if(modomint == 1){
      p.updateFreestyle();
    }
    
    if(!p.mouseIsPressed){
      activable = true;
    }
    //Pequeño Algoritmo para mostrar los puntos. 
  }
  p.updateFreestyle = () =>{
    if (p.mouseIsPressed) {
      if(p.millis() - lasttime  > duration){
        lasttime = p.millis();
        ps.addParticle(p.mouseX, p.mouseY);
        points.push({x:p.mouseX,y:p.mouseY});
        if(points.length == 100){
          lasttimeaf = p.millis();
        }
      }
      activable = false;
    }
  }
  p.updateMintMode = () =>{
    if(points.length < 100){
      if (p.mouseIsPressed) {
        if(p.millis() - lasttime  > duration){
          lasttime = p.millis();
          ps.addParticle(p.mouseX, p.mouseY);
          points.push({x:p.mouseX,y:p.mouseY});
          if(points.length == 100){
            lasttimeaf = p.millis();
          }
        }
        activable = false;
      }
      if (automatic) {
        if (genR(1) > 0.91) {
          ps.addParticle(genR(p.width), genR(p.height));
        }
      }
    }else{
      if(p.millis() - lasttimeaf > durationaf && activable && p.mouseIsPressed){
        /*p.generative();
        pgparticles.background(0);
        pgshader1.background(0);  */
        p.cleanEverything();
      }
    }

  }

  p.windowResized = () => {
   // console.log("RESIZE");
    
    pg2_light.resizeCanvas(p.windowWidth,p.windowHeight,p.WEBGL);
    pgparticles.resizeCanvas(p.windowWidth,p.windowHeight,p.WEBGL);
    pgshader1.resizeCanvas(p.windowWidth,p.windowHeight,p.WEBGL);
    pg2_light.translate(-p.windowWidth /2,-p.windowHeight/2)
    pgparticles.translate(-p.windowWidth /2,-p.windowHeight/2)
    pgshader1.translate(-p.windowWidth /2,-p.windowHeight/2)
    p.resizeCanvas(p.windowWidth,p.windowHeight,p.WEBGL);
    p.translate(-p.windowWidth /2,-p.windowHeight/2)
    p.cleanEverything();
  }

  p.mousePressed = () => {
    //p.generative();
    //pgparticles.background(0);
    //pgshader1.background(0);

    const data = {
      mouseX: p.mouseX,
      mouseY: p.mouseY
    };
    socket.emit('mousePressed', data);
  };

  p.keyPressed = () => {
    if (p.key === 'a') {
      p.background(0);
      ps = new ParticleSystem();
    }
    if (p.key === 's') {
      //generative();
      p.cleanEverything();
    }
    if (p.key === 'd') {
      automatic = !automatic;
    }
  };

  p.getColorPalette = () => {

    let colorArray = []
    
    colorArray.push({c1:p.color(59,99,237),c2:p.color(227,147,65)});
    colorArray.push({c1:p.color(220,107,22),c2:p.color(78,116,143)});
    colorArray.push({c1:p.color(111,87,226),c2:p.color(247,140,11)});
    colorArray.push({c1:p.color(69,147,176),c2:p.color(187,190,35)});
    colorArray.push({c1:p.color(55,198,209),c2:p.color(215,21,36)});
    colorArray.push({c1:p.color(216,89,152),c2:p.color(242,145,35)});
    colorArray.push({c1:p.color(247,86,156),c2:p.color(17,70,71)});
    colorArray.push({c1:p.color(215,173,110),c2:p.color(154,8,10)});
    colorArray.push({c1:p.color(94,143,246),c2:p.color(221,208,40)});
    colorArray.push({c1:p.color(194,116,203),c2:p.color(83,134,148)});
    colorArray.push({c1:p.color(149,82,15),c2:p.color(236,245,210)});
    colorArray.push({c1:p.color(140,64,140),c2:p.color(53,122,131)});
    colorArray.push({c1:p.color(110,144,225),c2:p.color(223,153,137)});
    colorArray.push({c1:p.color(149,169,22),c2:p.color(215,53,8)});
    colorArray.push({c1:p.color(143,75,198),c2:p.color(216,171,127)});
    colorArray.push({c1:p.color(246,197,240),c2:p.color(127,66,21)});
    colorArray.push({c1:p.color(218,61,55),c2:p.color(67,10,138)});
    colorArray.push({c1:p.color(139,219,176),c2:p.color(216,105,2)});
    colorArray.push({c1:p.color(117,13,247),c2:p.color(234,214,162)});
    colorArray.push({c1:p.color(223,193,235),c2:p.color(218,124,40)});
    colorArray.push({c1:p.color(252,139,241),c2:p.color(71,61,165)});
    colorArray.push({c1:p.color(146,249,233),c2:p.color(145,103,68)});
    colorArray.push({c1:p.color(204,112,136),c2:p.color(119,110,170)});
    colorArray.push({c1:p.color(0,242,181),c2:p.color(222,26,161)});
    colorArray.push({c1:p.color(193,23,6),c2:p.color(123,120,150)});
    colorArray.push({c1:p.color(137,78,27),c2:p.color(152,170,222)});
    colorArray.push({c1:p.color(88,143,109),c2:p.color(156,78,52)});
    colorArray.push({c1:p.color(8,70,240),c2:p.color(251,26,41)});
    colorArray.push({c1:p.color(152,207,112),c2:p.color(209,187,92)});
    let idx = Math.floor(genR(colorArray.length-1));
    console.log(idx);
    return colorArray[idx];
  }

  //*********************** */

  p.cleanEverything = () =>{
    p.generative();
    pgparticles.background(0);
    pgshader1.background(0);  
  }
  p.generative = () =>{

    //p.gp.gc1 = p.color(genR(255), genR(255), genR(255));
    //p.gp.gc2 = p.color(genR(255), genR(255), genR(255));

    let cpalet = p.getColorPalette();
    p.gp.gc1 =cpalet.c1;
    p.gp.gc2 =cpalet.c2;

    //p.gp.gc1 = p.color(genR(255), genR(255), genR(255));
    //p.gp.gc2 = p.color(genR(255), genR(255), genR(255));
    //ACA VA UN ALGORITMO DE COLOR QUE LA ROMPE. 

    console.log("colorArray.push({c1:p.color("+Math.floor(p.red(p.gp.gc1))+","+Math.floor(p.green(p.gp.gc1))+","+Math.floor(p.blue(p.gp.gc1))+"),c2:p.color("+Math.floor(p.red(p.gp.gc2))+","+Math.floor(p.green(p.gp.gc2))+","+Math.floor(p.blue(p.gp.gc2))+")});")

    //console.log("p.color("+Math.floor(p.red(p.gp.gc1))+","+Math.floor(p.green(p.gp.gc1))+","+Math.floor(p.blue(p.gp.gc1))+")");
    //console.log("p.color("+Math.floor(p.red(p.gp.gc2))+","+Math.floor(p.green(p.gp.gc2))+","+Math.floor(p.blue(p.gp.gc2))+")");

    p.gp.bgc1 = p.color(genR(255), genR(255), genR(255));
    p.gp.bgc2 = p.color(genR(255), genR(255), genR(255));

    points = [];

    
    p.gp.bw = genR(1) > 0.5;
    p.gp.bs = genR(8);
    p.gp.fff = genR(0.8);
    p.gp.maxsize = genR(30,150);
    p.gp.maxalpha = genR(150,255);
    p.gp.sizeamp = genR(0);
    p.gp.sizespeed = genR(0.001, 0.1);

    if (genR(1) > 0.8) {
      p.gp.maxsize = genR(20);
    }

   // p.gp.lr = genR(0.001, 0.01);
    p.gp.lr =0.01
    p.gp.rl = genR(1) > 1;

    p.noiseSeed(p.floor(genR(1000)));
    //ff = new FlowField();
    ff = new FlowField(p);
    ps = new ParticleSystem(p);

    modocolor = genR(2);
  }
 
};


function cleanHex(hexColor) {
  return hexColor.slice(0, -2);
}
function alphaToDecimal(hexColor) {
  const alphaHex = hexColor.slice(-2);
  const alphaDecimal = parseInt(alphaHex, 16);
  return alphaDecimal;
}
new p5(sketch);