import { GAME } from "@/state/global";
import { Color4, ParticleSystem, Scene, Texture, Vector3 } from "@babylonjs/core";

export function initAllPArticles(scene: Scene): Map<string, ParticleSystem> {


    const particles = new Map<string, ParticleSystem>();
    particles.set("enemy-death-up-ps", deathEnemyUpParticle(scene));
    particles.set("enemy-death-down-ps", deathEnemyDownParticle(scene));

    return particles;
}
function deathEnemyUpParticle(scene: Scene) {
    const ps = new ParticleSystem("enemy-death-up-ps", 500, scene);
    ps.particleTexture = new Texture("./public/images/dirt_02.png");
    ps.updateSpeed = 0.05;
    ps.emitRate = 500;
    ps.minSize = 0.1;
    ps.maxSize = 0.8;
    ps.minLifeTime = 0.1;
    ps.maxLifeTime = 1.8;
    ps.gravity = new Vector3(0, 9, 0);
    ps.color1 = new Color4(0.0, 0.1, 0.1, 1.0);
    ps.color2 = new Color4(0.7, 0.1, 0.1, 1.0);
    ps.colorDead = new Color4(0, 0, 0.2, 0.0);
    ps.targetStopDuration = 1;
    ps.disposeOnStop = true;
    return ps;
}
function deathEnemyDownParticle(scene: Scene) {
    const ps = new ParticleSystem("enemy-death-down-ps", 500, scene);
    ps.particleTexture = new Texture("./public/images/dirt_02.png");
    ps.updateSpeed = 0.1;
    ps.emitRate = 500;
    ps.minSize = 0.1;
    ps.maxSize = 0.5;
    ps.minLifeTime = 0.05;
    ps.maxLifeTime = 1.0;
    ps.color1 = new Color4(0.1, 0.1, 0.1, 1.0);
    ps.color2 = new Color4(0.4, 0.3, 0.1, 1.0);
    ps.colorDead = new Color4(0.1, 0.1, 0.1, 0.1);
    ps.gravity = new Vector3(0, 0, 0);
    // ps.isLocal = true;
    ps.targetStopDuration = 1.2;
    ps.disposeOnStop = true;
    return ps
}