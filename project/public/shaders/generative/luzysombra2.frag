precision mediump float;
//vec3 verdejposypper(){return vec3(0.0,1.0,0.8);}

// we need the sketch resolution to perform some calculations
uniform vec2 resolution ;
uniform float time ;
uniform vec2 mouse ;
uniform int mousePressed ;
uniform sampler2D feedback ;
uniform float startRandom ;

uniform float r1 ; 
uniform float g1 ; 
uniform float b1 ; 
 
uniform float r2 ; 
uniform float g2 ; 
uniform float b2 ;

uniform float lerpm ;
uniform float seed ;
uniform float frc ;
uniform float shapes ;
uniform float shapemof ;
uniform float posz ;
uniform float posx ;
uniform float posy ;
uniform float roteje ;

varying vec2 vTexCoord ;

#define iTime time
#define iResolution resolution

#define PI 3.14159265359
#define TWO_PI 6.28318530718

#define OCTAVES 8
#define pi 3.14159265359

#define fx resolution.x/resolution.y
#define h1 (rnd(startRandom))
#define h2 (rnd(startRandom+2.))


// Some useful functions
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float random (in vec2 _st) {
    return fract(sin(dot(floor(_st.xy),
                         vec2(12.9898,78.233)))*
        43000.31);
}
vec2 random2( vec2 p ) {
    return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
}
float snoise(vec2 v) {

    // Precomposyte values for skewed triangular grid
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


    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;

    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0+h*h);

    // Composyte final noise value at P
    vec3 g = vec3(0.0);
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * vec2(x1.x,x2.x) + h.yz * vec2(x1.y,x2.y);
    return 130.0 * dot(m, g);
}


mat2 scale(vec2 _scale){
    return mat2(_scale.x,0.0,
                0.0,_scale.y);
}
mat2 rotate2d(float _angle){
    return mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle));
}
float mapr(float _value,float _low2,float _high2) {
	float val = _low2 + (_high2 - _low2) * (_value - 0.) / (1.0 - 0.);
    //float val = 0.1;
	return val;
}
float ridge(float h, float offset) {
    h = abs(h);     // create creases
    h = offset - h; // invert so creases are at top
    h = h * h;      // sharpen creases
    return h;
}

#define OCTAVES 8
float ridgedMF(vec2 p) {
    float lacunarity = 2.0;
    float gain = 0.5;
    float offset = 0.9;

    float sum = 0.0;
    float freq = 1.0, amp = 0.5;
    float prev = 1.0;
    for(int i=0; i < OCTAVES; i++) {
        float n = ridge(snoise(p*freq+seed*20.), offset);
        sum += n*amp;
        sum += n*amp*prev;  // scale by previous octave
        prev = n;
        freq *= lacunarity;
        amp *= gain;
    }
    return sum;
}
float ridge2(float h, float offset) {
    h = abs(h);     // create creases
    h = offset - h; // invert so creases are at top
    h = h * h;      // sharpen creases
    return h;
}
float snoise2(vec2 v) {

    // Precomposyte values for skewed triangular grid
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

 
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;

    // Normalise gradients implicitly by scaling m
    // Approximation of: m *= inversesqrt(a0*a0 + h*h);
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0+h*h) +seed*5001.;

    // Composyte final noise value at P
    vec3 g = vec3(0.0);
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * vec2(x1.x,x2.x) + h.yz * vec2(x1.y,x2.y);
    return 130.0 * dot(m, g);
}
float ridgedMF2(vec2 p) {
    float lacunarity = 2.0;
    float gain = 0.5;
    float offset = 0.9;

    float sum = 0.0;
    float freq = 1.0, amp = 0.5;
    float prev = 1.0;
    for(int i=0; i < OCTAVES; i++) {
        float n = ridge2(snoise2(p*freq+seed*4551565.), offset);
        sum += n*amp;
        sum += n*amp*prev;  // scale by previous octave
        prev = n;
        freq *= lacunarity;
        amp *= gain;
    }
    return sum;
}
// VARIABLES GLOBALES
float det = .0004; // umbral para detectar choque 
vec3 lightpos1, lightpos2,lightpos3; // posicion de las luces
float light1, light2,light3; // distancia a las luces
vec3 light1color = vec3(r1,g1,b1); // color luz 1
vec3 light2color = vec3(2.,2.,2.); // color luz 2
vec3 light3color = vec3(0.,0.2,.0); // color luz 2
#define pi 3.14159265359
// matriz de rotación
mat2 rot(float a) 
{
    float s=sin(a), c=cos(a);
    return mat2(c,s,-s,c);
}
float opSmoothUnion( float d1, float d2, float k ) {
    float h = clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );
    return mix( d2, d1, h ) - k*h*(1.0-h); }

