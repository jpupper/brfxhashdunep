precision mediump float;
//vec3 verdejpupper(){return vec3(0.0,1.0,0.8);}

// we need the sketch resolution to perform some calculations
uniform vec2 resolution ;
uniform float time ;
uniform vec2 mouse ;
uniform sampler2D feedback ;

varying vec2 vTexCoord ;

#define iTime time
#define iResolution resolution

#define PI 3.14159265359
#define TWO_PI 6.28318530718

#define OCTAVES 8
#define pi 3.14159265359

#define A 6



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



float hash1(float i){return fract(sin(i*.156854) * 43758.5453);}
float hash2(vec2 p){return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);}

vec2 randCoord(float i) {
    return vec2(hash1(i),hash1(i+12.54682));
}

float arrivingParticle(vec2 coord, out vec4 partData) {
	partData = vec4(0);
    float c=0.;
    for (int i=-A; i<A; i++) {
        for (int j=-A; j<A; j++) {
            vec2 arrCoord = coord + vec2(i,j);
            vec4 data = texture2D(feedback, vec2(arrCoord.x/iResolution.x,1.-arrCoord.y/iResolution.y));
            //data*=100.;
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

void main(void)
{   
    vec2 uv = vTexCoord.xy;

    vec2 fc = floor(vTexCoord.xy*resolution);
   // vec2 uv = gl_FragCoord.xy/resolution.xy;
	//uv.x*=resolution.x/resolution.y;
	
   // vec2 uv = gl_FragCoord/resolution.xy;
    float t=iTime*3.;
    vec2 co = uv-randCoord(floor(t))*vec2(1.,.6);
    if (fract(t)<.3 && length(co)<.05) {
        gl_FragColor = vec4(fc, 4.*normalize(co)*(1.-hash2(uv)*.5)+vec2(0.,3.));
		return;
    }
    if (fc.y<30.+sin(uv.x*5.+t)*10.) {
        gl_FragColor = vec4(fc,0,0);
		return;
    }

    vec4 partData;
    float p = arrivingParticle(fc, partData); 
 //   vec4 fb = texture2D(feedback,uv);
    if (p<1.) {
    	gl_FragColor = vec4(0.);
        //float e = sin(uv.x*100.+time*20.);
        //gl_FragColor = vec4(vec3(e)+fb.rgb,1.0);
      //gl_FragColor = vec4(uv.x,uv.y,0.0,1.0);
        return;
    }
    partData.xy+=partData.zw;
    partData.zw*=.99;
    partData.zw-=vec2(0.,.05);
    if (partData.y<30.) partData.w*=-1.;
    partData.w=max(-4.,partData.w);


  //    vec4 fb = texture2D(feedback, vec2(arrCoord.x/iResolution.x,1.-arrCoord.y/iResolution.y));
    gl_FragColor = partData;
 


   //  gl_FragColor = vec4(uv.x,uv.y,0.0,1.0);
}
