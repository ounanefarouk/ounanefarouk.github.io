#ifdef GL_ES
precision highp float;
precision highp int;
#endif

uniform vec2 iResolution;
uniform float iTime;
uniform float rotX;
uniform float rotY;

uniform float thickness;
uniform float MaxDepth;
uniform float field;

uniform float thetaReduction;
uniform vec2 param;
uniform vec4 petalCut;
uniform vec2 hangDown;

uniform vec3 bColor;



const mat2 m = mat2( 0.80,  0.60, -0.60,  0.80 );

float hash( float n ) {
    return fract(sin(n)*43758.5453);
}

float noise( in vec3 x ) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f*f*(3.0-2.0*f);
    float n = i.x + i.y*57.0;
    return mix(mix( hash(n+ 0.0), hash(n+ 1.0),f.x),
           mix( hash(n+57.0), hash(n+58.0),f.x),f.y);
}

float fbm( vec3 p ) {
    float f = 0.0;
    f += 0.50000*noise( p ); p.xz = m*p.xz*2.02;
    f += 0.25000*noise( p ); p.xz = m*p.xz*2.03;
    f += 0.12500*noise( p ); p.xz = m*p.xz*2.01;
    f += 0.06250*noise( p ); p.xz = m*p.xz*2.04;
    f += 0.03125*noise( p );
    return f/0.984375;
}

mat3 rotationMatrix(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    
    return mat3(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c);
}

float FlowerSDF(vec3 p) {

    
    float scale = 2.0;
    float R = length(p);
    
    if (R == 0.0) return 0.0;
    if (R > scale + 1.0 ) return R - scale+ - 1.0 + 0.001*(1.0+thickness) +0.0005;
    

    float C = scale * hangDown.x * (1.0/scale) * (1.0/scale) * pow(hangDown.y * (length(p)/scale) - 1.0, 2.3);
    p = p - vec3(0.0, C * length(p.xz), 0.0);
    
    R = length(p);

    if (R > scale + 1.0 ) return R - scale+ - 1.0 + 0.001*(1.0+thickness) + 0.0005;

    
    float phi = acos(-p.y / R);
    float theta = -param.y * 2.302585 * (phi - param.x) /( phi + param.x);
    
    float Cut = petalCut.x + abs(60.0*asin(sin(petalCut.y * theta)) + petalCut.z * sin(petalCut.y * theta)) / petalCut.w;

    float r = sin(phi);
    float px2 = R * r * sin(theta);
    float pz2 = R * r * cos(theta);
    float dx = p.x - px2;
    float dz = p.z - pz2;
    float spiralDist = length(vec2(dx, dz));
    
    float reduction = exp(-5.*theta/thetaReduction);
    

    if (theta < 0.0) {
        Cut = 0.0;
    }
    
    return 2.0*max(spiralDist, (R - scale * reduction* Cut)) * 0.01;
}

float rayMarch(vec3 ro, vec3 rd, vec3 normal) {
    float depth = 0.0;
    for (int i = 0; i < 300; i++) {
        vec3 p = ro + rd * depth;
        float d = FlowerSDF(p);
       
        if (d < 0.001*(1.0+thickness)) return depth;
        depth += d;
        if (depth > MaxDepth) break;
    }
    return -1.0;
}

vec3 rayDirection(vec2 uv, vec3 ro, vec3 lookAt) {
    vec3 f = normalize(lookAt - ro);
    vec3 r = normalize(cross(vec3(0.0, 1.0, 0.0), f));
    vec3 u = cross(f, r);
    vec3 c = f * 1.0;
    vec3 i = c + uv.x * r + uv.y * u;
    return normalize(i);
}

// Function to create radial veins pattern
float radialVeins(vec3 p, float intensity) {
    // Convert to polar coordinates
    float radius = length(p.xz);
    float angle = atan(p.z, p.x);
    
    // Create radial lines
    float veins = smoothstep(0.85, 0.95,
        abs(sin(angle * 12.0 + p.y * 2.0)) *
        (1.0 - smoothstep(0.0, 0.7, radius/2.0)) // Fade out towards edges
    );
    
    return veins * intensity * (0.5 + 0.5 * noise(p * 5.0));
}

void main() {
    vec3 nor = vec3(0.0, 0.0, 1.0);
    
    vec2 uv = (gl_FragCoord.xy / iResolution) * 2.0 - 1.0;
    uv.x *= iResolution.x / iResolution.y;

    
    mat3 rotXMat = rotationMatrix(vec3(1.0, 0.0, 0.0), rotX);
    mat3 rotYMat = rotationMatrix(vec3(0.0, 1.0, 0.0), rotY);
    
    
    vec3 ro = vec3(0.0, -4.0, 2.0);
    vec3 lookAt = vec3(0.0, 0.0, 0.0);
    vec3 rd = rayDirection(uv, ro, lookAt);
    
    ro =  rotYMat*rotXMat * ro;
    rd =  rotYMat*rotXMat * rd;
    
    float t = rayMarch(ro, rd, nor);
    if (t > 0.0) {
        vec3 p = ro + rd * t;
        
        // Calculate normal
        float eps = 0.001;
        vec3 normal;
        float d = FlowerSDF(p);
        normal.x = FlowerSDF(p + vec3(eps, 0, 0)) - d;
        normal.y = FlowerSDF(p + vec3(0, eps, 0)) - d;
        normal.z = FlowerSDF(p + vec3(0, 0, eps)) - d;
        normal = normalize(normal);
        
        vec3 lightPos = vec3(2.0, 2.0, 2.0);
        vec3 lightDir = normalize(lightPos - p);
        
        float ambient = 0.3;
        float diffuse = max(dot(normal, lightDir), 0.0);
        vec3 viewDir = normalize(ro - p);
        vec3 reflectDir = reflect(-lightDir, normal);
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
        
        // Distance from center for color gradient
        float distFromCenter = length(p)/2.0;
        distFromCenter = clamp(distFromCenter, 0.0, 1.0);
        
        // Add noise to the color transition
        float noiseFactor = noise(p * 5.0) * 0.2;
        distFromCenter += noiseFactor;
        distFromCenter = clamp(distFromCenter, 0.0, 1.0);
        
        // Base color gradient
        vec3 baseColor = mix(vec3(1.0, 1.0, 1.0),
                            bColor,
                            smoothstep(0.3, 1.0, distFromCenter));
        
        // Add radial veins
        float veins = radialVeins(p, 0.4);
        baseColor = mix(baseColor, vec3(1.0, 1.0, 1.0), veins);
        
        // Apply lighting
        vec3 color = baseColor * (ambient + diffuse + spec * 0.5);
        
        // Subsurface scattering
        float sss = pow(clamp(dot(normal, -rd), 0.0, 1.0), 2.0) * 0.5;
        color += vec3(1.0, 0.7, 0.7) * sss * (1.0 - distFromCenter);
        
        // Glow effect based on distance from center
        float glow = smoothstep(0.7, 1.0, distFromCenter) * 0.5;
        color +=  bColor * glow;
        
        gl_FragColor = vec4(color, 1.0);
    } else {
        // Background with subtle glow
        float bgGlow = smoothstep(0.5, 1.0, length(uv)) * 0.2;
        gl_FragColor = vec4(vec3(1.0, 0.9, 0.8) * bgGlow, 1.0);
    }
}
