#version 300 es
precision mediump float;
in vec3 vNormal;
in float fragDepth;
out vec4 o;
const float PI = 3.14159265359;
const float PIhalf = PI/2.;
void main() {
	vec3 lightDir = normalize(vec3( -.707, -.5, -.5));
   // lightDir = vec3( lightDir.xy * mat2(cos(PIhalf), -sin(PIhalf), sin(PIhalf), cos(PIhalf)), lightDir.z );
	float d = clamp(dot(lightDir, vNormal), 0., 1.);
   float d2 = clamp(dot(lightDir, -1.*vNormal), 0., 1.);
	vec3 c1 = d * vec3(.95, .65, .88);
   vec3 c2 = d2 * vec3(.95, .65, .88);
   vec3 c = c1*.77 + c2*.66;
	o = vec4(c, 1.);
	gl_FragDepth = fragDepth;
}