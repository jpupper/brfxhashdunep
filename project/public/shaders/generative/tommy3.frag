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


uniform float sonido1 ; 
uniform float sonido2 ;
uniform float sonido3 ; 
uniform float sonido4 ;
uniform float sonido5 ;
uniform float sonido6 ;


uniform float sr ;

uniform float sr2 ;

float rdm(float p){
    p*=1234.56;
    p = fract(p * .1031);
    p *= p + 33.33;
    return fract(2.*p*p);
}

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

const float maxdist=10.;
const float det=.005;
const vec3 dirlight = vec3(0.0,-50.,2.);
float obj_id;


float sphere(vec3 p, float radio) {
  return length(p)-radio;
}

float rsphere(vec3 p,float r,float sonido){
	
	float mx = 50.6;
	float msound = mapr(sonido,-10.1,mx);
	float def = length(sin(p*2.)*msound)*.012;
	
		  def = abs(length(sin(p*4.+time+sin(p*5.-time)*.5+.5)*2.-1.)*msound)*.0042;
		  
		 // def = sonido;
	return sphere(p,r+def);
}

float opSmoothUnion( float d1, float d2, float k ) {
    float h = clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );
    return mix( d2, d1, h ) - k*h*(1.0-h); }

float de(vec3 p) {
  vec3 psph=p;
  vec3 psph2 = p;
  vec3 psph3 = p;
  vec3 psph4 = p;
  vec3 psph5 = p;
  vec3 psph6 = p;
  
  psph.y+=1.;
  psph2.x-=4.0;
  psph3.x+=4.0;
  
  psph2.y+=1.1;
  
  psph3.y+=1.1;
   psph2.z-=sin(time)*0.8-1.0;
    psph3.z-=sin(time)*0.8-1.0;
  psph4.z+=2.5;
  psph4.y-=.5;
  psph4.x-=1.5;
  
  psph5.x+=1.5;
  psph5.y-=.5;
  psph5.z+=2.5;
  psph6.z+=4.0;
  psph6.y-=.8;
  
  //psph.xz*=rotate2d2(time);
  
 /* psph.xz*=rotate2d2(time);
  psph2.xz*=rotate2d2(time+pi);
  psph3.xz*=rotate2d2(-time);
  psph4.xz*=rotate2d2(time+pi);
  psph5.xz*=rotate2d2(-time);
  psph6.xz*=rotate2d2(time+pi);*/
  //psph+=vec3(1.5,0.5,0.);
  float mx = 0.5;
  float sph =rsphere(psph,1.0 ,sonido1);
  float sph2=rsphere(psph2,.5,sonido2);
  float sph3=rsphere(psph3,.5,sonido3);
  float sph4=rsphere(psph4,.25,sonido4);
  float sph5=rsphere(psph5,.25,sonido5);
  float sph6=rsphere(psph6,0.0,0.0);
  
  /*float sph =rsphere(psph,1.0 ,sonido1);
  float sph2=rsphere(psph2,0.0,0.0);
  float sph3=rsphere(psph3,0.0,0.0);
  float sph4=rsphere(psph4,0.0,0.0);
  float sph5=rsphere(psph5,0.0,0.0);
  float sph6=rsphere(psph6,0.0,0.0);*/
  
  float pla=-p.y+1.-length(cos(p*4.-time*.1)+sin(p*2.-time*.1))*.15;
  float d=min(sph,pla); 
		d=min(d,sph2); 
		d=min(d,sph3);   
		d=min(d,sph4);  
		d=min(d,sph5); 
		d=min(d,sph6);
		
  
		/*d = opSmoothUnion(sph,pla,0.0);
		d = opSmoothUnion(sph2,pla,0.0);
		d = opSmoothUnion(sph3,pla,0.0);
		d = opSmoothUnion(sph4,pla,0.0);
		d = opSmoothUnion(sph5,pla,0.0);
		d = opSmoothUnion(sph6,pla,0.0);*/
		
  obj_id=step(sph,d)+
		 step(pla,d)*2.+
		 step(sph2,d)*3.+
		 step(sph3,d)*4.+
		 step(sph4,d)*5.+
		 step(sph5,d)*6.+
		 step(sph6,d)*7.;
		 
  return d*.8;
}

