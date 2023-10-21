precision mediump float ;

uniform vec2 resolution ;
uniform float time ;
uniform vec2 mouse ;

uniform sampler2D tx ;
varying vec2 vTexCoord;

const float max_rad=.05;
const float it=80.;

uniform float force ;

#define iTime time;

#define iChannel0 tx;

mat2 rot(float a){
	float s=sin(a);
    float c=cos(a);
    return mat2(c,s,-s,c);
}

float hash(vec2 p)
{
    p*=1342.;
	vec3 p3  = fract(vec3(p.xyx) * .1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}



 
float mapr(float _value,float _low2,float _high2) {
	float val = _low2 + (_high2 - _low2) * (_value - 0.) / (1.0 - 0.);
    //float val = 0.1;
	return val;
}
void main(){
	
	vec2 uv = gl_FragCoord.xy / resolution;
	     uv.y = 1.-uv.y;
    vec2 uv2=floor(uv*10.)/50.;
	mat2 spin=rot(2.39996);
    vec2 p=vec2(0.,1.);
    vec3 res=vec3(0.);
    float rad_step=max_rad/it+hash(uv+time)*.001;
	float rad=0.;
    float ti=mod(time,10.);
    float vhs=step(.92,hash(uv.yy+ti))*(1.+sin(uv.y*5.+ti))*step(.5,hash(uv.xy+ti))*smoothstep(0.,1.,uv.y);
    //vec4 col=texture2D(tx,uv+.05*step(.98,hash(uv2.yy+floor(time*10.)))*step(.5,hash(uv2.xx+time))*.7);
    //uv.y+=vhs*.3;
    vec4 col=texture2D(tx,uv);
    for (float i=0.;i<it; i++) {
        rad+=rad_step;
        p*=spin;
        vec4 col=texture2D(tx,uv+p*rad);
        res+=smoothstep(.0,1.,col.rgb)*5.;
    };
    res/=it;
    //uv=floor(uv*200.)/200.;
    //col+=vhs*.3;
    //
    //col+=hash(uv+time)*.05;



    vec3 cp = mix(col.rgb,col.rgb-sin(res*10.+time),fract(res*100.));
    vec3 dw = mix(cp,res*.2,0.8);
	vec3 fin = col.rgb+res;
	
	gl_FragColor = vec4(fin,1.0);//*mod(gl_FragCoord.y,2.)*.87; 
	
    //gl_FragColor = vec4(col.rgb,1.);
}