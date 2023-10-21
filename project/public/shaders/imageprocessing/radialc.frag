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
uniform float seed ;

float rdm(float p){
    p*=1234.56;
    p = fract(p * .1031);
    p *= p + 33.33;
    return fract(2.*p*p);
}

void main()
{	
	vec2 uv = gl_FragCoord.xy / resolution;	
	     uv = vTexCoord;
	vec2 uv2 = vTexCoord;
	float fix = resolution.x/resolution.y;
	uv.x*=fix;
	vec2 p = vec2(0.5*fix,0.5) - uv;
	float r = length(p);
	
	vec3 c1 = vec3(rdm(seed*535.0),rdm(seed*64234.0),rdm(seed*210.0));
	vec3 c2 = vec3(rdm(seed*199.0),rdm(seed*231.0),rdm(seed*542.0));
	vec3 c3 = vec3(rdm(seed*532.0),rdm(seed*4231.0),rdm(seed*14.0));
	
	
	vec3 c = texture2D(tx,vec2(uv2.x,1.-uv2.y)).rgb;
	
	float prom = (c.r+c.g+c.b)/3.;
	
	
	float f1 = sin(r*10.+time+prom*10.)*.5+.5;
	float f2 = sin(r*20.+time+prom*20.)*.5+.5;
	
	
	vec3 dib = mix(c1,c2,f1);
	vec3 dib2 = mix(c3,dib,f2);
	
	
	/*c.r = c.r*v1;
	c.g = c.g*v2;
	c.b = c.b*v3;*/

	gl_FragColor = vec4(c*dib2,1.0); 
}