import { GAME } from "../../state/global";
import {
    Color3, GlowLayer, Mesh, MeshBuilder,
    PhysicsAggregate, PhysicsMotionType, PhysicsShapeType,
    Quaternion, Scene, StandardMaterial,
    Tools, TransformNode, Vector3
} from "@babylonjs/core";

export class Shield {
    private shield: Mesh;
    private aggregate: PhysicsAggregate | null = null;
    private physics = {
        mass: 100, friction: 1, restitution: 1
    }
    private sizes = {
        width: 3.5, height: 1, depth: 0.25
    }
    private controler: Mesh | null = null;
    private transformNode: TransformNode;
    private isPointerDown = false;
    private glowLayer: GlowLayer;

    get pointerDown() {
        return this.isPointerDown;
    }
    set pointerDown(val: boolean) {
        this.isPointerDown = val;
    }
    get control() {
        return this.transformNode;
    }
    get body() {
        return this.aggregate!.body;
    }
    get position() {
        return this.transformNode.position.clone();
    }
    set position(val: Vector3) {
        try {
            if (val) {
                const pos = Vector3.Clamp(val,
                    new Vector3(GAME.dragBox.left + 1.0, this.transformNode.position.y, GAME.dragBox.down),
                    new Vector3(GAME.dragBox.rigth - 1.5, this.transformNode.position.y, GAME.dragBox.up))
                    .add(new Vector3(0, 0, 0));
                this.transformNode.position = pos;
            }
        } catch (err) {
            console.log("Shield Position Error:", err)
        }
    }

    constructor(name: string, position: Vector3) {
        this.transformNode = new TransformNode("shield-tn");
        this.shield = MeshBuilder.CreateBox(name, { ...this.sizes, wrap: true, updatable: true }, GAME.Scene);
        this.shield.setParent(this.transformNode);
        this.initControler();
        this.transformNode.position = new Vector3(position.x, this.sizes.height / 2, position.z);
        this.initMaterials();
        this.initEffects();
        this.appendPhysics();
        if (this.aggregate) {
            this.aggregate.body.setCollisionCallbackEnabled(true);
            this.aggregate.body.setCollisionEndedCallbackEnabled(true);

            this.shield.onBeforeRenderObservable.add(() => {
                if (this.aggregate) {
                    this.aggregate!.body.setTargetTransform(this.transformNode.position, Quaternion.Identity());
                }
            })
        }

    }
    appendPhysics() {
        this.aggregate = new PhysicsAggregate(this.shield, PhysicsShapeType.BOX, this.physics, GAME.Scene);
        this.aggregate.body.setMotionType(PhysicsMotionType.ANIMATED);
    }
    private initControler() {
        this.controler = MeshBuilder.CreatePlane("shield-control-plane", { width: 5.5, height: 2.5, updatable: true }, GAME.Scene);
        this.controler.position = new Vector3(0, 1.1, -0.5);
        this.controler.setParent(this.transformNode);
        this.controler.isPickable = true;
        this.controler.rotation.x = Tools.ToRadians(90);
    }
    private initMaterials() {
        const shield = new StandardMaterial(`shield-mt`, GAME.Scene);
        shield.emissiveColor = new Color3(0.7, 0.5, 0.1);
        shield.alpha = 0.8;
        this.shield.material = shield;

        const control = new StandardMaterial(`shield-control-mt`, GAME.Scene);
        control.diffuseColor = new Color3(1, 1, 1);
        control.alpha = 0.3;
        if (this.controler) {
            this.controler.material = control;
        }
    }
    private initEffects() {
        this.glowLayer = new GlowLayer("Shield-Glow", GAME.Scene);
        this.glowLayer.addIncludedOnlyMesh(this.shield);
        this.glowLayer.intensity = 1.0;
    }
    dispose() {
        this.shield.dispose(false, true);
        this.aggregate.dispose();
        this.transformNode.dispose();
        this.controler.dispose(false, true);
        this.glowLayer.dispose();
    }
}