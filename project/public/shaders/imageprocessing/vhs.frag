precision mediump float;
//vec3 verdejpupper(){return vec3(0.0,1.0,0.8);}

// we need the sketch resolution to perform some calculations
uniform vec2 resolution ;
uniform float time ;
uniform sampler2D tx ;


varying vec2 vTexCoord ;
#define iTime time
#define iResolution resolution

uniform float range ;
uniform float noiseQuality ;
uniform float noiseIntensity ;
uniform float offsetIntensity ;
uniform float colorOffsetIntensity ;



float rand(vec2 co)
{
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

float mapr(float _value,float _low2,float _high2) {
	float val = _low2 + (_high2 - _low2) * (_value - 0.) / (1.0 - 0.);
    //float val = 0.1;
	return val;
}
float verticalBar(float pos, float uvY, float offset)
{
    float edge0 = (pos - mapr(range,0.0,0.025)); 
    float edge1 = (pos + mapr(range,0.0,0.025)); 

    float x = smoothstep(edge0, pos, uvY) * offset;
    x -= smoothstep(pos, edge1, uvY) * offset;
    return x;
}

void main()
{
	
	
	vec2 uv = gl_FragCoord.xy / iResolution.xy;
         uv = vTexCoord;
         uv.y = 1.-uv.y;
    for (float i = 0.0; i < 0.71; i += 0.1313)
    {
        float d = mod(iTime * i, 1.7);
        float o = sin(1.0 - tan(iTime * 0.24 * i));
    	o *= offsetIntensity;
        uv.x += verticalBar(d, uv.y, o);
    }
    
	float mnoiseQuality = mapr(noiseQuality,0.0,300.0);
    float uvY = uv.y;
    uvY *= mnoiseQuality;
    uvY = float(int(uvY)) * (1.0 / mnoiseQuality);
	
    float noise = rand(vec2(iTime * 0.00001, uvY));
    uv.x += noise * mapr(noiseIntensity,0.0,0.01);

    vec2 offsetR = vec2(0.006 * sin(iTime), 0.0) * colorOffsetIntensity;
    vec2 offsetG = vec2(0.0073 * (cos(iTime * 0.97)), 0.0) * colorOffsetIntensity;
    
    float r = texture2D(tx, uv + offsetR).r;
    float g = texture2D(tx, uv + offsetG).g;
    float b = texture2D(tx, uv).b;

    vec4 tex = vec4(r, g, b, 1.0);
    gl_FragColor = tex;
}
