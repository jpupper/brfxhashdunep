precision mediump float;


uniform vec2 resolution ;
uniform float time ;
uniform vec2 mouse ;
uniform sampler2D feedback ;

varying vec2 vTexCoord ;


uniform sampler2D tx2 ;


void main(void)
{
    vec2 uv = gl_FragCoord.xy/resolution.xy - .5;
         uv = vTexCoord ;
    
   vec4 c = texture2D(tx2,vec2(uv.x,1.-uv.y));

   vec3 chromacol = vec3(0.0,1.0,.0);

   float alpha = 1.0;
   if(distance(c.rgb,chromacol) < 0.4){
    alpha = 0.0;
   }

    gl_FragColor = vec4(c.rgb,alpha);
   // gl_FragColor = vec4(r1,g1,b1,0.5);
}









