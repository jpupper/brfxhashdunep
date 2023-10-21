precision mediump float;
//vec3 verdejpupper(){return vec3(0.0,1.0,0.8);}
//ooopSbENqviwDc2oroWmBujpZE3Z4FKfGScn4fR7gezYLT6qVFx


uniform vec2 resolution ;
uniform float time ;
uniform vec2 mouse ;
uniform int mousePressed ;
uniform sampler2D feedback ;
uniform float startRandom ;
varying vec2 vTexCoord;

#define iTime time
#define iResolution resolution
#define PI  3.14159265359 
#define TWO_PI  3.14159265359 * 2. 
#define OCTAVES 8


// we need the sketch resolution to perform some calculations
uniform float cant ;
uniform float poly1_puntas ;
uniform float poly1_size ;
uniform float poly1_diffuse ;
uniform float poly1_angle ;
uniform float poly2_puntas ;
uniform float polys_speed ;
uniform float poly2_angle ;
uniform float anglemulti ;


 float fasex = 0.5;
 float fasey = 0.5;
 float noisex = 0.5;
 float noisey = 0.5;


vec2 scale(vec2 uv, float s);

float random (in vec2 _st);
float sm(float v1,float v2,float val){return smoothstep(v1,v2,val);}
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
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
float poly(vec2 uv,vec2 p, float s, float dif,int N,float a){

    // Remap the space to -1. to 1.

    vec2 st = p - uv ;


    // Angle and radius from the current pixel
    float a2 = atan(st.x,st.y)+a;
    //float r = float(TWO_PI)/float(N);
   float r = float(TWO_PI)/float(N);

    float d = cos(floor(.5+a2/r)*r-a2)*length(st);
    float e = 1.0 - smoothstep(s,dif,d);

    return e;
}



void main(void){   
    vec2 uv = gl_FragCoord.xy / resolution;
    uv = vTexCoord.xy;

    float fix = resolution.x/resolution.y;
    uv.x*=fix;

    vec2 p = vec2(0.5*fix,0.5) - uv;
    float r = length(p);
    float a = atan(p.x,p.y);
    
    float cantidad = floor(mapr(cant,1.0,20.0));//Defino la cantidad de iteraciones que tendra mi for

  

    float puntas1 = floor(mapr(poly1_puntas,4.0,15.0));
	float puntas2 = floor(mapr(poly2_puntas,4.0,15.0));
	
	if(mod(float(cantidad),2.) == 0.){
		cantidad++;
	}
	float mappoly1_size = mapr(poly1_size,0.08,0.2);
	float mappoly1_diffuse = mapr(poly1_diffuse,0.00,0.2);
	
    


	float angle1 = mapr(poly1_angle,0.0,PI*2.);
	float angle2 = mapr(poly2_angle,0.0,PI*2.);
	
	
	float speed1 = mapr(polys_speed,0.5,1.0);
	
	if(polys_speed > 0.49 && polys_speed < 0.51){
		speed1 = 0.0;
	}

	vec3 fin = vec3(0.0);//Defino un vec3 en el que ire sumando los circulos.
    
    vec2 uv2 = uv;

    const int cnt = 100;
    for(int i =0; i< cnt; i++){
        
        float index = float(i)*PI*2.0/float(cantidad); 
        index*=anglemulti;
        uv2-=vec2(0.5*fix,0.5);
        uv2 = scale(vec2(0.9))*uv2;
        uv2+=vec2(0.5*fix,0.5);
    
        vec3 col1 = vec3(1.0,0.0,0.0);
        vec3 col2 = vec3(0.0,0.0,1.0);

        vec3 colf = mix(col1,col2,(float(i)+1.)/float(cantidad));
        if(mod(float(i),2.) == 0.0){
            fin+= poly(uv2,
			vec2(0.5*fix,0.5),
			mappoly1_size,
			mappoly1_size+mappoly1_diffuse,
			int(puntas1),
			angle1+speed1*time*.4+index); 
        }else{
			fin-= poly(uv2,
			vec2(0.5*fix,0.5),
			mappoly1_size,
			mappoly1_size+mappoly1_diffuse,
			int(puntas2),
			angle2-speed1*time+index); 
          //  fin-= poly(uv2,vec2(0.5*fix,0.5),mappoly2_size,mappoly2_diffuse,puntas2,0.0); 
        }
        if(float(i) > cantidad){
            break;
        }
    }
    gl_FragColor = vec4(fin,1.0);  
}