float ao(vec3 p, vec3 n) {
  float st=.5, oc=0., totdist=0.;
  for (float i=1.; i<7.; i++) {
    totdist=i*st;
    float d=de(p-totdist*n);
    oc+=max(0.,(totdist-d)/totdist);
  }
  return clamp(1.-oc*.13,0.,1.);
}

float shadow(vec3 p) {
  vec3 ldir=normalize(dirlight);
  float totdist=0., sh=1.;
  for(int i=0;i<30;i++) {
    p+=totdist*ldir;
    float d=de(p);
    totdist+=d;
    sh=min(sh,3.*d/totdist);
  }
  return clamp(sh,0.3,1.);
}

vec3 normal(vec3 p) {
  vec3 e = vec3(0.,det*2.,0.);
  return normalize(vec3(de(p-e.yxx),de(p-e.xyx),de(p-e.xxy))-de(p));
}

float is_id(float id) {
  return 1.-step(.1,abs(id-obj_id));
}


vec3 color() {
  vec3 col=vec3(0.);
  
  
  vec3 c1 = vec3(rdm(sr*104.),rdm(sr*432.),rdm(sr*1452.));
	   //c1 = vec3(rdm(sr2+104.),rdm(sr2+321.),rdm(sr2+421.));
  vec3 c2 = vec3(rdm(sr2+4123.),rdm(sr2+321.),rdm(sr2+4321.));
  
  vec3 c3 =vec3(mapr(rdm(sr2+123.),0.8,1.),rdm(sr2+4321.),rdm(sr2+2314.));
  vec3 c4 =vec3(rdm(sr2+123.),rdm(sr2+4321.),rdm(sr2+2314.));
  
  
  col+=vec3(1.0,1.0,1.0)*is_id(1.);
  col+=vec3(0.0,.1,.1)*is_id(2.);
  col+=vec3(0.0,1.0,.0)*is_id(3.);
  col+=vec3(1.0,.0,0.0)*is_id(4.);
  col+=vec3(1.0,1.0,0.0)*is_id(5.);
  col+=vec3(0.0,.1,1.0)*is_id(6.);
  
  
  
  return col;
}

vec3 light(vec3 p, vec3 dir, vec3 n, vec3 col) {
  vec3 ldir=normalize(dirlight);
  float sh=shadow(p)*1.1;
  float ao=ao(p,n);
  float amb=.4*ao;
  float diff=max(0.,dot(ldir,-n))*.7*sh;
  vec3 ref=reflect(dir,-n);
  float spec=pow(max(0.,dot(ldir,ref)),50.)*.7*sh;
  return col*(amb+diff)+spec+0.1;
}

vec3 march(vec3 from, vec3 dir) {
  vec3 p, col=vec3(0.), backcol=vec3(0.);
  float totdist=0.,d;
  for (int i=0; i<80; i++) {
    p=from+dir*totdist;
    d=de(p);
    totdist+=d;
    if (d<det || totdist>maxdist) {
      break;
    }
  }
  if (d<.1) {
    p-=det*dir*2.;
    vec3 obj_col=color();
    vec3 n=normal(p);
    col=light(p,dir,n,obj_col);
  } else {
    totdist=maxdist;
    p=from+dir*maxdist;
  }
  backcol=vec3(.0,.0,0.)*(1.-.7*smoothstep(0.,10.,-p.y-.5));
  float depth = 1.-(maxdist-totdist)/maxdist;
  col=mix(col,backcol,pow(depth,4.5));
  return col;
}

mat3 lookat(vec3 dir,vec3 up){
    dir=normalize(dir);vec3 rt=normalize(cross(dir,normalize(up)));
    return mat3(rt,cross(rt,dir),dir);
}

void main()
{
  vec2 uv = vTexCoord;
  uv.y = 1.-uv.y;
  uv -= .5;
  uv.x*=resolution.x/resolution.y;
 
 
  vec3 dir = normalize(vec3(uv,1.));
  vec3 from = vec3(0.,0.,-7.);
  
  vec3 target = vec3(0.0,0.0,0.);
  
  
  dir=lookat(target-from,vec3(0.,1.,-0.))*dir;
  vec3 col=march(from, dir);
  gl_FragColor = vec4(col,1.);
}