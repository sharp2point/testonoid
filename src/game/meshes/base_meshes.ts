import { MeshBuilder, type Scene } from "@babylonjs/core";

export function initBaseMeshes(scene: Scene) {
    const enemy = MeshBuilder.CreateBox('base-enemy-mesh', { size: 0.9 }, scene);
    enemy.isVisible = false;
    enemy.isEnabled(false);

}