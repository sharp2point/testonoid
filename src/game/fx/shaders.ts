import { ShaderStore } from "@babylonjs/core";

export function loadFX() {
    ShaderStore.ShadersStore["customVertexShader"] = `#version 300 es
        precision highp float;

        // Attributes
in vec3 position;
in vec3 normal;
in vec2 uv;

// Uniforms
uniform mat4 worldViewProjection;

// Varying
out vec4 vPosition;
out vec3 vNormal;

void main() {

    vec4 p = vec4( position, 1. );

    vPosition = p;
    vNormal = normal;

    gl_Position = worldViewProjection * p;

}`;

    ShaderStore.ShadersStore["customFragmentShader"] = `#version 300 es
        precision highp float;

        uniform mat4 worldView;

in vec4 vPosition;
in vec3 vNormal;

uniform sampler2D textureSampler;
uniform sampler2D refSampler;

out vec4 fragColor;

void main(void) {

    vec3 e = normalize( vec3( worldView * vPosition ) );
    vec3 n = normalize( worldView * vec4(vNormal, 0.0) ).xyz;

    vec3 r = reflect( e, n );
    float m = 2. * sqrt(
        pow( r.x, 2. ) +
        pow( r.y, 2. ) +
        pow( r.z + 1., 2. )
    );
    vec2 vN = r.xy / m + .5;

    vec3 base = texture( refSampler, vN).rgb;

    fragColor = vec4( base, 1. );
}`;
}
