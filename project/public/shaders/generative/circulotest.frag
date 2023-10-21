precision mediump float;
//vec3 verdejpupper(){return vec3(0.0,1.0,0.8);}

// we need the sketch resolution to perform some calculations
uniform vec2 resolution ;
uniform float time ;
uniform vec2 mouse ;
uniform sampler2D feedback ;



uniform float s ;
#define iTime time
#define iResolution resolution
#define PI 3.14159265359
#define pi PI
#define OCTAVES 8





void main(void){   
    vec2 uv = gl_FragCoord.xy / resolution;
	
	float fx = resolution.x/resolution.y;
	uv.x*=fx;
	vec2 p = vec2(0.5*fx,0.5)-uv;
	float r = length(p);


	float e = 1.-smoothstep(s,s+0.1,r);
	//vec3 fin = vec3(r,g,b);
	
	gl_FragColor = vec4(vec3(e),1.0); 
}
