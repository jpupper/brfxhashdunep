precision mediump float ;

uniform vec2 resolution ;
uniform float time ;
uniform vec2 mouse ;

varying vec2 vTexCoord;

#define iTime time
#define iResolution resolution
#define pi 3.14159265359


//#pragma include "../common.frag" //ESta linea tiene todas las definiciones de las funciones globales

uniform sampler2D tx ;
uniform float isinvert ;

void main()
{	
	vec2 uv = gl_FragCoord.xy / resolution;	
	     uv = vTexCoord;
	vec3 c=texture2D(tx,vec2(uv.x,1.-uv.y)).rgb;
	
	if(isinvert < 0.5){
		c.r = 1.-c.r;
		c.g = 1.-c.g;
		c.b = 1.-c.b;
	}
	
	gl_FragColor = vec4(c,1.0); 
}