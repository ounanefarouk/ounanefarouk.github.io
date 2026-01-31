precision highp float;


#define PI 3.1415926535897932384626433832795


uniform mat3 normalMatrix;

uniform mat4 uProjectionMatrix;

uniform mat4 uModelViewMatrix;

uniform vec3 lightNormal;
uniform float time;


attribute vec3 aPosition;
attribute vec3 aNormal;

varying vec3 vertNormal;
varying vec3 vertLightDir;
uniform mat4 originalModelViewMatrix;

uniform mat4 originalProjectionMatrix;
varying vec4 vertPosition;


void main() {
    
    vec3 vert_pos = aPosition;
    
    vertPosition = originalProjectionMatrix * originalModelViewMatrix * vec4(vert_pos, 1.0);
    vertNormal = normalize(aNormal);
    

    float t = 10.;
    float eye = 0.0;
    if (time > 10.) {
        eye = 1.;
        t = max(10. - 75.*(time-10.), 1.4);
    }
    
    if (time > 15.) {
        t = min(1.4 + 20.*(time-15.), 10.);
        
    }
    
    if (t == 10.) {
        eye = 0.;
    }


    if(aPosition.y + aPosition.x < 65.0) {
          
     vert_pos = pow(1.0+5.0*sin(4.0 * PI*time-vert_pos.y/300.0)/(500.0-vert_pos.y),4.0)
    *vert_pos;
    }
    
    gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(vert_pos,1.0);
    vertPosition = originalProjectionMatrix * originalModelViewMatrix * vec4(aPosition, 1.0);
    

  
  vertNormal = normalize(aNormal);
  vertLightDir = -normalize(lightNormal);
    

}
