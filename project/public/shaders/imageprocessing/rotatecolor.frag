precision mediump float ;

uniform vec2 resolution ;
uniform float time ;
uniform vec2 mouse ;

uniform sampler2D tx ;
varying vec2 vTexCoord;

uniform float rd1 ;
uniform float rd2 ;
uniform float rd3 ;

#define PI 3.14159265359
mat2 rotate2d(float _angle){
    return mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle));
}

void main(){
	
	vec2 uv = gl_FragCoord.xy / resolution;
		 uv = vTexCoord ;
	
	vec4 t1 =  texture2D(tx, vec2(uv.x,1.0-uv.y));
		

		t1.rg *=rotate2d(rd1*PI*2.); 
		
		t1.bg *=rotate2d(rd2*PI*2.); 
		
		t1.rb *=rotate2d(rd3*PI*2.); 
		
		t1 = abs(t1);
	//fin = vec3(cir(uv,vec2(0.5*fx,0.5),0.4,0.0));
	gl_FragColor = t1; 
}