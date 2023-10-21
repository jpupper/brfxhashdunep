precision mediump float;
//vec3 verdejpupper(){return vec3(0.0,1.0,0.8);}

// we need the sketch resolution to perform some calculations
uniform vec2 resolution ;
uniform float time ;
uniform vec2 mouse ;
uniform sampler2D feedback ;


varying vec2 vTexCoord ;
uniform float startRandom ;

#define fx resolution.x/resolution.y
#define h1 (rdm(startRandom))
#define h2 (rdm(startRandom+2.))

float rdm(float p){
    p*=1234.5678;
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



void main(void) {
	vec2 uv = gl_FragCoord.xy / resolution.xy;
         uv = vTexCoord.xy;
 vec3 dib = vec3(0.);
 uv.x*=fx;
 const int cnt =7;
 vec3 c1 = vec3(rdm(h1+4.),rdm(h1+20483.),rdm(h1+2232.));
 vec3 c2 = vec3(rdm(h1+6.),rdm(h1+209.),rdm(h1+302.));
 float rf = floor(rdm(h1+284.)*2.);

 
 for (int i =0; i  <cnt; i++){

 	float idx = float(i)/float(cnt);
 	vec2 uv2= fract(uv *(float(i)+1.));
 //	uv2*=fx;
 	vec2 p = vec2(.5,.5) -uv2;
 	float r = length(p);
 	float a = atan(p.x,p.y);
 	vec3 c3 = mix(c1,c2,idx);
 	float rc = rdm(h1+43.5+float(i))*25.+4.;
    float drc = rdm(h1+24319.+float(i)*5234.)+10.;
    
    float dramp = rdm(h1+3213.+float(i)*4231.)*30.;
    float pns = floor(rdm(h1+12402.)*5.+5.);
    float mof = sin(a*pns)*.01;
    vec3 dib2  = sin((r+mof)*rc*2.+time+sin(dib*drc)*dramp)*c3;
 

     float s1 = rdm(h1+321.+float(i)*231.);
      float s2 = rdm(h1+2351.+float(i)*421.);
    dib2 = smoothstep(s1,1.-s1,dib2);
    dib = mix(dib,dib2,vec3(1.0)-dib);
 //	dib+= sin(dib*100.)*.1;
 //	dib =mix(dib,sin(dib*20.),0.1);
 	//dib+= smoothstep(0.9,0.99,dib);
 }



 if((dib.r+dib.g+dib.b)/3. > 0.99997){
     dib = vec3(.0);
 }

 vec3 fin = dib;


	gl_FragColor = vec4(fin, 1.0);
}