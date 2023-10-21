precision mediump float;


uniform vec2 resolution ;
uniform float time ;
uniform vec2 mouse ;
uniform sampler2D feedback ;

varying vec2 vTexCoord ;


// Some useful functions
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }


uniform float r1 ;
uniform float g1 ;
uniform float b1 ;
uniform float model_x1 ;
uniform float model_y1 ;

uniform float fase1 ;
uniform float fase2 ;
uniform float grid ;

uniform float fmarco ;

uniform float seed ;
uniform sampler2D tx2 ;

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
vec2 random2( vec2 p ) {
    return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
}
float genR (in vec2 _st) {
    return fract(sin(dot(floor(_st.xy),
                         vec2(12.9898,78.233)))*
        43000.31);
}
float mapr(float _value,float _low2,float _high2) {
	float val = _low2 + (_high2 - _low2) * (_value - 0.) / (1.0 - 0.);
    //float val = 0.1;
	return val;
}
float noise (in vec2 st,float fase) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    
    float fase2 = fase;
    // Four corners in 2D of a tile
    float a = sin(genR(i)*fase2);
    float b =  sin(genR(i + vec2(1.0, 0.0))*fase2);
    float c =  sin(genR(i + vec2(0.0, 1.0))*fase2);
    float d =  sin(genR(i + vec2(1.0, 1.0))*fase2);

    // Smooth Interpolation

    // Cubic Hermine Curve.  Same as SmoothStep()
    vec2 u = f*f*(3.0-2.0*f);
    // u = smoothstep(0.,1.,f);

    // Mix 4 coorners percentages
    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

vec3 rgb2hsb( in vec3 c ){
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz),
                 vec4(c.gb, K.xy),
                 step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r),
                 vec4(c.r, p.yzx),
                 step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)),
                d / (q.x + e),
                q.x);
}
vec3 hsb2rgb( in vec3 c ){
    vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),
                             6.0)-3.0)-1.0,
                     0.0,
                     1.0 );
    rgb = rgb*rgb*(3.0-2.0*rgb);
    return c.z * mix(vec3(1.0), rgb, c.y);
}

float random (in vec2 _st) {
    return fract(sin(dot(floor(_st.xy),
                         vec2(12.9898,78.233)))*
        43000.31);
}
float ridge(float h, float offset) {
    h = abs(h);     // create creases
    h = offset - h; // invert so creases are at top
    h = h * h;      // sharpen creases
    return h;
}

