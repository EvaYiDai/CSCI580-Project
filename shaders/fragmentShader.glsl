#version 300 es
precision mediump float;
in vec3 vNormal;
in float fragDepth;
out vec4 o;
void main() {
	vec3 lightDir = normalize(vec3( -.707, -.5, -.5));
	float d1 = clamp(dot(lightDir, vNormal), 0., 1.);
  float d2 = clamp(dot(lightDir, -1.*vNormal), 0., 1.);
	vec3 c1 = d1 * vec3(.95, .65, .88);
  vec3 c2 = d2 * vec3(.95, .65, .88);
  vec3 c = c1*.99 + c2*.01;
	o = vec4(c, 1.);
	// gl_FragDepth = fragDepth;
}