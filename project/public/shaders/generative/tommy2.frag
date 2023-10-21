precision mediump float;
//vec3 verdejpupper(){return vec3(0.0,1.0,0.8);}

// we need the sketch resolution to perform some calculations
uniform vec2 resolution ;
uniform float time ;
uniform vec2 mouse ;
uniform sampler2D feedback ;



varying vec2 vTexCoord ;

#define iTime time
#define iResolution resolution

#define PI 3.14159265359
#define TWO_PI 6.28318530718

#define OCTAVES 8
#define pi 3.14159265359




uniform float brillo1 ; 
uniform float brillo2 ; 

uniform float sx ;
uniform float sy ; 
uniform float sz ;

uniform float r1 ;
uniform float g1 ;
uniform float b1 ;

uniform float r2 ;
uniform float g2 ; 
uniform float b2 ;

uniform float radial2 ;



uniform float movspeed ;
float det = .008;
vec3 lightpos1, lightpos2;
float light1, light2;
//vec3 light1color = vec3(r1,g1,b1);
//vec3 light2color = vec3(r2,g2,b2);

float sm(float v1,float v2,float val){return smoothstep(v1,v2,val);}


mat2 scale2(vec2 _scale){
    mat2 e = mat2(_scale.x,0.0,
                0.0,_scale.y); 
    return e;
}

mat2 rotate2d2(float _angle){
    return mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle));
}


// Some useful functions
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }




float mapr(float _value,float _low2,float _high2) {
	float val = _low2 + (_high2 - _low2) * (_value - 0.) / (1.0 - 0.);
    //float val = 0.1;
	return val;
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

float bcir(vec2 uv,float s,float bs,float bd){
    //BS = BORDER SIZE
    //Only border
    float fx = resolution.x/resolution.y;
    vec2 p = vec2(0.5*fx,0.5) -uv;
    float r = length(p);
    float e = 1.0-smoothstep(s+bs,s+bs+bd,r);
    e-=1.0-smoothstep(s*0.9,s*1.0,r);
    return e;
}
mat2 rot(float a) 
{
    float s=sin(a), c=cos(a);
    return mat2(c,s,-s,c);
}

// copiar las coordenadas radialmente, cant = cantidad de veces, offset = distancia desde el centro (aquí definiría el radio del túnel)
void radialCopy(inout vec2 p, float cant, float offset) 
{
    float d = 3.1416 / cant * 2.;
    float at = atan(p.y, p.x);
    float a = mod(at, d) - d *.5;
    p = vec2(cos(a), sin(a)) * length(p) - vec2(offset,0.);
}

// distancia a una caja
float sdRoundBox( vec3 p, vec3 b, float r )
{
  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0) - r;
}
float sdEllipsoid( vec3 p, vec3 r )
{
  float k0 = length(p/r);
  float k1 = length(p/(r*r));
  return k0*(k0-1.0)/k1;
}
float sdCapsule( vec3 p, vec3 a, vec3 b, float r )
{
  vec3 pa = p - a, ba = b - a;
  float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
  return length( pa - ba*h ) - r;
}

// función path, devuelve una posición que define el "camino" que sigue el túnel y la cámara para una posición t
// t = time para la cámara, coordenada z para la obtención de distancia (ver más abajo)
vec3 path(float t) 
{
    vec3 p = vec3(sin(t * .1), cos(t * .2), t);
    p.xy += cos(t*.1) * 5.;
    return p;
}


// función de estimación de distancia
float de(vec3 p) 
{
    light1 = length(p - lightpos1) - .1;
    light2 = length(p - lightpos2) - .1;
    p.xy -= path(p.z).xy; // desplazar el tunel en xy según el camino que recorre la cámara y la posición en z (profundidad)
    vec3 p2 = p;
    // obtengo el id de cada aro del túnel antes de usar fract más abajo para repetir la coordenada z
    float id = floor(p2.z);
    p2.xy *= rot(sin(id + time*movspeed*.1)*5.); // roto en xy según sin de time + el id que genera el desfasaje
    radialCopy(p2.xy, 12.+sin(time*.1)*5., mapr(radial2,2.0,4.)); // copiar radialmente
    p2.z = fract(p2.z) - .5; // copiar en z
    //float ring1 = sdRoundBox(p2, vec3(0.01,.32,0.01), 0.2); // un sólo cálculo de la distancia a la caja genera todo el tunel
    
	//p2.z =;
	float ring1 = sdEllipsoid(p2, vec3(mapr(sx,0.5,2.0),mapr(sy,1.0,2.0),mapr(sz,0.1,.2))); // un sólo cálculo de la distancia a la caja genera todo el tunel
    
	float d = min(ring1, min(light1, light2)); // combinación del túnel con la distancia a las luces
    return d;
}

