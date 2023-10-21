precision mediump float;
//vec3 verdejpupper(){return vec3(0.0,1.0,0.8);}




varying vec2 vTexCoord ;
// we need the sketch resolution to perform some calculations
uniform vec2 resolution ;
uniform float time ;
uniform sampler2D tx ;
uniform sampler2D feedback ;
uniform vec2 mouse ;

#define iTime time
#define iResolution resolution



// standart UVALUE sc = 0.2;

uniform float sc ;
uniform float limit ;
uniform float force ;
uniform float mmof ;


float mapr(float _value,float _low2,float _high2) {
	float val = _low2 + (_high2 - _low2) * (_value - 0.) / (1.0 - 0.);
    //float val = 0.1;
	return val;
}
mat2 scale(vec2 _scale){
    return mat2(_scale.x,0.0,
                0.0,_scale.y);
}
mat2 rotate2d(float _angle){
    return mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle));
}

void main()
{
	vec2 uv = gl_FragCoord.xy / resolution;
	uv = vTexCoord;
	uv.y = 1.-uv.y;
	vec4 t = texture2D(tx,uv);
	
	vec2 puv = uv;
	puv-=vec2(0.5);
	puv*=scale(vec2(0.97));
	puv+=vec2(0.5);

	vec4 fb = texture2D(feedback,puv);
	
	float limit = 0.7;
	vec3 fin =  vec3(0);
	fin = mix(t.rgb,vec3(0.0),sin(t.rgb*10.+time)*.5+.5);
	
	fin+=fb.rgb*.27;
	
    gl_FragColor = vec4(fin,1.0);


}