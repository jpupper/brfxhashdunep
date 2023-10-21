varying vec2 vUv;
uniform vec2 resolution;//The width and height of our screen
uniform sampler2D feedback;//Our input texture
uniform sampler2D videoTexture;
uniform float time;
uniform vec2 mouse;
uniform int isMobile;
uniform int touchesCount;
uniform int mousePressed;

const int maxtouches = 5;
uniform vec2 touchesPos[5] ; 



mat2 scale(vec2 _scale);
mat2 rotate2d(float _angle);
float atan2(float x,float y);
float random (in vec2 _st);
float cir(vec2 uv,vec2 p, float s, float d);
float noise (in vec2 st,float fase);
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
float snoise(vec2 v);

#define PI 3.14159265359
#define TWO_PI 6.28318530718

const vec4 cHashA4 = vec4 (0., 1., 57., 58.);
const vec3 cHashA3 = vec3 (1., 57., 113.);
const float cHashM = 43758.54;


vec3 fm(vec3 v,vec3 d, vec3 l){
    if(v.r > l.r){v.r-=l.r;}
    if(v.g > l.g){v.g-=l.g;}
    if(v.b > l.b){v.b-=l.b;}
    return v;
}
vec4 Hashv4f (float p)
{
  return fract (sin (p + cHashA4) * cHashM);
}

float Noisefv2 (vec2 p)
{
  vec2 i = floor (p+time*0.3);
  vec2 f = fract (p);
  f = f * f * (3. - 2. * f);
  vec4 t = Hashv4f (dot (i, cHashA3.xy));
  return mix (mix (t.x, t.y, f.x), mix (t.z, t.w, f.x), f.y);
}

float Fbm2 (vec2 p)
{
  float s = 0.;
  float a = 1.;
  for (int i = 0; i < 6; i ++) {
    s += a * Noisefv2 (p);
    a *= 0.5;
    p *= 2.;
  }
  return s;
}

float tCur;

vec2 VortF (vec2 q, vec2 c)
{
  vec2 d = q - c;
  return 0.25 * vec2 (d.y, - d.x) / (dot (d, d) + 0.05);
}

vec2 FlowField (vec2 q)
{
  vec2 vr, c;
  float dir = 1.;
  c = vec2 (mod (tCur, 10.) - 20., 0.6 * dir);
  vr = vec2 (0.);
  for (int k = 0; k < 30; k ++) {
    vr += dir * VortF (4. * q, c);
    c = vec2 (c.x + 1., - c.y);
    dir = - dir;
  }
  return vr;
}
mat2 scale(vec2 _scale){
	return mat2(_scale.x,0.0,0.0,_scale.y);
}
mat2 rotate2d(float _angle){
	return mat2(cos(_angle),-sin(_angle),sin(_angle),cos(_angle));
}
vec3 lm(vec3 col, vec3 mx, vec3 dec){
		if(col.r > mx.r){col.r -=dec.r;}
		if(col.g > mx.g){col.g -=dec.g;}
		if(col.b > mx.b){col.b -=dec.b;}
		return col;
}


vec3 touchesDraw(vec2 uv , float dif, float siz){
	vec3 dib = vec3(0.0);
	float fx = resolution.x/resolution.y;
	for(int i=0; i<maxtouches; i++){
		if(i == touchesCount){
			break;
		}
		vec2 tp = vec2(touchesPos[i].x*fx,1.-touchesPos[i].y);
		vec2 p2 = tp-uv;
		float r2 = length(p2);
		
		float e2 = 1.-smoothstep(siz,siz+dif,r2);
		
		dib+=e2;		
	}
	return dib;
}

vec3 mouseDraw(vec2 uv , float dif, float siz){
	 float fx = resolution.x/resolution.y;
	vec3 dib = vec3(0.0);
	vec2 mp = vec2(mouse.x*fx,mouse.y) ;
	vec2 p = mp-uv;
	float r = length(p);
	float e = 1.-smoothstep(siz,siz+dif,r);
	
	dib+=vec3(e);
	
	return dib;
	
}


void main(void)
{

	vec2 uv = gl_FragCoord.xy / resolution;
	vec2 puv = uv;
    float fx = resolution.x/resolution.y;
    uv.x*=fx;
    
	vec3 dib = vec3(0.0,0.0,0.0); 
    vec2 uv2 = uv;
  
    vec2 mp = vec2(mouse.x*fx,mouse.y) ;
	if(touchesCount > 0){
		mp = vec2(touchesPos[0].x*fx,1.-touchesPos[0].y);
	}
	
	
	vec2 p = mp-uv;
	float r = length(p);
	float siz =0.00;
	float dif= 0.1;
	
	
		if(touchesCount == 0){
			if(mousePressed == 1){
				dib+=mouseDraw(uv,0.1,0.0);
			}
		}else{
			dib+=touchesDraw(uv,0.05,0.0);	
		}
	
	
    vec2 v1 = vec2(mouse.x,mouse.y);
    
	
	if(touchesCount > 0){
		v1 = vec2(touchesPos[0].x,touchesPos[0].y);
	}
	
    vec4 prev2 = texture2D(feedback,puv);
    
    float pprom = (prev2.r+prev2.g+prev2.b)/3.;

    puv-=v1;
    puv*=rotate2d(pprom*.001);
    puv+= v1;
    
    puv-=v1;
    puv.x*=.99+sin(pprom*9.)*0.01;
    puv.y*=.99+sin(pprom*9.)*0.01;
    puv*=scale(vec2(.9995,.9995));
    puv+= v1;
 

  
	vec4 prev = texture2D(feedback,puv);

	vec3 fin = dib*0.3 + prev.rgb*1.97;

	vec3 dec = vec3(0.79,.59,.79);
	vec3 limit = vec3(.5,.5,.5);
	vec3 limit2 = vec3(0.1,0.1,0.1);
	vec3 limit3 = vec3(0.85,0.87,0.8);
	vec3 col = vec3(sin(time)*.2+.8,
                  cos(time)*.2+.8,
                  cos(time*2.)*.2+.8);  
  
    
	vec2 p5_1 = vec2(0.5*fx,.5) - uv;
	float r5 = length(p5_1);
	
	dib += 1.0-smoothstep(0.0,0.0,r5);
	
	
	dib = dib*col;
    fin = dib *.2+prev.rgb*1.001;
 
          
    
    vec3 col2 = vec3(1.-smoothstep(0.1,0.9,r)
                    ,1.-smoothstep(0.1,0.9,r)
                    ,1.-smoothstep(0.1,0.9,r));
       
    
  	 fin = lm(fin,dec,limit3)*1.002;
    
	
	float distR = 0.0;
	
	
	if(touchesCount == 0){
		if(mousePressed == 1){
			distR+=mouseDraw(uv,0.6,0.0).r*.5;
		}
	}else{
		distR+=touchesDraw(uv,0.4,0.0).r*.5;	
	}
	
	
	fin-= vec3(distR)*.01 ;
	
	
	
	gl_FragColor = vec4(fin, 1.0);
}







