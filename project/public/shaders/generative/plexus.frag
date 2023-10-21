precision mediump float;
//vec3 verdejpupper(){return vec3(0.0,1.0,0.8);}

// we need the sketch resolution to perform some calculations
uniform vec2 resolution ;
uniform float time ;
uniform vec2 mouse ;
uniform sampler2D feedback ;


#define iTime time
#define iResolution resolution
#define PI 3.14159265359
#define pi PI
#define TWO_PI PI*2.0
#define OCTAVES 8

uniform float r1 ;
uniform float g1 ;
uniform float b1 ;
uniform float r2 ;
uniform float g2 ; 
uniform float b2 ; 


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

mat2 rot2d(float _angle){
    return mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle));
}
float distLine(vec2 p, vec2 a, vec2 b) {
	vec2 ap = p - a;
    vec2 ab = b - a;
    float aDotB = clamp(dot(ap, ab) / dot(ab, ab), 0.0, 1.0);
    return length(ap - ab * aDotB);
}

float drawLine(vec2 uv, vec2 a, vec2 b) {
    float line = smoothstep(0.014, 0.01, distLine(uv, a, b));
    float dist = length(b-a);
    return line * (smoothstep(1.3, 0.8, dist) * 0.5 + smoothstep(0.04, 0.03, abs(dist - 0.75)));
}

float n21(vec2 i) {
    i += fract(i * vec2(223.64, 823.12));
    i += dot(i, i + 23.14);
    return fract(i.x * i.y);
}

vec2 n22(vec2 i) {
    float x = n21(i);
    return vec2(x, n21(i+x));
}

vec2 getPoint (vec2 id, vec2 offset) {
	return offset + sin(n22(id + offset) * iTime * 1.0*speed) * 0.4;
}

float layer (vec2 uv) {
    float m = 0.0;
    float t = iTime * 2.0;
   
    vec2 gv = fract(uv) - 0.5;
    vec2 id = floor(uv) - 0.5;
    
    vec2 p[9];
    int i = 0;
    for (float y = -1.0; y <= 1.0; y++) {
        for (float x = -1.0; x <= 1.0; x++) {
        	p[i++] = getPoint(id, vec2(x,y));
        }
    }
    
    for (int i = 0; i < 9; i++) {
    	m += drawLine(gv, p[4], p[i]);
        float sparkle = 1.0 / pow(length(gv - p[i]), 1.5) * 0.005;
        m += sparkle * (sin(t + fract(p[i].x) * 12.23) * 0.4 + 0.6);
    }
    
    m += drawLine(gv, p[1], p[3]);
    m += drawLine(gv, p[1], p[5]);
    m += drawLine(gv, p[7], p[3]);
    m += drawLine(gv, p[7], p[5]);
     
    return m;
}


vec2 de(vec3 p) {
    float i=0.;

    mat2 rotyz = rot2D(mapr(mouse.y,80.,-80.));

    p.yz*=rotyz;
    vec3 p2_2 = p;
    
   // mat2 rotyz = rotate2d(mouse.y*0.005);


    p.z+=time;
    vec3 prot = p;
 
 
    float r = length(p);
    r= superficie(vec3(p)*5.0*v3);
    
    vec3 p2 = p;
    p2.y+=sin(time+sin(p.x*v1*20.0));
    float esf = esfera(tile(p2,mapr(v2,1.2,3.0)), 1.5+r);
    float tor = toro(tile(p,2.0), vec2(2.0,.5)); 
    esf = min(esf,tor);
    float d = 0.;
    d = min(esf,esf);
    if (abs(esf-d)<.001) i=1.;

    p2_2.z+=15.;
	
	
	//p2_2.z+=2.;
	float esf2 = esfera(p2_2, 1.7);

    
	d = max(-esf2,d);
//    d = min(esf2,d);

    dist_tor=abs(tor-d);
    return vec2(d*.5,i);
}

vec3 normal(vec3 p) {
    vec3 e = vec3(0.0,det,0.0);
    
    return normalize(vec3(
            de(p+e.yxx).x-de(p-e.yxx).x,
            de(p+e.xyx).x-de(p-e.xyx).x,
            de(p+e.xxy).x-de(p-e.xxy).x
            )
        );  
}                  

float shadow(vec3 pos) {
  float sh = 1.0;
  float totdist = 2.*det;
  float d = 10.;
  for (int i = 0; i < 50; i++) {
    if (d > det) {
      vec3 p = pos - totdist * luzdir;
      d = de(p).x;
      sh = min(sh, 50. * d / totdist);
      totdist += d;
    }
  }
  return clamp(sh, 0.0, 1.0);
  
}

vec3 light(vec3 p, vec3 dir, vec3 col) {
    vec3 n=normal(p);
    float sh=shadow(p);
    float luzdif=max(0.,dot(normalize(luzdir),-n))*sh;
    float luzcam=max(0.,dot(dir,-n));
    vec3 refl=reflect(dir,-n);
    float luzspec=pow(max(0.,dot(refl,-luzdir)),1.9)*sh;
    return col*(luzcam*.5+luzdif+.05)+luzspec*.2;
    
}

vec3 shade(vec3 p, vec3 dir, float i) {
    vec3 col=vec3(0.);
    col += vec3(1.1,sin(dir.z*10.+time)*0.5+0.5,dir.z) * (1.-step(.001,abs(i-1.)) );
    col += color_anillo * (1.-step(.001,abs(i-2.)));
    col += color_cubos * (1.-step(.001,abs(i-3.)));
    col = light(p, dir, col);
    return col;
    
}
vec3 march(vec3 from, vec3 dir) {
    vec3 col=vec3(0.);
    float totdist=0.;
    float st=0.;
    float glow=0.;
    vec2 d;
    vec3 p;
    
    for (int i=0; i<100; i++) {
        p=from+totdist*dir;
        d=de(p);
        if (d.x<det || totdist>maxdist) break;
        totdist+=d.x;
        glow+=max(0.,.5-dist_tor)/.5;
        st++;
    }
    if (d.x<det) {
        col=shade(p-det*dir,dir,d.y);
    }
    col +=pow(glow/100.,2.)*5.*(.5+vec3(1.0,0.3,0.0));
    return col;
}
void main()
{
	  vec2 uv = gl_FragCoord.xy/resolution.xy;
    uv-=.5;
    vec3 dir = normalize(vec3(uv,0.5));
    vec3 from = vec3(0.,0.,0.5);
    mat2 rotxz = rot2D(mapr(mouse.x,-50.0,50.0));
    mat2 rotyz = rot2D(TWO_PI);
 //   mat2 rotyz2 = rot2D(mouse.y*0.005);
    
    
    from.xz*=rotxz;
    dir.xz*=rotxz;
    from.xy*=rotyz;
    dir.xy*=rotyz;
    
  
    //dir.x+=time*0.1;
    //from.x-=time*0.1;
    gl_FragColor = vec4(march(from,dir),1.0);
}
