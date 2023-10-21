

import { Particula } from './particle.js'

export class ParticleSystem {
  constructor(_p) {
    this.ps = []; // ArrayList en JavaScript
    this.p = _p;
  }

  display(_ps) {
   
    for (let p of this.ps) {
      p.display(_ps);
    }
    /*_ps.fill(255,0,0);
    _ps.ellipse(this.p.mouseX,this.p.mouseY,200,200);*/
  }

  update() {
    //console.log(this.ps);
    
   // console.log(this.ps.length);
    for (let i = this.ps.length - 1; i >= 0; i--) {
      let p = this.ps[i];
      p.update();
      if (p.life < 0) {
        this.ps.splice(i, 1);
      }
    }
  }

  addParticle(_x, _y) {
    //console.log(this.p.gp);
    this.ps.push(new Particula(this.p,_x, _y, 
                               this.p.gp.gc1, 
                               this.p.gp.gc2, 
                               this.p.gp.bgc1, 
                               this.p.gp.bgc2));
  }
}