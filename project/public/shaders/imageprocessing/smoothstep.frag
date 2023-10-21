precision mediump float;

varying vec2 vTexCoord ;
uniform vec2 resolution ;
uniform float time ;
uniform vec2 mouse ;
uniform sampler2D tx ;


uniform float min1 ;
uniform float max1 ;

void main()
{	
	vec2 uv = gl_FragCoord.xy / resolution;
	    uv = vTexCoord;
	
	vec4 t1 =  texture2D(tx, vec2(uv.x,1.-uv.y));
	vec3 fin = smoothstep(min1,max1,t1.rgb);
	
	gl_FragColor = vec4(fin,1.0); 
}