precision mediump float;
//vec3 verdejpupper(){return vec3(0.0,1.0,0.8);}

// we need the sketch resolution to perform some calculations
uniform vec2 resolution ;
uniform float time ;
uniform vec2 mouse ;
uniform sampler2D feedback ;
uniform sampler2D tx ;
uniform sampler2D tx2;
uniform sampler2D tx3;
uniform sampler2D tx4;

varying vec2 vTexCoord ;
uniform float seed ;

#define fx resolution.x/resolution.y
#define h1 (rdm(startRandom))
#define h2 (rdm(startRandom+2.))
#define PI 3.14159235659
#define TWO_PI PI*2.
#define sr startRandom 


uniform float tizar ;
uniform float tizag ;
uniform float tizab ;
uniform float boardc ;
float rdm(float p){
    p*=1234.56;
    p = fract(p * .1031);
    p *= p + 33.33;
    return fract(2.*p*p);
}

float mapr(float value,float low2,float high2) {
	 return low2 + (high2 - low2) * (value - 0.) / (1. - 0.);
}

mat2 rotate2d(float _angle){
    return mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle));
}
mat2 scale(vec2 _scale){
    return mat2(_scale.x,0.0,
                0.0,_scale.y);
}

float sm(float m1,float m2, float e){
	return smoothstep(m1,m2,e);
}
float poly(vec2 uv,vec2 p, float s, float dif,int N,float a){
    // Remap the space to -1. to 1.
    vec2 st = p - uv ;
    // Angle and radius from the current pixel
    float a2 = atan(st.x,st.y)+a;
    float r = TWO_PI/float(N);
    float d = cos(floor(.5+a2/r)*r-a2)*length(st);
    float e = 1.0 - smoothstep(s,dif,d);
    return e;
}

// Some useful functions
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }


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


