precision mediump float;
//vec3 verdejpupper(){return vec3(0.0,1.0,0.8);}

// we need the sketch resolution to perform some calculations
uniform vec2 resolution ;
uniform float time ;
uniform vec2 mouse ;


#define iTime time
#define iResolution resolution



uniform float fxrand ;

#define hash1 rnd(fxrand)
#define hash2 rnd(fxrand+.11)
#define hash3 rnd(fxrand+.22)
#define hash4 rnd(fxrand+.33)
#define hash5 rnd(fxrand+.44)
#define hash6 rnd(fxrand+.55)
#define hash7 rnd(fxrand+.66)
#define hash8 rnd(fxrand+.77)
#define hash9 1.//rnd(fxrand+.88)
#define hash10 rnd(fxrand+.99)

varying vec2 vTexCoord ;

float mapr(float _value,float _low2,float _high2) {
	float val = _low2 + (_high2 - _low2) * (_value - 0.) / (1.0 - 0.);
    //float val = 0.1;
	return val;
}

mat2 rot(float a)
{
    float s=sin(a);
    float c=cos(a);
    return mat2(c,s,-s,c);
}

float rnd(float p)
{
    p*=1234.5678;
    p = fract(p * .1031);
    p *= p + 33.33;
    return fract(2.*p*p);
}


float st=.025, maxdist=15.;
vec3 ldir=vec3(0.,-1.,-1.),col=vec3(0.),lightpos;

vec3 fractal(vec2 p) {
    vec2 pos=p;
    float d, ml=100.;
    vec2 mc=vec2(100.);
    p=abs(fract(p*.1)-.5);
    vec2 c=p;
    for(int i=0;i<6;i++) {
        p*=rot(1.6*hash1);
        d=dot(p,p);
        p=abs(p+.5)-abs(p-.5)-p;
    	p=p*-1.5/clamp(d,.5,1.)-c;
        mc=min(mc,abs(p));
        ml=min(ml,abs(p.y-.0));
    }
    mc=max(vec2(0.),1.-mc);
    mc=normalize(mc)*.8;
    ml=smoothstep(.2,.0,ml);
    vec3 cc = vec3(1.,.7,.5)*ml;
    //cc.xz*=rot(mc.x*10.);
//    cc=fract(pos.y*5.)*vec3(.5);
return cc;
}

