precision mediump float;
//vec3 verdejpupper(){return vec3(0.0,1.0,0.8);}

// we need the sketch resolution to perform some calculations
uniform vec2 resolution ;
uniform float time ;
uniform vec2 mouse ;

#define iTime time
#define iResolution resolution
float PI = 3.14159265359;

#define pi PI
#define OCTAVES 8

varying vec2 vTexCoord ;




uniform float c1_r ;
uniform float c1_g ;
uniform float c1_b ;

uniform float c2_r ;
uniform float c2_g ;
uniform float c2_b ;

uniform float cnt ;
uniform float amp ;
uniform float rsc1 ;
uniform float rsc2 ;
uniform float rsc3 ;
uniform float asc_freq ;
uniform float asc_amp ;
uniform float detalle_amp ;
uniform float detalle_freq ;

uniform float faser ;
uniform float faseg ;
uniform float faseb ;



float mapr(float _value,float _low2,float _high2) {
	float val = _low2 + (_high2 - _low2) * (_value - 0.) / (1.0 - 0.);
    //float val = 0.1;
	return val;
}

mat2 rotate2d(float _angle){
    return mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle));
}



void main()
{	
	vec2 uv = gl_FragCoord.xy / resolution;
		 uv = vTexCoord;
	
	gl_FragColor = vec4(uv.x,uv.y,.0,1.0); 
}
