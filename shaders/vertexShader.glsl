#version 300 es
precision mediump float;
in vec3 vertexPosition;
in vec3 normalPosition;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 perspectiveMatrix;
out vec3 vNormal;
out vec3 vPosition;
void main() {
   gl_Position = perspectiveMatrix * viewMatrix * modelMatrix * vec4(vertexPosition, 1.0);
   vNormal = mat3(viewMatrix) * mat3(modelMatrix) * normalPosition;
   vPosition = (viewMatrix * vec4(vertexPosition, 1.0)).xyz;
}