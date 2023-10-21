precision mediump float;
//vec3 verdejpupper(){return vec3(0.0,1.0,0.8);}

// we need the sketch resolution to perform some calculations
uniform vec2 resolution ;
uniform float time ;
uniform vec2 mouse ;
uniform sampler2D feedback ;
uniform int touchesCount ;
uniform int mousePressed ;

varying vec2 vTexCoord ;


#define iTime time
#define iResolution resolution
#define PI 3.14159265359
#define pi PI
#define OCTAVES 8


uniform float s ;
uniform float d ; 
uniform float mb ; 
uniform float rojo ;

float mapr(float value,float low2,float high2) {
	 return low2 + (high2 - low2) * (value - 0.) / (1. - 0.);
}

void main(void){   
    vec2 uv = gl_FragCoord.xy / resolution;
		 uv = vTexCoord.xy;
		 
	float fx = resolution.x/resolution.y;
	uv.x*=fx;
	vec2 p = vec2(mouse.x*fx,1.-mouse.y)-uv;
	float r = length(p);

	//feedback
	float e = 1.-smoothstep(0.0,mapr(d,0.02,0.03),r);
	//vec3 fin = vec3(r,g,b);
	
	
	vec2 puv = gl_FragCoord.xy / resolution;
	vec4 fb = texture2D(feedback,vec2(puv.x,1.-puv.y));
	
	vec3 dib = vec3(0.0);
	
	if(mb == 0.3){
		
			
		 if(mousePressed == 1){
			e = 1.-smoothstep(0.0,mapr(d,0.005,0.0051),r);
		 }else{
			e = 0.0;
		 }
		dib = vec3(e,e,0.0);
		
	}else if(mb == 0.9){
		
		 if(mousePressed == 1){
			e = 1.-smoothstep(0.0,mapr(d,0.05,0.08),r);
		 }else{
			e = 0.0;
		 }
		dib = vec3(-e);
	}else if(mb == 0.9){
	}
	
	
	vec3 fin = dib+fb.rgb;

		gl_FragColor = vec4(fin,1.0); 
	
}
