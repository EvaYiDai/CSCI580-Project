#version 300 es
precision mediump float;
in vec3 vertexPosition;
in vec3 normalPosition;
in vec2 uvPosition;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 perspectiveMatrix;
out vec3 vNormal;
out vec3 vPosition;
out vec2 vUV;
out float camZ;
void main() {
   vec4 cam = viewMatrix * modelMatrix * vec4(vertexPosition, 1.0);
   gl_Position = perspectiveMatrix * cam;
   vNormal = mat3(viewMatrix) * mat3(modelMatrix) * normalPosition;
   vPosition = (viewMatrix * vec4(vertexPosition, 1.0)).xyz;
   vUV = vec2(uvPosition.x/cam.z,uvPosition.y/cam.z);
   camZ = 1./cam.z;
}