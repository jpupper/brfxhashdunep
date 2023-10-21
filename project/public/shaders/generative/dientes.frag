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


 float v1 = 0.19;
 float v2 = 0.32;
 float v3 = 0.34;






/*****************************************************************************************/
float maxdist=10.;
float det=.005;
vec3 luzdir = vec3(1.,.5,0.);
vec3 color_esfera = vec3(.8,.6,.2);
vec3 color_anillo = vec3(0.3,.2,1.);
vec3 color_cubos = vec3(0.3,0.7,0.3);
float dist_tor=0.;

float mapr(float _value,float _low2,float _high2) {
	float val = _low2 + (_high2 - _low2) * (_value - 0.) / (1.0 - 0.);
    //float val = 0.1;
	return val;
}
mat2 rot2D(float a) {
    a=radians(a);
    return mat2(cos(a),sin(a),-sin(a),cos(a));    
}

mat3 lookat(vec3 fw,vec3 up){
    fw=normalize(fw);vec3 rt=normalize(cross(fw,normalize(up)));return mat3(rt,cross(rt,fw),fw);
}

float cubo( vec3 p, vec3 b )
{
  return length(max(vec3(0.),abs(p)-b));
}  

float toro( vec3 p, vec2 t )
{
  vec2 q = vec2(length(p.xz)-t.x,p.y);
  return length(q)-t.y;
}

float esfera(vec3 p, float r) {
    return length(p) - r;
}

vec3 tile(vec3 p, float t) {
    return abs(t - mod(p, t*2.));
}

float superficie(vec3 p) {
    float sx=sin(p.x*20.+sin(p.y*10.+time*10.));
    float sz=sin(p.z*10.);
    
    p.y+=max(sx,sz)*.1;
    float c=cos(p.y+time);
    return c*.2;
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