float opSmoothSubtraction( float d1, float d2, float k ) {
    float h = clamp( 0.5 - 0.5*(d2+d1)/k, 0.0, 1.0 );
    return mix( d2, -d1, h ) + k*h*(1.0-h); }

float opSmoothIntersection( float d1, float d2, float k ) {
    float h = clamp( 0.5 - 0.5*(d2-d1)/k, 0.0, 1.0 );
    return mix( d2, d1, h ) + k*h*(1.0-h); }
// distancia a un octaedro
float sdOctahedron( vec3 p, float s){
  p = abs(p);
  return (p.x+p.y+p.z-s)*0.57735027;
}

float sdTorus( vec3 p, vec2 t ){
  vec2 q = vec2(length(p.xz)-t.x,p.y);
  return length(q)-t.y;
}

float sdSphere( vec3 p, float s )
{
  return length(p)-s;
}

float sdDeathStar( in vec3 p2, in float ra, float rb, in float d )
{
  // sampling independent composytations (only depend on shape)
  float a = (ra*ra - rb*rb + d*d)/(2.0*d);
  float b = sqrt(max(ra*ra-a*a,0.0));
	
  // sampling dependant composytations
  vec2 p = vec2( p2.x, length(p2.yz) );
  if( p.x*b-p.y*a > d*max(b-p.y,0.0) )
    return length(p-vec2(a,b));
  else
    return max( (length(p          )-ra),
               -(length(p-vec2(d,0))-rb));
}

float sdCapsule( vec3 p, vec3 a, vec3 b, float r )
{
  vec3 pa = p - a, ba = b - a;
  float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
  return length( pa - ba*h ) - r;
}

float sdBoxFrame( vec3 p, vec3 b, float e )
{
       p = abs(p  )-b;
  vec3 q = abs(p+e)-e;
  return min(min(
      length(max(vec3(p.x,q.y,q.z),0.0))+min(max(p.x,max(q.y,q.z)),0.0),
      length(max(vec3(q.x,p.y,q.z),0.0))+min(max(q.x,max(p.y,q.z)),0.0)),
      length(max(vec3(q.x,q.y,p.z),0.0))+min(max(q.x,max(q.y,p.z)),0.0));
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

float sdRoundBox( vec3 p, vec3 b, float r )
{
  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0) - r;
}

float sdFalopeitor( vec3 p, vec3 scale )
{   
    vec3 p2 = p;
 
    float ms = floor(4.)+1.;
    float idx = abs(floor(p2.x/ms)*2.-1.);
    float idz = abs(floor(p2.z/ms)*2.-1.);

    float s = scale.x;

    p2.x = mod(p2.x, ms) - ms/2.;
    p2.z = mod(p2.z, ms) - ms/2.;
    p2.y = mod(p2.y, ms) - ms/2.;
   float s1 = sdRoundBox(p2,vec3(0.5,0.5,sin(idx*10.+time)*0.1+2000000000000.1),0.01);
    
   return s1;
}


