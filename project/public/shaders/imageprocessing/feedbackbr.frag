#ifdef GL_ES
precision mediump float;
#endif


uniform float time;

uniform vec2 u_resolution; // This is passed in as a uniform from the sketch.js file
varying vec2 vTexCoord ;
uniform sampler2D tx ;
uniform sampler2D feedback ;

uniform float r1;
uniform float g1;
uniform float b1;


uniform float r2;
uniform float g2;
uniform float b2;

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
float random (in vec2 _st) {
    return fract(sin(dot(floor(_st.xy),
                         vec2(12.9898,78.233)))*
        43000.31);
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

vec4 psTex(vec2 _sc){
  vec2 uv = vTexCoord;
  vec4 ps = texture2D(tx,vec2(uv.x,1.-uv.y));
  return ps;
}

float getPromTex(vec2 _sc){
  vec2 uv = vTexCoord;
  uv-=vec2(.5);
  uv*=scale(_sc);
  uv+=vec2(.5);
  vec4 ps = texture2D(tx,vec2(uv.x,1.-uv.y));
  float pspromp = (ps.r +ps.g +ps.b)/3.;
  return pspromp;
}


void main() {

  // position of the pixel divided by resolution, to get normalized positions on the canvas
  vec2 uv = gl_FragCoord.xy/u_resolution.xy; 
       uv = vTexCoord;


  vec3 c1 = vec3(r1,g1,b1);
  vec3 c2 = vec3(r2,g2,b2);

  vec2 uvfb = uv;

  float n = clamp(noise(uv*1000.,10000.0),0.0,1.0);
        n = random(uv*10000.);
  float defforce = 0.01;
  float def = mapr(getPromTex(vec2(0.8)),1.0-defforce,1.0+defforce);
        def = getPromTex(vec2(.5));
		def = 0.0;
  const int cnt = 4 ; 
  for (int i =0; i<cnt; i++){
	 float index = float(i) / float(cnt); 
	 def+= sin(getPromTex(vec2(index+5.))+time)*.5+.5;
  }
  def/=float(cnt);
	


  uvfb = fract(uvfb*2.);
     uvfb-=vec2(.5);
 // uvfb*=scale(vec2(.992+getPromTex(vec2(0.7))*0.02));
  //uvfb*=scale(vec2(.9));
  uvfb+=vec2(.5);
  //uvfb-=vec2(.5);
 // uvfb*=scale(vec2(.992+getPromTex(vec2(0.7))*0.02));
 // uvfb*=scale(vec2(.9992));
 // uvfb+=vec2(.5);

  //uvfb-=n*.001;
  vec4 fb2 = texture2D(feedback,vec2(uvfb.x,1.-uvfb.y));
  float fbprom = (fb2.r+fb2.g+fb2.b)/3.;

  vec2 uvp = uv;
  //uvp+=fbprom*0.01;
  vec4 ps = texture2D(tx,vec2(uvp.x,1.-uvp.y));
  float psprom = (ps.r+ps.g+ps.b)/3.;
  float a = ps.a;
  
  vec4 fin = ps+fb2;
       //fin = mix(fb2*.999,ps,ps);
       fin = mix(fb2*.2,ps-n*.16,ps*2.);
       //fin = ps-n*.1*a;
       // gl_FragColor = vec4(fin.rgb,a);

        vec3 cols = mix(c1,c2,sin(uv.x*10.+time)*.5+.5);


  vec2 uv3 = uv;
  float mapsize = 0.001;
  float mapdifuse = 0.05;
	float v = smoothstep(mapsize,mapsize+mapdifuse,uv3.x) *
				smoothstep(mapsize,mapsize+mapdifuse,1.-uv3.x) *
				smoothstep(mapsize,mapsize+mapdifuse,1.-uv3.y) *
				smoothstep(mapsize,mapsize+mapdifuse,uv3.y);
        //fin.rgb+= vec3(psprom)*cols*.1;
        gl_FragColor = vec4(fin*v);
        //gl_FragColor = vec4(def);
}