export default function lala(){
  console.log("HOLA");
}


// Define y exporta una clase
export class MiClase {
  constructor() {
    console.log("Creando una instancia de MiClase");
  }

  miMetodo() {
    console.log("Llamando a miMetodo de MiClase");
  }
}


export class Particula {
  constructor(p,x, y, c1, c2, bc1, bc2) {

    this.pos = p.createVector(x, y);
    this.c1 = c1;
    this.c2 = c2;
    this.bc1 = bc1;
    this.bc2 = bc2;
    this.p = p; //contexto de p5js.
    
    //this.bw = bw; 
    //this.bw = true;
    /*if (this.bw) {
      this.c1 = p.lerpColor(this.c1, p.color(0), p.random(1));
      this.c2 = p.lerpColor(this.c2, p.color(255), p.random(1));
      this.bc1 = p.lerpColor(this.bc1, p.color(255), p.random(1));
      this.bc2 = p.lerpColor(this.bc2, p.color(0), p.random(1));
    } else {
      this.c1 = p.lerpColor(this.c1, p.color(255), p.random(1));
      this.c2 = p.lerpColor(this.c2, p.color(0), p.random(1));
      this.bc1 = p.lerpColor(this.bc1, p.color(0), p.random(1));
      this.bc2 = p.lerpColor(this.bc2, p.color(255), p.random(1));
    }*/

    this.c1 = p.lerpColor(this.c1, p.color(255), p.random(1));
    this.c2 = p.lerpColor(this.c2, p.color(0), p.random(1));


    
    this.bc1 = p.lerpColor(this.bc1, p.color(0), p.random(1));
    this.bc2 = p.lerpColor(this.bc2, p.color(255), p.random(1));




    let st = 20;
    this.speed = p.createVector(p.random(-st, st), p.random(-st, st));
    this.s = p.random(p.gp.maxsize);  
    let sta = p.random(0.01);
    this.accel = p.createVector(0, 0);
    this.speedLimit = 3;
    this.life = 1;
    this.alphabegin = 1;
    this.lr = p.gp.lr;  
    this.bs = p.gp.bs;  
    this.rl = p.gp.rl; 
    this.maxalpha = p.gp.maxalpha; 
  }

  display(_ps) {
   let ss = this.p.map(this.life, 1, 0, this.s, 0);
   _ps.noStroke();
   let cf = _ps.lerpColor(this.c1, this.c2, this.life);
   this.modocolor =2;
    
   if(this.modocolor == 0 ){
      cf = _ps.lerpColor(this.c1, this.c2, p.sin(this.life*50.)*.5+.5);
    }else if(this.modocolor == 1 ){
      cf = _ps.lerpColor(this.c1,this.c2,this.life);
      cf = _ps.lerpColor(cf,_ps.color(0),_ps.random(1));
    }else if(this.modocolor == 2 ){
      cf = _ps.lerpColor(this.c1,this.c2,this.life);
      cf = _ps.lerpColor(cf,_ps.color(255),_ps.noise(_ps.millis()*1));
    }
    cf = _ps.lerpColor(this.c1,this.c2,this.life);
    cf.setAlpha(this.maxalpha * this.alphabegin);

    _ps.fill(cf);
    _ps.noStroke();

   
    if (this.rl) {
      _ps.rect(this.pos.x, this.pos.y, ss, ss);
    } else {
   
    }

   // _ps.ellipse(this.pos.x, this.pos.y, ss, ss);
    this.pincel2(_ps,this.pos.x,this.pos.y)
  }

  pincel1(_ps,_x,_y){
    let x = _x;
    let y = _y;
    let cf = _ps.lerpColor(this.c1,this.c2,this.life);
    let ss = this.p.map(this.life, 1, 0, this.s, 0);
    let cnt = 50;
    for(let i=0; i<cnt; i++){
      let fase = this.p.map(i,0,cnt-1,0,this.p.TWO_PI);
      let cff = _ps.lerpColor(this.c1,this.c2, this.p.sin(fase+this.p.millis()*0.01)*.5+.5);
      let amp = 30;
      let px = _x + this.p.sin(fase) *amp;
      let py = _y + this.p.cos(fase) *amp;
      
      _ps.fill(cff)
      _ps.ellipse(px, py, ss, ss);

    }
  }
  pincel2(_ps,_x,_y){
    let ss = this.p.map(this.life, 1, 0, this.s, 0);
    _ps.ellipse(this.pos.x, this.pos.y, ss, ss);
  }
  update() {
  
    //Mas o menos acá le agrega la fuerza del mouse para que la interacción se siga notando. 
   
    if(this.p.mouseIsPressed){
      
      var mouse = this.p.createVector(this.p.mouseX,this.p.mouseY);
      var dir = mouse.sub(this.pos);
      
      let distance = dir.mag();
      dir.normalize();
      //dir.mult(4.*this.p.map(this.life,0,1,0.2,0.8));
      dir.mult(4.);
      
      
      if(distance > 35){
        this.speed.add(dir);
      }
    }

    //this.accel = this.p.createVector(this.p.random(-30,30),0.0);
    this.speed.add(this.accel)
    //this.speed = this.p.createVector(-2.,0.0);
    this.speed.limit(this.speedLimit);
    this.pos.add(this.speed);

    //this.pos.x =this.p.random(this.p.width);
    this.life -= this.lr;
    this.alphabegin += 0.01;
  
  }

  applyForce(accel) {
    this.accel = accel;
  }
}
