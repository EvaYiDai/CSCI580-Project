#version 300 es
precision mediump float;

#define MATERIAL_COLOR vec3(.5, .5, .5)
#define AMBIENT_COLOR vec3(1., 1., 1.)
#define AMBIENT_INTENSITY .2
#define LIGHT_COLOR vec3(1., .5, 1.)
#define LIGHT_INTENSITY .6
in vec3 vNormal;
in vec3 vPosition;
in vec2 vUV;
in float camZ;
uniform float shine;
uniform float Ka;
uniform float Kd;
uniform float Ks;
uniform float nScale;
uniform float nMix;
out vec4 o;

vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
    dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  float z = 1./camZ;
  vec2 pUV = vec2(vUV.x*z, vUV.y*z);
	float pn = snoise(nScale * pUV);
  float sn = snoise(vec2(pn, nScale * pUV.y));
  float sn2 = snoise(vec2(sn, nScale * pUV.y));
	vec3 L = normalize(vec3(0.687118, 0.29119054, 0.66564024));
	vec3 V = normalize(-vPosition);
	vec3 H = normalize(L + V);
	float NL = dot(vNormal, L);
	float NH = dot(vNormal, H);
	float FACING = 0.;
	if (NH > 0.) FACING = FACING + 1.;

	vec3 A = AMBIENT_COLOR * AMBIENT_INTENSITY;
	vec3 D = LIGHT_COLOR * LIGHT_INTENSITY * max(0., NL);
	vec3 S = LIGHT_COLOR * LIGHT_INTENSITY * FACING * pow(max(0., NH), shine);

	vec3 color = MATERIAL_COLOR * (Ka * A + Kd * D) + Ks * S;

  vec3 noiseA = pn * AMBIENT_COLOR * AMBIENT_INTENSITY;
	vec3 noiseD = sn * LIGHT_COLOR * LIGHT_INTENSITY * max(0., NL);
  vec3 noiseS = sn2 * LIGHT_COLOR * LIGHT_INTENSITY * FACING * pow(max(0., NH), shine);
  vec3 colorN = MATERIAL_COLOR * (Ka * noiseA + Kd * noiseD) + Ks * noiseS;

  vec3 colorF = nMix*colorN + (1.-nMix)*color;

	o = vec4(colorF, 1.);
}