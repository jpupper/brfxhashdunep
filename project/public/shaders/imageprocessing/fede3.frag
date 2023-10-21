precision mediump float ;

uniform vec2 resolution ;
uniform float time ;
uniform vec2 mouse ;

uniform sampler2D tx ;
uniform sampler2D tx2 ;

uniform sampler2D feedback ;

varying vec2 vTexCoord;

uniform float dprom ;

uniform float freq ;


bool respectaspectradio = true;
bool quadvignette = true;

 
float mapr(float _value,float _low2,float _high2) {
	float val = _low2 + (_high2 - _low2) * (_value - 0.) / (1.0 - 0.);
    //float val = 0.1;
	return val;
}
// Some useful functions
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
 float ridge2(float h, float offset) {
    h = abs(h);     // create creases
    h = offset - h; // invert so creases are at top
    h = h * h;      // sharpen creases
    return h;
}
float snoise2(vec2 v) {

    // Precompute values for skewed triangular grid
    const vec4 C = vec4(0.211324865405187,
                        // (3.0-sqrt(3.0))/6.0
                        0.366025403784439,
                        // 0.5*(sqrt(3.0)-1.0)
                        -0.577350269189626,
                        // -1.0 + 2.0 * C.x
                        0.024390243902439);
                        // 1.0 / 41.0

    // First corner (x0)
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);

    // Other two corners (x1, x2)
    vec2 i1 = vec2(0.0);
    i1 = (x0.x > x0.y)? vec2(1.0, 0.0):vec2(0.0, 1.0);
    vec2 x1 = x0.xy + C.xx - i1;
    vec2 x2 = x0.xy + C.zz;

    // Do some permutations to avoid
    // truncation effects in permutation
    i = mod289(i);
    vec3 p = permute(
            permute( i.y + vec3(0.0, i1.y, 1.0))
                + i.x + vec3(0.0, i1.x, 1.0 ));

    vec3 m = max(0.5 - vec3(
                        dot(x0,x0),
                        dot(x1,x1),
                        dot(x2,x2)
                        ), 0.0);
    m = m*m ;
    m = m*m ;

    // Gradients:
    //  41 pts uniformly over a line, mapped onto a diamond
    //  The ring size 17*17 = 289 is close to a multiple
    //      of 41 (41*7 = 287)

    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;

    // Normalise gradients implicitly by scaling m
    // Approximation of: m *= inversesqrt(a0*a0 + h*h);
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0+h*h);

    // Compute final noise value at P
    vec3 g = vec3(0.0);
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * vec2(x1.x,x2.x) + h.yz * vec2(x1.y,x2.y);
    return 130.0 * dot(m, g);
}

#define OCTAVES 8
float ridgedMF2(vec2 p) {
    float lacunarity = 2.0;
    float gain = 0.5;
    float offset = 0.9;

    float sum = 0.0;
    float freq = 1.0, amp = 0.5;
    float prev = 1.0;
    for(int i=0; i < OCTAVES; i++) {
        float n = ridge2(snoise2(p*freq), offset);
        sum += n*amp;
        sum += n*amp*prev;  // scale by previous octave
        prev = n;
        freq *= lacunarity;
        amp *= gain;
    }
    return sum;
}

mat2 scale(vec2 _scale){
    return mat2(_scale.x,0.0,
                0.0,_scale.y);
}
void main(){
	
	vec2 uv = gl_FragCoord.xy / resolution;
		 uv = vTexCoord ;
	
	vec4 t1 =  texture2D(tx, vec2(uv.x,1.0-uv.y));
	vec4 t2 =  texture2D(tx2, vec2(uv.x,1.0-uv.y));
	
	vec2 uv2 = uv;
	vec2 uv3 = uv;
	
	float prom1 = (t1.r+t1.g+t1.b)/3.;
	float prom2 = (t2.r+t2.g+t2.b)/3.;

	
	float limit = sin(length(t1)*10.+time)*.5+.5;
	
	vec3 nafta = sin(t1.rgb*10.+time)*.5+.5;
		vec3 nafta2 = sin(t2.rgb*10.+time*2.)*.5+.5;
		
		t1.rgb = mix(t1.rgb,nafta,0.5);
		t2.rgb = mix(t2.rgb,nafta,0.5);
		
	vec3 fin = sin(t1.rgb*5.+time)*.5+.5;;
		 fin = mix(t2.rgb,t1.rgb,limit);
		 
		 
	if(t1.r > limit && t1.g > limit && t1.b > limit){
		fin =  mix(t1.rgb,t2.rgb,limit);
	}
	
	vec2 puv = vec2(uv.x,1.0-uv.y);
	
	puv-=vec2(0.5);
	puv*=scale(vec2(0.995+prom1*.01));
	puv+=vec2(0.5);
	
	vec4 p1 =  texture2D(feedback, puv);
	
	float limit2 = sin(length(p1)*10.+time)*.2+.5;
	
	if(fin.r > limit2 && fin.g > limit2 && fin.b > limit2 ){
		
		fin = p1.rgb;
	}
	//fin = sin(fin*p1.rgb*2.+time)*.5+.5;
	gl_FragColor = vec4(fin,1.0); 
}