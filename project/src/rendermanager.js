

export class ShaderManager{
	constructor(_p,dir) {
		this.loaded = false;
		this.reservedWords = ["feedback","resolution","time",
							 "mouse","tx","tx2","tx3","let","mousePressed",
		"tp1","tp2","tp3","tp4","tp5","touchesCount","mousebutton","lerpm"];
		
		this.p = _p ; //Contexto de processing.
		if (!this.loaded) {
			this.localUniformsNames = [];
			this.localUniformsValues = [];
			this.dir = dir;
			this.lerpm = 0.0;
			this.name = dir;
			//pasarAarray();
			this.p.loadStrings(dir, (result) => {
				let localUniformsValues = [];
				let localUniformsNames = [];
				for (let i = 0; i < result.length; i++) {
					let nombreUniform;
					let words = result[i].split(' ');
					let noReservedWord = false;
					for(let k=0; k<this.reservedWords.length; k++){
						if(words[2] == this.reservedWords[k]){
							noReservedWord = true;
						}
					}
					if (result[i].includes("uniform") && !noReservedWord){
						localUniformsNames.push(words[2]);
						localUniformsValues.push(0.5);
					}
				}
				this.localUniformsNames = localUniformsNames;
				this.localUniformsValues = localUniformsValues;
			});0
			this.sh = this.p.loadShader('shaders/base.vert', this.dir, () => {
				this.loaded = true;
			});
		}
	}
	setup(){
		this.loadAllVariables();
	}

	loadAllVariables(dir) {
		if (!this.loaded) {
			this.localUniformsNames = [];
			this.localUniformsValues = [];
			this.dir = dir;

			this.name = dir;
			//pasarAarray();
			this.p.loadStrings(dir, (result) => {
				let localUniformsValues = [];
				let localUniformsNames = [];
				for (let i = 0; i < result.length; i++) {
					let nombreUniform;
					let words = result[i].split(' ');
					//localUniformsNames.push(words[2]);
					//localUniformsValues.push(genR(1));
					
					let noReservedWord = false;
					for(let k=0; k<this.reservedWords.length; k++){
						if(words[2] == this.reservedWords[k]){
							noReservedWord = true;
						}
					}
					if (result[i].includes("uniform") && !noReservedWord){
						localUniformsNames.push(words[2]);
						localUniformsValues.push(0.5);
					}
				}
				this.localUniformsNames = localUniformsNames;
				this.localUniformsValues = localUniformsValues;
			});
			this.sh = this.p.loadShader('shaders/base.vert', this.dir, () => {
				this.loaded = true;
			});
		}	
	}

	update(_pgtx,_pgfb) {
		//This are the global uniforms. The ones for all shaders
		//Estas son los uniforms globales, las que entran en todos los shaders
		if (this.loaded) {
 
      this.sh.setUniform("tx",_pgtx) 
			this.sh.setUniform("feedback",_pgfb) 
			this.sh.setUniform("resolution", [this.p.width, this.p.height]) 
			this.sh.setUniform("time", this.p.millis()*.001) 
			this.sh.setUniform("mouse", [this.p.mouseX / this.p.width, this.p.mouseY / this.p.height])
		 if (this.p.touches.length > 0) {
				this.sh.setUniform("tp1", [this.p.touches[0].x / this.p.width, this.p.touches[0].y / this.p.height]);
			}
			if (this.p.touches.length > 1) {
				this.sh.setUniform("tp2", [this.p.touches[1].x / this.p.width, this.p.touches[1].y / this.p.height]);
			}
			if (this.p.touches.length > 2) {
				this.sh.setUniform("tp3", [this.p.touches[2].x / this.p.width, this.p.touches[2].y / this.p.height]);
			}
			if (this.p.touches.length > 3) {
				this.sh.setUniform("tp4", [this.p.touches[3].x / this.p.width, this.p.touches[3].y / this.p.height]);
			}
			if (this.p.touches.length > 4) {
				this.sh.setUniform("tp5", [this.p.touches[4].x / this.p.width, this.p.touches[4].y / this.p.height]);
			}
			this.sh.setUniform("touchesCount", this.p.touches.length);
			if(this.p.mouseIsPressed){
				this.sh.setUniform("mousePressed", 1);
			}else{
				this.sh.setUniform("mousePressed", 0);
			}
			if(this.p.mouseIsPressed){
				this.sh.setUniform("mousePressed", 1);
			}else{  
				this.sh.setUniform("mousePressed", 0);
			}
			if (this.p.mouseIsPressed) {
                this.lerpm += 0.01;
            } else {
                this.lerpm -= 0.03;
            }
			this.lerpm = this.p.constrain(this.lerpm,0.0,1.0);
			this.sh.setUniform("lerpm", this.lerpm);
			for (var i = 0; i < this.localUniformsNames.length; i++) {
				this.sh.setUniform(this.localUniformsNames[i],
								   this.localUniformsValues[i]);
			}
		}
	}
}
