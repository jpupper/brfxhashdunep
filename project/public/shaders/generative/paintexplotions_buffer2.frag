precision mediump float;
//vec3 verdejpupper(){return vec3(0.0,1.0,0.8);}

// we need the sketch resolution to perform some calculations
uniform vec2 resolution ;
uniform float time ;
uniform vec2 mouse ;
uniform sampler2D feedback ;
uniform sampler2D tx ;

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



#define A 6

float hash1(float i)
{
   return fract(sin(i*.156854) * 43758.5453);
}

float hash2(vec2 p)
{
   return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

vec2 randCoord(float i) {
    return vec2(hash1(i),hash1(i+12.54682));
}

float arrivingParticle(vec2 coord, out vec4 partData) {
	partData = vec4(0);
    float c=0.;
    for (int i=-A; i<A; i++) {
        for (int j=-A; j<A; j++) {
            vec2 arrCoord = coord + vec2(i,j);
            vec4 data = texture2D(feedback, arrCoord/iResolution.xy);
            if (dot(data,data)<.1) continue;
            vec2 nextCoord = data.xy + data.zw;
            vec2 offset = abs(coord - nextCoord);
			// somehow I got this fluid-like effect changing the 
            // "greedly pick one particle" algorithm 
            // for an average of arriving particles and 
            // changing the condition below 
            if (length(offset)<1.7) { 
                partData += data;
				c++;
            }
        }
    }
    partData/=c;
    return c;
}
#define samples 30.
#define glow_size 0.07 
#define glow_brightness 4.

float hash(vec2 p)
{
   return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main(void)
{
    float c=0.;
    vec2 uv=gl_FragCoord.xy/iResolution.xy;
    float mt=mod(iTime,5.);


    for (float i=0.; i<samples; i++) {
        float t=i*.354185+mt;
        float a=hash(uv+t)*6.28;
        float l=hash(uv+t+13.3548)*glow_size;
        vec2 smp = vec2(cos(a),sin(a))*l;
      	c+=step(.1,texture2D(tx, uv+smp).x)*(glow_size-l*.9)/glow_size; 
    }

    vec4 part = texture2D(tx, uv);
    vec3 uvcol=vec3(normalize(abs(uv+.1)),1.);
    vec3 col=(c/samples)*uvcol*glow_brightness+step(.1,part.x)*uvcol;
	col*=vec3(.8,.6,.15);
	col*=1.-abs(uv.x-.5)*2.;


    vec4 pp = texture2D(tx,uv);
    gl_FragColor = vec4(pp.rgb*1.4,1.);
}