precision highp float;

varying vec3 vertNormal;
varying vec3 vertLightDir;
varying vec4 vertPosition;

uniform float time;

uniform vec2 pupilPos;
uniform bool eyeOpen;

uniform float eyeLidProgress;






const mat2 m = mat2( 0.80,  0.60, -0.60,  0.80 );

float hash( float n )
{
    return fract(sin(n)*43758.5453);
}

float noise( in vec2 x )
{
    vec2 i = floor(x);
    vec2 f = fract(x);

    f = f*f*(3.0-2.0*f);

    float n = i.x + i.y*57.0;

    return mix(mix( hash(n+ 0.0), hash(n+ 1.0),f.x),
               mix( hash(n+57.0), hash(n+58.0),f.x),f.y);
}

float fbm( vec2 p )
{
    float f = 0.0;
    f += 0.50000*noise( p ); p = m*p*2.02;
    f += 0.25000*noise( p ); p = m*p*2.03;
    f += 0.12500*noise( p ); p = m*p*2.01;
    f += 0.06250*noise( p ); p = m*p*2.04;
    f += 0.03125*noise( p );
    return f/0.984375;
}

void main() {
    float intensity;
    vec4 color;
    intensity = max(0.0, dot(vertLightDir, vertNormal));
    

    if (intensity > 0.95) {
        color = vec4(1.0, 0.25, 0.25, 1.0);
    } else if (intensity > 0.5) {
        color = vec4(0.6, 0.15, 0.15, 1.0);
    } else if (intensity > 0.25) {
        color = vec4(0.4, 0.1, 0.1, 1.0);
    } else {
        color = vec4(0.2, 0.1, 0.1, 1.0);
    }
    

    float eye = max(eyeOpen ? 1.0 : 0.0, eyeLidProgress);
    float t = mix(10.0, 1.4, eyeLidProgress);
    
    float x = 3.7 * vertPosition.x / 270.0;
    float y = 2.0 * vertPosition.y / 130.0 + 1.7;
    
    if(y < 1.9 && y > -1.9 && t*t*x*x + sin(y/1.2)*sin(y/1.2)< min(1.,eye)) {
        color = vec4(intensity, intensity, intensity, 1.);
    }
    

    float px = x - pupilPos.x;
    float py = y - pupilPos.y;

    if(py*py+px*px < 0.65 && t*t*x*x + sin(y/1.2)*sin(y/1.2)< min(1.,eye)) {

        float f = smoothstep(1.0, 0.8, px*px + py*py);
        color = mix(color, vec4(0.1,0.1,0.1,1.0), f );
        
        f = smoothstep(1.0, 0.1, fbm(vec2(6.*(px*px + py*py), 20.*atan(py,px))));
        color = mix(color, vec4(0.1,0.6,0.1,1.0), f )*intensity;
        
        f = smoothstep(1.0, 0.7, 9.0*(px*px + py*py));
        color = mix(color, vec4(0.0,0.0,0.0,1.0), f );
        
        f = smoothstep(1.0, 0.3, 7.0*((px+0.6*vertLightDir.x)*(px+0.6*vertLightDir.x)+ (py-0.6*vertLightDir.y)*(py-0.6*vertLightDir.y)));
        color += vec4(1.0, 0.9, 0.8, 1.0)*f*intensity;
    }
    
    // Eye outline
    if(y < 1.9 && y > -1.9 && abs(t*t*x*x + sin(y/1.2)*sin(y/1.2)- 1.) < 0.01) {
        color = vec4(0.2, 0.1, 0.1, 1.0);
    }

    gl_FragColor = color;
}