// función de distancia (distance estimation)
float de(vec3 p) {

    light1 = length(p - lightpos1) - .1; // distancia a las luces, que están definidas como esferas de radio .1
    light2 = length(p - lightpos2) - .1; // 
    
    vec3 p2 = p;
     //p2 = p;
    p.xz*=rotate2d(roteje);
    p+=vec3(posx,posy,posz);
    
   

    //p2.xz*=rotate2d(roteje);
    //p2 =vec3(posx,posy,posz);

    float oct = max(sdOctahedron(p, 5.), -length(p)+0.3); // distancia a octaedro restando una esfera
    float ms = floor(mapr(frc,4.0,8.))+1.;
    float id2 = abs(floor(p.x/ms)*2.-1.);
    
  
    p.x = mod(p.x, ms) - ms/2.;
    p.z = mod(p.z, ms) - ms/2.;
    p.y = mod(p.y, ms) - ms/2.;

  //  p.xy *= rot(time*.1+id2);
    oct = sdTorus(p,vec2(1.+sin(p.z*1.+time*1.+sin(id2*30.+time)*10.)*.3,0.1));   
    float idx2 = sin(id2*10.);
    
    oct = sdFalopeitor(p,vec3(mapr(shapemof,0.8,1.5)+sin(id2*100.+time)*0.3));
    
     if(shapes < .33){
        oct = sdSphere(p,mapr(shapemof,0.8,1.5)+sin(id2*100.+time)*0.3);
    }else if(shapes < .66){
        oct = sdOctahedron(p,mapr(shapemof,1.5,3.0));
    }else{
        oct = sdBoxFrame(p,vec3(1.0),mapr(shapemof,0.1,0.4));
    }

    
  
    
    float d = min(oct, min(light1, light2)); // obtención de distancia mínima (combinar objetos)
    //p2 = p;
    p2.z+=20.5;
/*
    p2.z+=posz;
    p2.x+=posx;
    p2.y+=posy;*/
 //   vec3 p3 = p2;

    //p3.x+=sin(time)*10.-posx;
    //p3.z-=50.;


    float spd = 15.8;
    float d2 = max(d,1.-sdSphere(p2,spd)); //Por que mierda no lo corta ? ni idea. 
          //d2 = min(d,sdSphere(p2,15.9));

    return d2;
}


// función normal (vector perpendicular a la superficie)
vec3 normal(vec3 p) 
{
    vec2 d = vec2(0., det);
    return normalize(vec3(de(p+d.yxx), de(p+d.xyx), de(p+d.xxy)) - de(p));
}

// función shade (p = posynto en el que golpeó el rayo, dir = dirección del rayo)
vec3 shade(vec3 p, vec3 dir)
{  
   float l1 = length(p);
    
   light1color = vec3(1.0,sin(l1*5.+time*.1),1.0);
   light2color = vec3(0.0,0.0,0.0);
    
   vec3 c1 = vec3(r1,g1,b1);
   vec3 c2 = vec3(r2,g2,b2);
    
   float rsc1 = 1.2;
   float rsc2 = 0.8;
   float e = ridgedMF(vec2(p.x*0.5,p.y*0.5)
			  *ridgedMF(vec2(p.x,
			                 p.y))-p.xz);


    light1color = mix(c1,c2,sin(l1*2.+time*0.1));
    
    if (light1 < det) return light1color; // si golpeó a una luz, devolver el color de la misma
    if (light2 < det) return light2color; // sin aplicar obviamente el cálculo de su propia iluminación
    
    vec3 lightdir1 = normalize(lightpos1 - p); // obtención de la dirección hacia donde están las luces
    vec3 lightdir2 = normalize(lightpos2 - p); // desde el posynto p
    vec3 lightdir3 = normalize(lightpos3 - p); // desde el posynto p
     
    
    float fade1 = exp(-.2 * distance(p, lightpos1))*3.; // atenuación de la luz basada en la distancia entre p
    float fade2 = exp(-.2 * distance(p, lightpos2)); // y la posición de las mismas
    
    vec3 n = normal(p); // obtención de la normal
    
    
    float amb = .01; // luz ambiental
   //  amb = 0.2; // luz ambiental
    vec3 dif1 = max(0., dot(lightdir1, n)) * light1color * fade1 * .7; // luces difusas, se aplica el color de la luz
    vec3 dif2 = max(0., dot(lightdir2, n)) * light2color * fade2 * .7; // y la atenuación según la distancia
    vec3 ref1 = reflect(lightdir1, n); // vector reflejo entre la dirección de la luz y
    vec3 ref2 = reflect(lightdir2, n); // el normal de la superficie
    
    vec3 spe1 = pow(max(0., dot(ref1, dir)),10.) * light1color * fade1; // calculo de luz especular, también 
    vec3 spe2 = pow(max(0., dot(ref2, dir)),10.) * light2color * fade2; // teniendo en cuenta la atenuación por distancia
    
    return amb + dif1 + spe1  ; // color final combinando las luces
}

