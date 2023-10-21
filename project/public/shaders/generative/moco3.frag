precision mediump float;
//vec3 verdejpupper(){return vec3(0.0,1.0,0.8);}

// we need the sketch resolution to perform some calculations
uniform vec2 resolution ;
uniform float time ;
uniform vec2 mouse ;
uniform int mousePressed ;


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
uniform float lerpglitch ;
uniform sampler2D tx ;

float mapr(float _value,float _low2,float _high2) {
	float val = _low2 + (_high2 - _low2) * (_value - 0.) / (1.0 - 0.);
    //float val = 0.1;
	return val;
}
mat2 scale(vec2 _scale){    
    mat2 e = mat2(_scale.x,0.0,
                0.0,_scale.y); 
    return e;
}
float desf(vec2 uv,float fas){
	
	float fix = resolution.x/resolution.y;
	float e= 0.0;
	
	
	int mcnt = int(floor(mapr(cnt,2.0,10.0)));
	int mcnt2 = int(floor(mapr(cnt,3.0,10.0)));
	
/*	float maprsc1 = mapr(rsc1,0.0,30.);
	float maprsc2 = mapr(rsc2,0.0,30.);
	float maprsc3 = mapr(rsc3,0.0,30.);
	float masc_freq = floor(mapr(asc_freq,0.0,10.0));
	float masc_amp = mapr(asc_amp,0.0,10.0);
	*/
	
	
	float maprsc1 = mapr(rsc1,0.0,15.);
	float maprsc2 = mapr(rsc2,0.0,15.);
	float maprsc3 = mapr(rsc3,0.0,5.);
	float masc_freq = floor(mapr(asc_freq,0.0,10.0));
	float masc_amp = mapr(asc_amp,0.0,5.0);
	
	
	const int cnt2 = 10;
	for(int i=0; i<cnt2; i++){	
		
		float fase = float(i)*pi*2./float(mcnt);
		float posx = sin(fase)*amp;
		float posy = cos(fase)*amp;
		vec2 p2 = vec2(0.5*fix+posx,0.5+posy) - uv;
		float r2 = length(p2);
		float a2= atan(p2.x,p2.y);
		e+= sin(r2*maprsc1+time*.25+fas+sin(r2*maprsc2+sin(r2*maprsc3))+sin(a2*masc_freq)*masc_amp);
		e+= sin(e*mapr(detalle_freq,0.0,2.))*mapr(detalle_amp,0.0,0.0);

		if(i > mcnt2){
			break;
		}
	}
	
	e/=float(mcnt);
	return e;
}
vec3 hacerDibujo(){

	vec2 uv = vTexCoord;

	float fix = resolution.x/resolution.y;
	uv.x*=fix;
	vec2 p = vec2(0.5*fix,0.5)-uv;
	float r = length(p);
	float a = atan(p.x,p.y);



	
	vec3 dib = vec3(0.0);

	vec3 c1 = vec3(c1_r,c1_g,c1_b);
	vec3 c2 = vec3(c2_r,c2_g,c2_b);

	float dr = desf(uv,mapr(faser,-pi,pi));
	float dg = desf(uv,mapr(faseg,-pi,pi));
	float db = desf(uv,mapr(faseb,-pi,pi));

	float df = smoothstep(dr,dg,db);

	dib =mix(c1,c2,df);


	float negro = smoothstep(0.00,0.88,sin(desf(uv,mapr(faseb,-pi,pi))*4.-time));
	dib*= 0.95*negro;

	return dib;
}
void main()
{	
	//vec2 uv = gl_FragCoord.xy / resolution;
	vec2 uv = vTexCoord;
	float fix = resolution.x/resolution.y;
	//uv.x*=fix;
	uv.y*=1.0;
	
	vec3 dib =  hacerDibujo();
	vec3 fin = dib;
	
	float prom = (dib.r+dib.g+dib.b)/3.;
	vec2 uv_tx = vec2(vTexCoord.x,1.-vTexCoord.y);

	vec2 p2_uv = vTexCoord;
	p2_uv.x*=fix;
	vec2 p2 = vec2(mouse.x*fix,1.-mouse.y)-p2_uv;
	float r2 = length(p2);
	float a2 = atan(p2.x,p2.y);

	float mr = smoothstep(0.1,0.9,r2);
	
	
	if(mousePressed == 1){
		mr = smoothstep(0.1,0.9,sin(mr*10.+time)*2.);
	}else{
	//	dib+=touchesDraw2(uv,0.03 ,0.0)*.1;
	
	}

	uv_tx-=vec2(0.5-prom*.001);
	uv_tx*=	scale(vec2(1.0+prom*.05+mr*.1));
	uv_tx+=vec2(0.5+prom*.001);
	


	vec4 c = texture2D(tx,uv_tx);

	vec2 p = vec2(0.5*fix,0.5)-uv;
	float r = length(p);
	float a = atan(p.x,p.y);
	float rc = 1.-smoothstep(0.2,0.9,r);
	fin.rgb = c.rgb;

	//fin.rgb = mix(dib,c.rgb+dib*.01,1.-dib*(1.-rc));
	
	fin.rgb = mix(dib,c.rgb+dib*0.01,1.-smoothstep(0.99,0.998,dib));
	fin.rgb = mix(fin.rgb,dib,vec3(0.1));


	vec3 fin3 = mix(fin.rgb,dib,vec3(0.1));
	vec3 fin2 = mix(fin.rgb,sin(dib*10000.+time)*smoothstep(0.1,0.9,r2),vec3(0.5)); 

	fin = mix(fin3,fin2,lerpglitch);
	
	/*if(mousePressed == 1){
		fin.rgb = mix(fin.rgb,sin(dib*10000.+time)*smoothstep(0.1,0.9,r2),vec3(0.5));
	}else{
	//	dib+=touchesDraw2(uv,0.03 ,0.0)*.1;
	}*/ 


	/*if(prom > distance(dib,fin.rgb)){
		fin.rgb = mix(fin.rgb,vec3(prom),vec3(0.0));
	}*/

	gl_FragColor = vec4(fin,1.0); 
}
