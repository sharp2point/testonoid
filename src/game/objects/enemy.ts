import {
    Animation, Color3, Mesh, Observer,
    PhysicsAggregate, PhysicsMotionType,
    PhysicsShapeType, Quaternion, Scene,
    setAndStartTimer, StandardMaterial, Tools,
    Vector3
} from "@babylonjs/core";
import { collideMask, ENEMYTYPES, GAME } from "../../state/global";
import { EnemyData } from "@/types/game_types";

export class Enemy {
    private mesh: Mesh;
    private scene: Scene;
    private aggregate: PhysicsAggregate | null = null;
    private isDeath = false;
    private animaticMesh: Mesh;
    private animaticObserver: Observer<Scene>;
    private enemyData: EnemyData;

    get Name() {
        return this.enemyData.name;
    }

    constructor(enemyData:EnemyData, scene: Scene) {
        this.enemyData = enemyData;
        
        this.scene = scene;
        this.mesh = (scene.getMeshByName('base-enemy-mesh') as Mesh).clone(this.enemyData.name);
        this.mesh.isVisible = true;
        this.mesh.position = enemyData.position;
        this.mesh.material = (GAME.GameScene.materials.get('enemyMaterial') as StandardMaterial).clone("enemy-body-mt");
        this.mesh.material.alpha = 0;
        this.aggregate = new PhysicsAggregate(this.mesh, PhysicsShapeType.BOX, {
            mass: 10, restitution: 0.1, friction: 1
        });
        this.aggregate.body.setMotionType(PhysicsMotionType.ANIMATED);
        this.aggregate.shape.filterCollideMask = collideMask.groups.enemy;
        this.aggregate.shape.filterMembershipMask = collideMask.enemy;
        //-------------------------------------------------
        this.animaticMesh = (scene.getMeshByName('base-enemy-mesh') as Mesh).clone(`${name}-animatic`);
        this.animaticMesh.isVisible = true;
        this.animaticMesh.position = this.enemyData.position.add(new Vector3(0, 0.1, 0));
        this.animaticMesh.material = (GAME.GameScene.materials.get('enemyMaterial') as StandardMaterial).clone("enemy-animatic-mt");
        //-----------------------------------------------
        this.typeDifinition(this.enemyData.type);

        this.animate();
        this.animaticObserver = this.scene.onBeforeRenderObservable.add(() => {
            this.aggregate.body.setTargetTransform(this.animaticMesh.position.clone(), Quaternion.Identity());
            if (this.animaticMesh.position.z < GAME.dragBox.up - 0.5) {
                this.collideReaction();
            }
        })
    }
    typeDifinition(type: number) {
        switch (type) {
            case ENEMYTYPES.GREEN: {
                (this.animaticMesh.material as StandardMaterial).diffuseColor = new Color3(0, 1, 0);
                break;
            }
            case ENEMYTYPES.BLUE: {
                (this.animaticMesh.material as StandardMaterial).diffuseColor = new Color3(0, 0, 1);
                break;
            }
            case ENEMYTYPES.RED: {
                (this.animaticMesh.material as StandardMaterial).diffuseColor = new Color3(1, 0, 0);
                break;
            }
        }
    }
    animate() {
        const animation = new Animation("animateZ", "position.z", 25, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_RELATIVE);
        const keys = [
            { frame: 0, value: this.animaticMesh.position.z },
            { frame: 50, value: this.animaticMesh.position.z - 1 },
        ]
        animation.setKeys(keys);

        const animationRotX = new Animation("animateRotX", "rotation.x", 25, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_RELATIVE);
        const keysRotX = [
            { frame: 0, value: 0 },
            { frame: 50, value: Tools.ToRadians(-90) },
        ]
        animationRotX.setKeys(keysRotX);

        this.animaticMesh.animations.push(animation);
        this.animaticMesh.animations.push(animationRotX);
        this.scene.beginAnimation(this.animaticMesh, 0, 50, true, 1)
    }

    collideReaction() {
        this.enemyData.position = this.mesh.position.clone();
        setAndStartTimer({
            timeout: 200,
            contextObservable: this.scene.onBeforeRenderObservable,
            breakCondition: () => { return this.isDeath },
            onEnded: (e) => {
                this.dispose();
            },
            onTick: (e) => { },
            onAborted: (e) => { }
        })
        return this.enemyData;
    }
    dispose() {
        GAME.enemiesMap.delete(this.enemyData.name);
        if (GAME.enemiesMap.size === 0) {
            GAME.GameScene.allEnemiesDeathCallback();
        }
        this.scene.onBeforeRenderObservable.remove(this.animaticObserver);
        this.isDeath = true;
        this.aggregate.dispose();
        this.mesh.dispose(false, true);
        this.animaticMesh.dispose(false, true);
    }
}

