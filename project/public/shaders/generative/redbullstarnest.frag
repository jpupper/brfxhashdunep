precision mediump float;
//vec3 verdejpupper(){return vec3(0.0,1.0,0.8);}

// we need the sketch resolution to perform some calculations
uniform vec2 resolution ;
uniform vec2 mouse ;
uniform float time ;
uniform float lerpm ;
uniform int mousePressed ;
varying vec2 vTexCoord ;


#define iTime time
#define iResolution resolution
#define pi 3.14159265359

uniform float speedx ;
uniform float speedy ;
uniform float animationspeed1 ;
uniform float iterations ;
uniform float formuparam ;
uniform float volsteps ;
uniform float stepsize ;
uniform float zoom ;
uniform float tile ;
uniform float darkmatter ;
uniform float saturation ;
uniform float displacey ;
uniform float fbmsc ;
uniform float fbmseed ;
uniform float rxrsc ;
// Some useful functions
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float rdm(float p){
    p*=1234.56;
    p = fract(p * .1031);
    p *= p + 33.33;
    return fract(2.*p*p);
}
float mapr(float _value,float _low2,float _high2) {
	float val = _low2 + (_high2 - _low2) * (_value - 0.) / (1.0 - 0.);
    //float val = 0.1;
	return val;
}

float random (in vec2 _st) {
    return fract(sin(dot(_st.xy,
                         vec2(12.9898,78.233)))*
        43758.56222123);
}
float ridge(float h, float offset) {
    h = abs(h);     // create creases
    h = offset - h; // invert so creases are at top
    h = h * h;      // sharpen creases
    return h;
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

float noise (in vec2 _st) {
    vec2 i = floor(_st);
    vec2 f = fract(_st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}
float fbm2 (in vec2 uv) {
    // Initial values
    float value = 0.5;
    float amplitude = 0.5;
    float frequency = 0.;
    vec2 shift = vec2(100);
    mat2 rot2 = mat2(cos(0.5), sin(0.5),
                    -sin(0.5), cos(0.50));
    // Loop of octaves
    for (int i = 0; i < 16; i++) {
        value += amplitude * noise(uv,time);
        uv = rot2 * uv * 2.0 + shift;
        amplitude *= .5;
    }
    return value;
}
float fbm2 (in vec2 uv,in float _time) {
    // Initial values
    float value = 0.5;
    float amplitude = 0.5;
    float frequency = 0.;
    vec2 shift = vec2(100);
    mat2 rot2 = mat2(cos(0.5), sin(0.5),
                    -sin(0.5), cos(0.50));
    // Loop of octaves
    for (int i = 0; i < 16; i++) {
        value += amplitude * noise(uv,_time);
        uv = rot2 * uv * 2.0 + shift;
        amplitude *= .5;
    }
    return value;
}
#define OCTAVES 8
float snoise(vec2 v) {

    // Precompute values for skewed triangular grid
    const vec4 C = vec4(0.211324865405187,
                        // (3.0-sqrt(3.0))/6.0
                        0.366025403784439,
                        // 0.5*(sqrt(3.0)-1.0)
                        -0.577350269189626,
                        // -1.0 + 2.0 * C.x
                        0.024390243902439);
                        // 1.0 / 41.0

    // First corner (x0)
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);

    // Other two corners (x1, x2)
    vec2 i1 = vec2(0.0);
    i1 = (x0.x > x0.y)? vec2(1.0, 0.0):vec2(0.0, 1.0);
    vec2 x1 = x0.xy + C.xx - i1;
    vec2 x2 = x0.xy + C.zz;

    // Do some permutations to avoid
    // truncation effects in permutation
    i = mod289(i);
    vec3 p = permute(
            permute( i.y + vec3(0.0, i1.y, 1.0))
                + i.x + vec3(0.0, i1.x, 1.0 ));

    vec3 m = max(0.5 - vec3(
                        dot(x0,x0),
                        dot(x1,x1),
                        dot(x2,x2)
                        ), 0.0);

    m = m*m ;
    m = m*m ;

    // Gradients:
    //  41 pts uniformly over a line, mapped onto a diamond
    //  The ring size 17*17 = 289 is close to a multiple
    //      of 41 (41*7 = 287)

    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;

    // Normalise gradients implicitly by scaling m
    // Approximation of: m *= inversesqrt(a0*a0 + h*h);
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0+h*h);

    // Compute final noise value at P
    vec3 g = vec3(0.0);
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * vec2(x1.x,x2.x) + h.yz * vec2(x1.y,x2.y);
    return 130.0 * dot(m, g);
}
float ridgedMF(vec2 p) {
    float lacunarity = 2.0;
    float gain = 0.5;
    float offset = 0.9;

    float sum = 0.0;
    float freq = 1.0, amp = 0.5;
    float prev = 1.0;
    for(int i=0; i < OCTAVES; i++) {
        float n = ridge(snoise(p*freq+20.), offset);
        sum += n*amp;
        sum += n*amp*prev;  // scale by previous octave
        prev = n;
        freq *= lacunarity;
        amp *= gain;
    }
    return sum;
}
mat2 scale(vec2 _scale){
    return mat2(_scale.x,0.0,
                0.0,_scale.y);
}
mat2 rotate2d(float _angle){
    return mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle));
}
vec3 generateRedbullBackground(vec2 uv){
	//uv = vTexCoord;
	vec3 c1 = vec3(37./255.,52./255.,117./255.); //mismo azul que el logo. pero no va para el shader 
		 c1 = vec3(0.0,0.0,1.0);
		 //c1 = vec3(r1,g1,b1);
	vec3 c2 = vec3(227./255.,20./255.,78./255.);
		 c2 = vec3(1.0,0.,0.);
		// c2 = vec3(r2,g2,b2);
	
	//float mapspeedx = mapr(speedx,-.1,.1);
	//float mapspeedy = mapr(speedy,-.1,.1);
	
	//float mapscalex = mapr(scalex,0.0,30.0);
	//float mapscaley = mapr(scaley,0.0,30.0);
	//float mapscale2 = mapr(flush,1.0,100.0);
	
	float manimationspeed1 = mapr(animationspeed1,0.0,5.0);
	//float manimationspeed2 = mapr(animationspeed2,0.0,5.0);
	
	
	float e = fbm2(vec2(uv.x*5.,uv.y*5.+time*.1),time*manimationspeed1+1.0);
		 // e*=uv.y*0.4;
    // e=0.5;  
	float e2 = fbm2(vec2(uv.x*.5,
				        uv.y*5.5),time*3.0+3213.0+fbmseed*10.);
						
	float e3 = fbm2(vec2(uv.x*10.,
				        uv.y*10.),0.5+time*1.0+4123.0+fbmseed*10.);
						
	float e4 = fbm2(vec2(uv.x*mapr(fbmsc,4.0,22.0)*.5,
				        uv.y*mapr(fbmsc,4.0,22.0)),time*0.1+32.0+fbmseed*10.);
						
	float e5 = fbm2(vec2(uv.x*2.,
				        uv.y*2.),0.5+time*0.2+31234.0);
						
	float e6 = fbm2(vec2(uv.x*10.,uv.y*10.+time*.001),time*0.1+1000.0);
	vec3 fin = vec3(e2);
	

	//fin = smoothstep(0.75,1.0,fin);
	//fin*=vec3(1.0,0.2,0.2);
	
		
//	fin = smoothstep(0.75,1.0,fin);

	float s = 0.21;
	float linea = smoothstep(0.5-s,0.5+s,uv.x)*(1.-smoothstep(0.5-s,0.5+s,uv.x))*2.;
	fin = mix(c1,c2,uv.x);
	fin = mix(fin,mix(c1,c2,e3),linea*e2);
	//fin = mix(fin,vec3(0.85),smoothstep(0.3,.55+e*.1,uv.y)); //Mas parecida a la grafica original pero chota
	
	
	vec3 c3 = vec3(0.0,0.0,.0);
	
	vec3 c4_1 = mix(vec3(1.0,0.0,0.0),vec3(0.0,0.0,1.0),1.-uv.x);
	vec3 c4 = mix(c4_1,vec3(1.0,1.0,1.0),e6);
	
	
	float rx1 = ridgedMF(vec2(uv.x*mapr(rxrsc,1.0,5.0),uv.y*mapr(rxrsc,1.0,5.0))*vec2(ridgedMF(vec2(uv.x*2.,uv.y*2.))));
	fin = mix(fin,mix(c3,
					c4,vec3(e4)),smoothstep(0.25,.99+e*0.1,1.-uv.y)); //COn un toque de blanco
	
	
	//fin = mix(mix(c1,c2,fin),mix(c1,c2,uv.x),1.0) ;
	//fin = mix(fin,vec3(1.0),smoothstep(0.1,0.9,uv.y));
	//fin =mix(vec3(0.0),fin,sin(e2*10.)*.5+.5)*mapr(e3,-.5,0.5);
//	fin = smoothstep(0.,.

	
	
	//vec4 tx = texture2D(titulos,uv);
	//vec4 tx2 = texture2D(cuadrados,uv);
	
	
	vec3 textc = mix(c1,c2,sin(uv.x*4.+e2+pi-time*.1+rx1)*.5+.5);
	textc = mix(textc,vec3(rx1),vec3(e3*.1));
	//fin=mix(fin,textc,tx.rgb);
	
	//fin=mix(fin,vec3(mix(c1,c2,e3)),tx2.rgb);
	//fin=mix(fin,mix(c1,c2,e3),tx2.rgb);
	return vec3(fin);
}
vec3 generateStarnest(){
	//get coords and direction
	vec2 uv = gl_FragCoord.xy/resolution.xy-vec2(.5,.5);
	//uv*=2.0;
	uv = vTexCoord;
	
	//uv.y = 1.0-uv.y;
	uv.y+=0.5;
	uv.x*=resolution.x/resolution.y;
	vec3 dir=vec3(uv*mapr(zoom,3.0,35.0),1.);

	float a1=.5+1.0/resolution.x*2.;
	float a2=.8+1.0/resolution.y*2.;
	mat2 rot1=mat2(cos(a1),sin(a1),-sin(a1),cos(a1));
	mat2 rot2=mat2(cos(a2),sin(a2),-sin(a2),cos(a2));
	dir.xz*=rot1;
	dir.xy*=rot2;
	vec3 from=vec3(1.,.5,0.5);
	from+=vec3(time*mapr(speedx,-0.005,0.005),time*mapr(speedy,-0.005,0.005),-2.);
	
	
	
	//from.xz*=rot1;
	//from.xy*=rot2;
	
	//volumetric rendering
	float s=0.1,fade=1.;
	vec3 v=vec3(0.);
	
	
	int mite = int(floor(mapr(iterations,10.0,25.0)));
	
	int mvolsteps = int(floor(mapr(volsteps,4.0,30.0)));
	const int maxvolsteps = 30;
	const int maxite = 25;
	float mbri =0.001;
	float mdarkmatter = mapr(darkmatter,7.0,8.0);
	for (int r=0; r<maxvolsteps; r++) {
		vec3 p=from+s*dir*.5;
		float mtile = mapr(tile,0.2,1.0);
		p = abs(vec3(mtile)-mod(p,vec3(mtile*2.))); // tiling fold
		float pa,a=pa=0.;
		for (int i=0; i<maxite; i++) { 
			//p=abs(p)/dot(p,p)-formuparam; // the magic formula
			
			
			float mfp1 = mapr(formuparam,0.2,0.8);
			float mfp2 = mapr(formuparam,0.54,0.67);
				  
				  
			float mfp3_2 = mix(mfp1,mfp2,formuparam);
			float mfp3_1 = 0.;
				  
				  if(formuparam > .5){
					  mfp3_1 = mfp1;
				  }else{
					  mfp3_1 = mfp2;
				  }
				  
				float fm = mix(  mfp3_1,mfp3_2,sin(time*.025)*.5+.5);
				  
			p=abs(p)/dot(p,p)-mfp1;
			a+=abs(length(p)-pa); // absolute sum of average change
			pa=length(p);
			if(i > mite){
				break;
			}
		}
		float dm=max(0.,mdarkmatter-a*a*.001); //dark matter
		a*=a*a; // add contrast
		if (r>6) fade*=1.-dm; // dark matter, don't render near
		//v+=vec3(dm,dm*.5,0.);
		v+=fade;
		v+=vec3(s,s*s,s*s*s*s)*a*mbri*fade; // coloring based on distance
		//fade*=mapr(distfading,0.2,.5); // distance fading
		fade*=.24; 
		s+=mapr(stepsize,0.0,0.025);
		if(r > mvolsteps){
				break;
		}
	}
	v=mix(vec3(length(v)),v,saturation); //color adjust
	
	
	
	vec3 c1 = vec3(28./255., 128./255., 183./255.);
	vec3 c2 = vec3(1.);
	
	return v*0.01;	
}
void main(){
	
	vec2 uv = gl_FragCoord.xy / resolution;
	uv = vTexCoord;
	//uv.x*=resolution.x/resolution.y;
	if(rdm(fbmseed+235.) > .5){
		uv.y = 1.-uv.y;
	}
	
	if(rdm(fbmseed+12.) > .5){
		uv.x = 1.-uv.x;
	}
	//
	
	//uv.y*=resolution.x/resolution.y;
	vec3 starnest = generateStarnest();
	float stprom = (starnest.r+starnest.g+starnest.b)/3.;

		uv.y-=clamp(mapr(displacey,2.,5.0)*stprom,-1.0,1.5);
	
	//if(mousePressed == 1){
		
		vec2 uv_d = vec2(uv.x+mapr(mouse.x,-.4,.4),uv.y-mapr(mouse.y,-.4,.4));
		
		uv = mix(uv,uv_d,lerpm);
		//uv.x+=mapr(mouse.x,-.4,.4)-stprom;
		//uv.y+=mapr(mouse.y,-.4,.4)-stprom;
	//}
	//if(mousePressed 
	
	
	
	
	//if(rdm(fbmseed+4213.) > .5){
	//uv+=vec2(0.5,.5);
	//uv*=scale(vec2(sin(stprom*10.+time*.001)*.2+.2+.6));
	//uv-=vec2(0.5,.5);
	//}
	
	
	vec3 fin = generateRedbullBackground(uv);
	//fin+= sin(fin*100.+time)*.01;
		

	
	gl_FragColor = vec4(fin,1.0);
	
	
}