#define OCTAVES 8
float ridgedMF(vec2 p) {
    float lacunarity = 2.0;
    float gain = 0.5;
    float offset = 0.9;

    float sum = 0.0;
    float freq = 1.0, amp = 0.5;
    float prev = 1.0;
    for(int i=0; i < OCTAVES; i++) {
        float n = ridge(snoise(p*freq+seed*20.), offset);
        sum += n*amp;
        sum += n*amp*prev;  // scale by previous octave
        prev = n;
        freq *= lacunarity;
        amp *= gain;
    }
    return sum;
}
float ridge2(float h, float offset) {
    h = abs(h);     // create creases
    h = offset - h; // invert so creases are at top
    h = h * h;      // sharpen creases
    return h;
}
float snoise2(vec2 v) {

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
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0+h*h) +seed*5001.;

    // Compute final noise value at P
    vec3 g = vec3(0.0);
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * vec2(x1.x,x2.x) + h.yz * vec2(x1.y,x2.y);
    return 130.0 * dot(m, g);
}
float ridgedMF2(vec2 p) {
    float lacunarity = 2.0;
    float gain = 0.5;
    float offset = 0.9;

    float sum = 0.0;
    float freq = 1.0, amp = 0.5;
    float prev = 1.0;
    for(int i=0; i < OCTAVES; i++) {
        float n = ridge2(snoise2(p*freq+seed*4551565.), offset);
        sum += n*amp;
        sum += n*amp*prev;  // scale by previous octave
        prev = n;
        freq *= lacunarity;
        amp *= gain;
    }
    return sum;
}
float fbm (in vec2 uv,in float _time) {
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
void main(void)
{
    vec2 uv = gl_FragCoord.xy/resolution.xy;
         uv = vTexCoord ;
         //uv.x*=2.0;
        // uv*=resolution.x/resolution.y;
    float ts = time*0.35;
    float sn = noise(uv*10.,508481.+fase2*20.+ts);
    float sn2 =  noise(uv*150.,819818974.+fase1*20.+ts);
    float sn3 =  noise(uv*150.,12312423.+fase1*20.+ts);
    float sn4 =  noise(uv*15.,265234.+fase1*20.+ts*4.);
          sn4 = snoise(uv*10.+time*.2)*1.;
          sn4 = fbm(uv*fbm(uv*2.5,time+3235852.)*15.5,time+2354.)*.8;
        //  sn4+=sin(sn4*50.+time)*0.1;


    float dif2 = 0.9;
    float sn5 =  fbm(uv*fbm(uv*15.5,time+123421.)*15.5,time+2354.)*.8;
          sn5 = smoothstep(0.5-dif2,0.5+dif2,sn5);


    vec3 col = vec3(0.4,0.25,1.0);
         col = hsb2rgb(vec3(r1,g1,b1));
    vec3 col2 = vec3(0.6)+snoise(uv*4.+ts)*0.25;



    float mgrid = mapr(grid,20.0,50.0);

    //float lx = smoothstep(0.9999,0.99999,sin(uv.x*mgrid+sn*3.+sn2*0.05));
    //float ly = smoothstep(0.9999,0.99999,sin(uv.y*mgrid+sn*4.+sn2*0.05));

    float lx = smoothstep(0.99985,0.99992,sin(uv.x*mgrid+sn*3.+sn2*0.05));
    float ly = smoothstep(0.99985,0.99992,sin(uv.y*mgrid+sn*3.+sn2*0.05));

    float e = lx+ly;


    float dif = 0.002;

    sn3*=0.01;
    float lineahor = smoothstep(0.5-dif,0.5+dif,uv.y+sn3)*smoothstep(0.5+dif,0.5-dif,uv.y+sn3);
    float lineavert = smoothstep(0.5-dif,0.5+dif,uv.x+sn3)*smoothstep(0.5+dif,0.5-dif,uv.x+sn3);
   
   
   
   //EXPLICAME QUE CARAJO PORQUE LO TENGO QUE PONER POR 2 FORRO
  
    
   
    //VIGNETE LG

    
   // vec2 p2= vec2(model_x1,model_y1) -uv;
     vec2 p2= vec2(model_x1,model_y1) -uv;
    float r2 = length(p2);

    vec2 p= vec2(0.5) -uv;
    float r = length(p);

    
    float ecir= (1.-smoothstep(0.02,0.09,r))*sn4;
    float ecir2= (1.-smoothstep(0.02,0.2,r2))*sn4;

    vec2 uv2 = gl_FragCoord.xy/resolution.xy;
    vec4 c=texture2D(tx2,vec2(uv2.x*.5+.25,1.-uv2.y));	

     //COSO DE LAS LINEAS CENTRALES QUE DIVIDEN EN 4
    float lg = (lineahor*2.+lineavert*2.)*(1.-ecir);
         
    
    float vlgs = 0.05;
    float vlg = smoothstep(vlgs,0.0,uv.x)+
                smoothstep(1.0-vlgs*1.5,1.0,uv.x)+
                smoothstep(vlgs,0.0,uv.y)+
                smoothstep(1.0-vlgs,1.0,uv.y);

           lg-=mapr(fmarco,vlg*.25,vlg*.65);
           //lg-=smoothstep(0.2,0.75,vlg*.2);
           e+=lg*1.7;
           e-=ecir*1.5;
           e-=ecir2*.5;
           e+=c.a*sn5;

    vec3 fin = mix(col,col2,e);
        // fin+=uv.x;
    
 

    gl_FragColor = vec4(fin,1.0);
    // gl_FragColor = vec4(model_x1,model_y1,0.0, 1.);
}









