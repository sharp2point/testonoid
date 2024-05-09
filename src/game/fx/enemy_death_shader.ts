import { Scene, ShaderMaterial, ShaderStore } from "@babylonjs/core";

export function enemyDeathShader() {
    ShaderStore.ShadersStore["enemyVertexShader"] = `#version 300 es
        precision highp float;

        // Attributes
        vec3 position;
        vec3 normal;

        // Uniforms
        uniform mat4 worldViewProjection;
        uniform float time;

        void main() {
            vec3 p = position;
            vec3 j = vec3(0., -1.0, 0.);
            p = p + normal * log2(1. + time) * 25.0;
            gl_Position = worldViewProjection * vec4(p, 1.0);
        }`;

    ShaderStore.ShadersStore["enemyFragmentShader"] = `#version 300 es
        precision highp float;
        uniform float time;        
        out vec4 fragColor;
        void main(void) {
            fragColor = vec4(1. - log2(1. + time)/100., 1. * log2(1. + time), 0., 1. - log2(1. + time/2.)/log2(1. + 3.95));
        }`;   
};
