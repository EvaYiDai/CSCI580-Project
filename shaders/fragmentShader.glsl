#version 300 es
precision mediump float;

#define MATERIAL_COLOR vec3(.5, .5, .5)
#define AMBIENT_COLOR vec3(1., 1., 1.)
#define AMBIENT_INTENSITY .2
#define LIGHT_COLOR vec3(1., .5, 1.)
#define LIGHT_INTENSITY .6
#define SHINE 2.
#define Ka .5
#define Kd .75
#define Ks .9

in vec3 vNormal;
in vec3 vPosition;
out vec4 o;

void main() {
	vec3 L = normalize(vec3(0.687118, 0.29119054, 0.66564024));
	vec3 V = normalize(-vPosition);
	vec3 H = normalize(L + V);
	float NL = dot(vNormal, L);
	float NH = dot(vNormal, H);
	float FACING = 0.;
	if (NH > 0.) FACING = FACING + 1.;

	vec3 A = AMBIENT_COLOR * AMBIENT_INTENSITY;
	vec3 D = LIGHT_COLOR * LIGHT_INTENSITY * max(0., NL);
	vec3 S = LIGHT_COLOR * LIGHT_INTENSITY * FACING * pow(max(0., NH), SHINE);

	vec3 color = MATERIAL_COLOR * (Ka * A + Kd * D) + Ks * S;
	o = vec4(color, 1.);
}