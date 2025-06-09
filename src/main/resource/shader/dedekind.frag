#version 330 core
out vec4 FragColor;

uniform float u_time;
uniform vec2 u_resolution;

const float PI = 3.14159265359;

// Complex Arithmetic Utilities
vec2 cAdd(vec2 a, vec2 b) { return a + b; }
vec2 cSub(vec2 a, vec2 b) { return a - b; }
vec2 cMul(vec2 a, vec2 b) {
    return vec2(a.x*b.x - a.y*b.y, a.x*b.y + a.y*b.x);
}
vec2 cDiv(vec2 a, vec2 b) {
    float d = dot(b, b);
    return vec2((a.x*b.x + a.y*b.y)/d, (a.y*b.x - a.x*b.y)/d);
}
float cMag(vec2 z) { return length(z); }
float cArg(vec2 z) { return atan(z.y, z.x); }
vec2 cExp(vec2 z) {
    float e = exp(z.x);
    return vec2(e * cos(z.y), e * sin(z.y));
}
vec2 cPow(vec2 z, float p) {
    float r = length(z);
    float theta = atan(z.y, z.x);
    float rp = pow(r, p);
    return vec2(rp * cos(p * theta), rp * sin(p * theta));
}

// Dedekind Eta Function Approximation
vec2 dedekind_eta(vec2 z, int terms) {
    vec2 two_pi_i = vec2(0.0, 2.0 * PI);
    vec2 q = cExp(cMul(two_pi_i, z));
    vec2 eta = cPow(q, 1.0 / 12.0);

    // Accumulate powers
    vec2 qn = q;
    for (int n = 1; n <= terms; n++) {
        eta = cMul(eta, cSub(vec2(1.0, 0.0), qn));
        qn = cMul(qn, q);
    }

    return eta;
}

// HSV to RGB Conversion
vec3 hsv2rgb(float h, float s, float v) {
    float c = v * s;
    float x = c * (1.0 - abs(mod(h * 6.0, 2.0) - 1.0));
    float m = v - c;
    vec3 rgb;
    if (h < 1.0/6.0)      rgb = vec3(c, x, 0);
    else if (h < 2.0/6.0) rgb = vec3(x, c, 0);
    else if (h < 3.0/6.0) rgb = vec3(0, c, x);
    else if (h < 4.0/6.0) rgb = vec3(0, x, c);
    else if (h < 5.0/6.0) rgb = vec3(x, 0, c);
    else                 rgb = vec3(c, 0, x);
    return rgb + vec3(m);
}

// Main Shader Entry Point
void main() {
    // Normalized device coordinates
    vec2 uv = (gl_FragCoord.xy / u_resolution) * 2.0 - 1.0;

    // Convert to polar coordinates for edge softening
    float r = length(uv);

    // Fade near edge for anti-aliasing
    float edgeFade = smoothstep(1.0, 0.98, r);
    if (r > 1.0) {
        FragColor = vec4(0.0);
        return;
    }

    // Poincare disk to upper-half plane mapping
    vec2 i = vec2(0.0, 1.0);
    vec2 w = uv;
    vec2 z = cMul(i, cDiv(cAdd(i, w), cSub(i, w)));

    // Evaluate Dedekind eta function
    vec2 eta = dedekind_eta(z, 30);

    float logMag = log(cMag(eta));

    // Exaggerated intensity bands
    float bands = abs(tan(u_time * logMag));

    // Color by argument
    float hue = (cArg(eta) + PI) / (2.0 * PI);

    float value = cMag(eta);

    // Output color
    vec3 color = hsv2rgb(hue, 1.0-pow(bands, 0.25)/3, value);
    FragColor = vec4(color * edgeFade, 1.0);
}