float hash(vec2 p)
{
    p*=13.;
	vec3 p3  = fract(vec3(p.xyx) * .1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}



float noise( in vec2 p )
{
    vec2 i = floor( p );
    vec2 f = fract( p );
	
	vec2 u = f*f*(3.0-2.0*f);

    float no= mix( mix( hash( i + vec2(0.0,0.0) ), 
                     hash( i + vec2(1.0,0.0) ), u.x),
                mix( hash( i + vec2(0.0,1.0) ), 
                     hash( i + vec2(1.0,1.0) ), u.x), u.y);
    return pow(no,1.5);
}

float lit;

float map(vec2 p) {
    float f=4.;
    p*=rot(.5*iTime/max(.5,floor(f*length(p))/f));
    vec2 pos=p;
    p=vec2(atan(p.x,p.y)/3.1416*4.,length(p));
    //p.x-=p.y*.7;
    //p*=4.;
    vec2 z=fract(p*f)-.5;
    p=floor(p*f)/f;
    float h=0.;
    //h+=sin(p.x*3.);
    //h+=fract(p.y)*.5;
    h+=p.y*(1.+p.y)*.1;
    h+=hash(p)*1.5;
    h*=1.-smoothstep(.48,.53,max(abs(z.x),abs(z.y)));
    float r=1.;
    h=h*step(r+.1,p.y)+step(p.y,r);
	lit=step(.9,fract(p.x*.1+p.y-iTime*.0));
    lit=step(.93,hash(p));
    h*=min(1.,iTime*10.-p.y*5.-35.-p.x*10.*step(1.,p.y)+lit*0.);
    //h*=step(p.y,2.5);
    //h=max(-2.,h);
    col=hash(p+.5)*step(lit,.5)*vec3(1.);
    return h;
}

vec3 normal(vec2 p) {
	vec2 eps=vec2(0.,.001);
    return normalize(vec3(map(p+eps.yx)-map(p-eps.yx),2.*eps.y,map(p+eps.xy)-map(p-eps.xy)));
}

vec2 hit(vec3 p) {
    float h=map(p.xz);
    return vec2(step(p.y,h),h);
}

vec3 bsearch(vec3 from,vec3 dir,float td) {
    vec3 p;
    st*=-.5;
    td+=st;
    float h2=1.;
    for (int i=0;i<20;i++) {
        p=from+td*dir;
        float h=hit(p).x;
        if (abs(h-h2)>.001) {
            st*=-.5;
	        h2=h;
        }
        td+=st;
    }
	return p;
}

vec3 shade(vec3 p,vec3 dir,float h,float td) {
    ldir=normalize(p-lightpos);
	col=vec3(0.);
    vec3 n=normal(p.xz);
    n.y*=-1.;
    float dif=max(.2,dot(ldir,n));
    vec3 ref=reflect(ldir,n);
    float spe=pow(max(0.,dot(dir,-ref)),8.);
    vec3 pal=vec3(0.,.9,1.);
    vec3 lig=lit*vec3(3.,.5,0.)*.8;
    float ll=1.;
    if (hash9<.6) pal=vec3(1.,.5,.5),ll=.75;
    if (hash9<.3) pal=vec3(.5,1.,0.5),ll=.8;
    return max(dif*.8,-n.y*.3)*(col+lig*ll+pal)*.65;
}
float ddd;

vec3 march(vec3 from,vec3 dir) {
	vec3 p, col=vec3(0.);
    float td=1.+hash(dir.xy)*.3, k=0.,g=0.,d=0.;
    vec2 h;
    for (int i=0;i<150;i++) {
    	p=from+dir*td;
        float d=length(p)-4.;
        h=hit(p);
        float dd=abs(h.y-p.y);
        g=max(g,max(0.,.1-dd)/.1);
        if (h.x>.5||td>maxdist) break;
        td+=.07;
    }
    if (h.x>.9) {
        p=bsearch(from,dir,td);
    	col=shade(p,dir,h.y,td);
    } else {
    }
    float dl=distance(p.xz,lightpos.xz);
	col*=min(.8,exp(-.023*dl*dl));
    ddd=0.;
    return (col-g*.15);
}

mat3 lookat(vec3 dir,vec3 up) {
	dir=normalize(dir);vec3 rt=normalize(cross(dir,normalize(up)));
    return mat3(rt,cross(rt,dir),dir);
}

vec3 path(float t) {
	return vec3(cos(t)*5.5,1.5-cos(t)*.0,sin(t*2.))*2.5;
}

void main(void)
{   
    vec2 uv = (gl_FragCoord.xy-resolution.xy*.5)/resolution.y;
         //uv = vTexCoord;

   // vec2 uv = (fragCoord-iResolution.xy*.5)/iResolution.y;
	
    
    float t=time*.2;
    vec3 from=vec3(0.,6.,4.);
    lightpos=vec3(0.,6.,0.);
    vec3 dir=normalize(vec3(uv,.5));
    vec3 adv=path(t+.1)-from;
    //dir.yz*=rot(-.8);
    dir=lookat(-from+vec3(0.,1.,0.),vec3(0.,1.,0.))*dir;
    //dir.xz*=rot(hash1*3.);
    //dir=lookat(adv+vec3(0.,-.2-(1.+sin(t*2.)),0.),vec3(adv.x*.1,1.,0.))*dir;
    vec3 col=march(from, dir);
    //gl_FragColor = vec4(col,ddd)*step(abs(uv.x),1.5);//*mod(gl_FragCoord.y,4.)*.4;

    gl_FragColor = vec4(col,1.0)*step(abs(uv.x),1.5);//*mod(gl_FragCoord.y,4.)*.4;

	//gl_FragColor = vec4(uv.x,uv.y,.0,1.0);


   
}

