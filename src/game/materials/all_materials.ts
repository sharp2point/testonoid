import { Color3, Material, StandardMaterial, type Scene } from "@babylonjs/core";

export function initAllMaterials(scene: Scene):Map<string,Material> {
    const groundMaterial = new StandardMaterial(`ground-mt`, scene);
    groundMaterial.diffuseColor = Color3.FromHexString("#fefade");
    groundMaterial.maxSimultaneousLights = 10;

    const roofMaterial = new StandardMaterial("roof-mt", scene);
    roofMaterial.diffuseColor = new Color3(0, 0, 0);
    roofMaterial.alpha = 0.01;

    const wallMaterial = new StandardMaterial("wall-mt", scene);
    wallMaterial.diffuseColor = Color3.FromHexString("#6c6874");;
    wallMaterial.alpha = 1;

    const ballMaterial = new StandardMaterial("ball-mt", scene);
    ballMaterial.diffuseColor = Color3.FromHexString("#ff6874");;
    ballMaterial.alpha = 1;

    const enemyMaterial = new StandardMaterial("enemy-mt", this.scene);
    enemyMaterial.diffuseColor = new Color3(1, 0, 0);
    enemyMaterial.alpha = 0.5;
    //-----------------------------------------------------
    const materialsMap = new Map();
    materialsMap.set('groundMaterial', groundMaterial);
    materialsMap.set('roofMaterial', roofMaterial);
    materialsMap.set('wallMaterial', wallMaterial);
    materialsMap.set('ballMaterial', ballMaterial);
    materialsMap.set('enemyMaterial', enemyMaterial);
    return materialsMap;
}

