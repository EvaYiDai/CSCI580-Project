#version 300 es
precision mediump float;
in vec3 vertexPosition;
in vec3 normalPosition;
uniform mat4 viewMatrix;
uniform mat4 perspectiveMatrix;
out vec3 vNormal;
out float fragDepth;
void main() {
   gl_Position = perspectiveMatrix * viewMatrix * vec4(vertexPosition, 1.0);
   // gl_Position = vec4(vertexPosition, 1.0);
   vNormal = normalPosition;
   // fragDepth = gl_Position.z / gl_Position.w;
}