float ridge2(float h, float offset) {
    h = abs(h);     // create creases
    h = offset - h; // invert so creases are at top
    h = h * h;      // sharpen creases
    return h;
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

float rxr(vec2 uv){
    float e = 0.;
    e = ridgedMF2(vec2(ridgedMF2(vec2(uv.x,uv.y))));    
    return e;
}
float random (in vec2 _st) {
    return fract(sin(dot(_st.xy,
                         vec2(12.9898,78.233)))*
        43758.56222123);
}
float noise (in vec2 _st) {
    vec2 i = floor(_st);
    vec2 f = fract(_st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}
float noise (in vec2 st,float fase) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    float fase2 = fase;
    // Four corners in 2D of a tile
    float a = sin(random(i)*fase2);
    float b =  sin(random(i + vec2(1.0, 0.0))*fase2);
    float c =  sin(random(i + vec2(0.0, 1.0))*fase2);
    float d =  sin(random(i + vec2(1.0, 1.0))*fase2);

    // Smooth Interpolation

    // Cubic Hermine Curve.  Same as SmoothStep()
    vec2 u = f*f*(3.0-2.0*f);
    // u = smoothstep(0.,1.,f);

    // Mix 4 coorners percentages
    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}
float fbm (in vec2 uv,in float _time) {
    // Initial values
    float value = 0.5;
    float amplitude = 0.5;
    float frequency = 0.;
    vec2 shift = vec2(100);
    mat2 rot2 = mat2(cos(0.5), sin(0.5),
                    -sin(0.5), cos(0.50));
    // Loop of octaves
    for (int i = 0; i < 16; i++) {
        value += amplitude * noise(uv,_time);
        uv = rot2 * uv * 2.0 + shift;
        amplitude *= .5;
    }
    return value;
}

void main(void) {
 vec2 uv = vTexCoord;
	
 vec2 uv2 = uv;
 
 uv2-=vec2(0.5);
 uv2*=rotate2d(rdm(seed*6573.)*TWO_PI);
 uv2+=vec2(0.5);



 float e = fbm(vec2(uv.x*10.,uv.y*10.),seed*56462.);
	   e = fbm(vec2(uv.x*e*10.,uv.y*e*10.),seed*13575.)*.5+.5; 
   
 float e2 = fbm(vec2(uv.x*2000.,uv.y*2000.),seed*567.);
 float e3 = fbm(vec2(uv.x*2.,uv.y*2.),seed*567.);
 float e5 = fbm(vec2(uv2.x*rdm(seed*432.)*20.,uv2.y*rdm(seed*1000.))*20.,seed*41232.)*.5+.5; 
	e5 = 1.-sm(0.2,0.8,e5);
 e3 = sm(0.2,0.05,e3);
 
 
 float e4 = sin(uv.x*10.+e5)*.5+.5+sin(uv.y*10.)*.5+.5;
 
	   e4 = sm(0.2,0.9,e4);
 vec3 mugre = vec3(e*0.05);
	  mugre+= vec3(e2*0.05);
	  mugre+= vec3(e3*0.0025);
	  mugre+= vec3(e5*0.05);
	  //mugre+=tiza.g;
 
 vec3 c1 = vec3(0.1,
 mapr(rdm(seed+32.),0.145,0.35),
 0.1)
 +mugre*0.05+e2*0.05+e3*0.055;
 
 
 
 if(boardc > .5){
	c1 = vec3(0.0); 
 }
// c1 = vec3(0.0); 
 vec2 p = vec2(0.5) -uv;
 float r = length(p);
 
 
 vec2 luv = vec2(uv.x,1.-uv.y);
 vec2 luv2 = vec2(uv.x,1.-uv.y);
 vec2 tuv = vec2(uv.x,1.-uv.y); //uv de las tizas;
 
 float dp = mugre.r;
 luv.x+=dp*mapr(rdm(seed*4352.),-.09,.09);
 luv.y+=dp*mapr(rdm(seed*132.),-.09,.09);
 
 if(rdm(seed*654.) > .13){
	luv2.x+=dp*mapr(rdm(seed*432.),-.2,.2);
	luv2.y+=dp*mapr(rdm(seed*863.),-.2,.2);
 }else{
	luv2.x+=dp*mapr(rdm(seed*432.),-2.2,2.2);
	luv2.y+=dp*mapr(rdm(seed*863.),-2.2,2.2);
 }
 
	tuv+=dp*mapr(rdm(seed*234.),-.25,.25);
	tuv+=dp*mapr(rdm(seed*523.),-.25,.25);
 vec4 tiza = texture2D(tx4,tuv);
 
 vec4 letras=texture2D(tx,luv);
 vec4 gfondo = texture2D(tx3,luv2);//graficos fondo;
 vec3 lf = letras.rgb*clamp(fbm(vec2(uv.x*1000.,uv.y*1000.),seed*432.),0.0,1.0);


 vec4 letras2=texture2D(tx2,luv2);
 
 
 
 vec3 tizadib = vec3(tiza.g)*(vec3(tizar,tizag,tizab));
 
 
 vec3 scri = lf+letras2.rgb+gfondo.rgb*0.1+tizadib;
 
 vec3 dib = mix(c1,c1+mugre,1.-sm(0.3,0.8,r))+scri;
 
 
 vec3 limpio = mix(c1,c1+mugre,1.-sm(0.3,0.8,r));//PIZARRON LIMPIO;
 
 
 float smark = mapr(rdm(seed*748.),0.01,0.01);
 float dmark = mapr(rdm(seed*748.),0.002,0.008);
 float mark = sm(smark,smark+dmark,uv.x)*
			  sm(smark,smark+dmark,1.-uv.x)*
			  sm(smark,smark+dmark,1.-uv.y)*
			  sm(smark,smark+dmark,uv.y);
			  
 vec3 c1_madera = vec3(0.2,0.1,0.0);
 vec3 c2_madera = vec3(0.6,0.5,0.45);
 vec3 c3_madera = vec3(0.1,0.05,0.0);
 
 float me1 = fbm(vec2(uv.x*10.,uv.y*20.),rdm(seed*54.));
 float me2 = fbm(vec2(uv.x*15.,uv.y*15.),rdm(seed*41.));
 
 
	dib = mix(limpio,dib,tiza.r);
 vec3 madera = mix(c1_madera,c2_madera,me1);
  madera = mix(madera,c3_madera,me2);
	 vec3 dibf =mix(madera*(1.-vec3(mark)),dib,vec3(mark));
	  
	 
	// vec3 fin = mix(limpio,dibf,tiza.r);
	 //  fin =dib;
	 
	gl_FragColor = vec4(dibf, 1.0);
	
	
 
 
}