// función de raymarching
vec3 march(vec3 from, vec3 dir) 
{
    float maxdist = 50.;
    float totdist = 0.;
    const float steps = 100.;
    float d;
    vec3 p;
    vec3 col = vec3(0.);
    float glow1 = 0., glow2 = 0.,glow3 = 0.; // variables para la obtención del brillo "glow" alrededor de las luces
    float glowgeneral = 0.; // variable para la obtención de glow general con "step count"
    for (float i=0.; i<steps; i++)
    {
        p = from + totdist * dir;
        d = de(p);
        if (d < det || totdist > maxdist) break;
        totdist += d;
        glow1 = max(glow1, 1. - light1); // capturamos cuando el rayo pasa cerca de las luces, obteniendo un valor
        glow2 = max(glow2, 1. - light2); // entre 0 y 1 según la distancia a la que pasó
      
        glowgeneral++; // step counting para obtener brillo glow general
    }
    
    if (d < det){
        col = shade(p, dir);
    }
    col += pow(glow1, 5.) * light1color; // sumamos el brillo glow de las luces, elevando a un exponente
    //col += pow(glow2, 5.) * light2color; // para definir el tamaño del glow
    //col += glowgeneral * glowgeneral * .00001; // lo mismo para el glow general que se posyede apreciar en el objeto
    //este glow genera "banding", sobre todo si no está exponenciado
    return col;
}


void main(void)
{
    vec2 uv = (gl_FragCoord.xy - resolution / 2.) / resolution.y;
		uv = vTexCoord*1.-.5;
		uv.x*=resolution.x/resolution.y;
    vec3 from = vec3(0.+posx, 0.+posy, -25.+posz);
         from = vec3(0.+posx, 0.+posy, -25.+posz);
	     from = vec3(0., 0., -25.);
	//from.z = posz;
	
    vec3 dir = normalize(vec3(uv, 1.0));
	
	

    //lightpos1 = vec3(sin(time) * 8., sin(time * 0.), cos(time) * 4.); // definimos la posición de las luces
	
	
	vec3 p1 = vec3(sin(time) * 8.+posx, sin(time * 0.)+posy, cos(time) * 4.+posz); // Animacion standart
	vec3 p2 = vec3(mapr(mouse.x,-12.,12.)+posx,mapr(mouse.y,8.,-8.)+posy, cos(time) * 4.+posz); //Control mouse
	

    
    vec3 auxf = from;
    vec3 auxd = dir;


   // from.z-=25.;
    /*from.xz*=rotate2d(roteje);
    //from.z+=25.;

    dir.xz*=rotate2d(roteje); 
	p1.xz*=rotate2d(roteje);
	p2.xz*=rotate2d(roteje);*/

	lightpos1 = mix(p1,p2,lerpm);
	
    vec3 col = march(from, dir);
    gl_FragColor = vec4(col, 1.);
}