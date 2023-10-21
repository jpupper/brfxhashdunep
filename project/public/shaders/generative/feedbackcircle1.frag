precision mediump float;
//vec3 verdejpupper(){return vec3(0.0,1.0,0.8);}

// we need the sketch resolution to perform some calculations
uniform vec2 resolution ;
uniform float time ;
uniform vec2 mouse ;
uniform sampler2D feedback ;
uniform float startRandom ;
varying vec2 vTexCoord ;

#define iTime time
#define iResolution resolution

#define PI 3.14159265359
#define TWO_PI 6.28318530718

#define OCTAVES 8
#define pi 3.14159265359




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

#define fx resolution.x/resolution.y
#define h1 (rnd(startRandom))
#define h2 (rnd(startRandom+2.))

float rnd(float p){
    p*=1234.5678;
    p = fract(p * .1031);
    p *= p + 33.33;
    return fract(2.*p*p);
}


vec3 s1(vec2 uv, float rd){

	 vec2 uv2 = uv;
  //uv.x+= time;

  float ff = mapr(rnd(rd),10.,30.);
  uv= fract(uv*ff+time);
  uv.x*=fx;
  uv2.x*=fx;

    

  vec2 p = vec2(0.5*fx,.5) -uv;
  float r =length(p);


  
  float e =1.- smoothstep(sin(r*20.+time)*.1+.1,sin(r*20.+time)*.3+.3,r);
        e*=sin(r*4.+time*.5)*.5+.5;


  vec2 pos2 = vec2(mapr(rnd(h1+482.),0.4,0.6),
                   mapr(rnd(h1+5423.),0.4,0.6));
  vec2 p2 = vec2(.5*fx,.5) -uv2;
  float r2 =length(p2);


  float mins = mapr(rnd(rd+2023.),0.,0.3);
  float maxs = mapr(rnd(rd+3212.),0.5,0.9);

  float e2 =1.- smoothstep(mins,maxs,r2);

  vec3 c = vec3(rnd(rd+1.),rnd(rd+8.),rnd(rd+3.));
  
  vec3 c2 = vec3(rnd(rd+20.),rnd(rd+80.),rnd(rd+54.));

  vec3 c3 = mix(c,c2,sin(r*10.+time));
  vec3 dib =vec3(e2*e)*c;
	return dib;
}

vec2 scale(vec2 uv, float s);

mat2 scale(vec2 _scale);
mat2 rotate2d(float _angle); 


float t = 0.0;



void main(void)
{   
    
    vec2 uv = vTexCoord;
	//uv.x*=resolution.x/resolution.y;

    
   
    const int cnt = 4;
    vec3 dib = vec3(0.0);
    for(int i =0; i<cnt; i++){
        vec2 uv2 = uv;
        float idx = float(i);
        float rd = rnd(float(i)*100.+h1);
        vec2 mov = vec2(
            mapr(rnd(idx+20.+h1),-.48,.48),
            mapr(rnd(idx+10.+h1),-.48,.48));
    	uv2+=mov;
        dib+=s1(uv2,rd);
    }
    // dib =s1(uv,h1);
    vec2 puv = vec2(uv.x,1.-uv.y) ;


    float pr = length(dib);
    puv-= vec2(.5);
    puv*=scale(vec2(.994+pr*.03));
    puv+= vec2(.5);

    puv-= vec2(.5);
    puv*=scale(vec2(.994+pr*.03));
    puv+= vec2(.5);

    vec4 fb = texture2D(feedback,puv);
    vec3 fin = dib + fb.rgb*.4;
    if(length(dib) <0.9){
        fin = fb.rgb*1.0;
        }else{

            fin = dib;
    }

	gl_FragColor = vec4(fin, 1.0);
}