vec3 normal(vec3 p) 
{
    vec2 d = vec2(0., det);
    return normalize(vec3(de(p+d.yxx), de(p+d.xyx), de(p+d.xxy)) - de(p));
}

vec3 shade(vec3 p, vec3 dir)
{
	
	
	vec3 light1color = vec3(r1,g1,b1)*brillo1;
	vec3 light2color = vec3(r2,g2,b2)*brillo2;


    if (light1<det) return light1color;
    if (light2<det) return light2color;
    vec3 lightdir1 = normalize(lightpos1 - p);
    vec3 lightdir2 = normalize(lightpos2 - p);
    float fade1 = exp(-.2 * distance(p, lightpos1));
    float fade2 = exp(-.2 * distance(p, lightpos2));
    vec3 n = normal(p);
    vec3 dif1 = max(0., dot(lightdir1, n)) * light1color * fade1 * 1.7;
    vec3 dif2 = max(0., dot(lightdir2, n)) * light2color * fade2 * 1.7;
    vec3 ref1 = reflect(lightdir1, n);
    vec3 ref2 = reflect(lightdir2, n);
    vec3 spe1 = pow(max(0., dot(ref1, dir)),10.) * light1color * fade1;
    vec3 spe2 = pow(max(0., dot(ref2, dir)),10.) * light2color * fade2;
    return (dif1 + spe1 + dif2 + spe2)*1.4;
}


vec3 march(vec3 from, vec3 dir) 
{	

	vec3 light1color = vec3(r1,g1,b1);
	vec3 light2color = vec3(r2,g2,b2);
    float maxdist = 100.;
    float totdist = 0.;
    const int steps = 200;
    float d;
    vec3 p;
    vec3 col = vec3(0.);
    float glow1 = .5, glow2 = .5;
    for (int i=0; i<steps; i++)
    {
        p = from + totdist * dir;
        d = de(p);
        if (d < det || totdist > maxdist) break;
        totdist += d;
        glow1 = max(glow1, 1. - light1);
        glow2 = max(glow2, 1. - light2);
    }
    if (d < det) 
    {
        col = shade(p, dir);
    }
    col += pow(glow1, 5.) * light1color;
    col += pow(glow2, 5.) * light2color;
    return col;
}

// devuelve un mat3 para alinear un vector con el vector dir, especificando la dirección que se tomaría como "arriba"
mat3 lookat(vec3 dir, vec3 up) 
{
    dir = normalize(dir);
    vec3 rt = normalize(cross(dir, up));
    return mat3(rt, cross(rt, dir), dir);
}


void main(void)
{
    vec2 uv = (gl_FragCoord.xy - resolution / 2.) / resolution.y;
    float t = time * 1.*movspeed; 
    vec3 from = path(t); // posición de la camara según t
    vec3 adv = path(t + 1.); // posición de la cámara en t + 1 (un poco después), para obtener vector donde apunta
    vec3 look = normalize(adv - from); // vector hacia donde mira la cámara
    vec3 dir = normalize(vec3(uv, 1.)); // obtencion de la dir del rayo
    dir = lookat(look, vec3(0., 1., 0.)) * dir; // alineación de la dir con el vector hacia donde apunta la cámara
    // las luces siguen también el camino, aunque se le agregan otros movimiento
    lightpos1 = path(t + 5. * (1. + sin(time*movspeed / 2.)*.5)) + vec3(sin(time*movspeed) * 0.5, 0.0, -4.); 
    lightpos2 = path(t + 15.) + vec3(-sin(time*movspeed) * 1., 0., -4.);
     vec3 col = march(from, dir);
    gl_FragColor = vec4(col, 1.);
}

