import {
    HavokPlugin, IBasePhysicsCollisionEvent, IPhysicsCollisionEvent,
    Material, Mesh, MeshBuilder, Observable, Observer, PhysicsAggregate,
    PhysicsMotionType, PhysicsShapeType,
    Quaternion, setAndStartTimer, Tools, Vector3
} from "@babylonjs/core";
import type { Shield } from "./shield";
import { collideMask, GAME, GAMESIGNALS } from "../../state/global";
import { EnemyData } from "@/types/game_types";


export class Ball {
    private _isRun = false;
    private radius = 0.3;
    private ball: Mesh;
    private aggregate: PhysicsAggregate | null = null;
    private physics = {
        mass: 10,
        friction: 0.9,
        restitution: 1
    }
    private speedLimits = {
        max: 40,
        min: 20,
    }
    private initPosition = new Vector3(0, 0.35, -5.5);
    private initImpulse = new Vector3(0, 0, 200);
    private initSpeed = new Vector3(0, 0, 500);
    private ballRunObserver: Observer<Mesh> | null = null;
    private collideObservable: Observable<IPhysicsCollisionEvent>;
    private collideEndObservable: Observable<IBasePhysicsCollisionEvent>;
    private correctAngleImpulse = 3;

    get mesh() {
        return this.ball;
    }
    get isRun() {
        return this._isRun;
    }
    get body() {
        return this.aggregate!.body;
    }
    get position() {
        return this.ball.position.clone();
    }
    set position(val: Vector3) {
        this.ball.position = val;
    }
    set material(val: Material) {
        this.ball.material = val;
    }

    constructor(name: string, collideEnemyCallback: (enemyData: EnemyData) => void) {
        this.ball = MeshBuilder.CreateSphere(name, { diameter: this.radius * 2, segments: 8 }, GAME.Scene);
        this.ball.position = this.initPosition;
        this.ball.receiveShadows = true;
        this.appendPhysics();
        this.initColliderObservable(collideEnemyCallback);
    }
    private appendPhysics() {
        this.aggregate = new PhysicsAggregate(this.ball, PhysicsShapeType.SPHERE, this.physics, GAME.Scene);
        this.aggregate.body.setMotionType(PhysicsMotionType.ANIMATED);
        this.aggregate.shape.filterMembershipMask = collideMask.ball;
        this.aggregate.shape.filterCollideMask = 0;
        this.aggregate.body.setCollisionCallbackEnabled(true);
        this.aggregate.body.setCollisionEndedCallbackEnabled(true);
    }
    reset() {
        this._isRun = false;
        if (this.aggregate) {
            (GAME.HVK as HavokPlugin).removeBody(this.aggregate.body);
        }
        if (this.ballRunObserver) {
            this.ball.onBeforeDrawObservable.remove(this.ballRunObserver);
        }
        this.ball.position = this.initPosition;
        this.appendPhysics();
    }
    run() {
        this._isRun = true;
        setAndStartTimer({
            timeout: 200,
            contextObservable: GAME.Scene.onBeforeRenderObservable,
            onEnded: () => {
                if (this.aggregate) {
                    this.aggregate.body.setMotionType(PhysicsMotionType.DYNAMIC);
                    this.aggregate.shape.filterCollideMask = collideMask.groups.ball;
                    this.aggregate.body.setAngularVelocity(new Vector3(1, 0, 1))
                    this.aggregate.body.applyImpulse(this.initImpulse, this.ball.position);
                    this.aggregate.body.applyForce(this.initSpeed, this.ball.position);
                }
                this.ballRunObserver = this.ball.onBeforeRenderObservable.add(() => this.onRunObserver());
            }
        });
    }
    velocityControl() {
        if (this.aggregate) {
            const length = this.aggregate.body.getLinearVelocity().length();

            if (length < this.speedLimits.min) {
                this.aggregate.body.applyImpulse((this.aggregate.body.getLinearVelocity().multiply(new Vector3(1.1, 0, 1.1))), this.ball.getAbsolutePosition());
            } else if (length > this.speedLimits.max) {
                this.aggregate.body.applyImpulse((this.aggregate.body.getLinearVelocity().multiply(new Vector3(-1.1, 0, -1.1))), this.ball.getAbsolutePosition());
            }
        }
    }
    clearBallVelocityY() {
        if (this.aggregate) {
            this.aggregate.body.setLinearVelocity(this.aggregate.body.getLinearVelocity().clone().multiply(new Vector3(1, 0, 1)))
        }
    }
    ballJoinShield(shield: Shield) {
        if (this.aggregate) {
            this.aggregate.body.setTargetTransform(shield.position.add(new Vector3(0, 0.0, 0.5)), Quaternion.Identity());
        }
    }
    private onRunObserver() {
        if (GAME.gameState === GAMESIGNALS.RUN && this._isRun) {
            this.velocityControl();
            this.clearBallVelocityY();
        }
    }
    initColliderObservable(collideEnemyCallback: (enemyData: EnemyData) => void) {
        this.collideObservable = this.aggregate.body.getCollisionObservable();
        this.collideEndObservable = this.aggregate.body.getCollisionEndedObservable();


        this.collideObservable.add((e) => {
            const collideAgainst = e.collidedAgainst.transformNode;
            if (collideAgainst.name.includes('wall')) {
                this.fixZeroBounceAngle(); // менять угол при угле падения меньше 5 градусов
            }
        });

        this.collideEndObservable.add((e) => {
            const collideAgainst = e.collidedAgainst.transformNode;
            if (collideAgainst.name.includes('enemy')) {
                if (GAME.enemiesMap?.get(collideAgainst.name)) {
                    const enemyDate = GAME.enemiesMap?.get(collideAgainst.name)?.collideReaction();
                    collideEnemyCallback(enemyDate);// уведомить сцену о столкновении с Enemy
                }
            }
        });
    }
    dispose() {
        this.ball.onBeforeRenderObservable.clear();
        this.collideObservable.clear();
        this.collideEndObservable.clear();
        this.mesh.getPhysicsBody().dispose();
        this.aggregate.dispose();
        this.mesh.dispose(false, true);

    }
    fixZeroBounceAngle() {
        let lin = this.aggregate.body.getLinearVelocity().normalize();
        const pos = this.mesh.getAbsolutePosition();
        const reflectForward = Vector3.Reflect(lin, Vector3.Forward());
        //---------------------------------------------------------------

        const angle = Vector3.GetAngleBetweenVectors(lin, reflectForward, Vector3.Up());
        if (Math.abs(Tools.ToDegrees(angle)) < 5) {
            if (lin.x > 0 && lin.z > 0) {
                this.aggregate.body.applyImpulse(new Vector3(this.correctAngleImpulse, 0, this.correctAngleImpulse), new Vector3(0, 0, 0))
            } else if (lin.x > 0 && lin.z < 0) {
                this.aggregate.body.applyImpulse(new Vector3(this.correctAngleImpulse, 0, -this.correctAngleImpulse), new Vector3(0, 0, 0))
            } else if (lin.x < 0 && lin.z > 0) {
                this.aggregate.body.applyImpulse(new Vector3(-this.correctAngleImpulse, 0, this.correctAngleImpulse), new Vector3(0, 0, 0))
            } else if (lin.x < 0 && lin.z < 0) {
                this.aggregate.body.applyImpulse(new Vector3(-this.correctAngleImpulse, 0, -this.correctAngleImpulse), new Vector3(0, 0, 0))
            }
        }
    }
    // debugPhysicsBug() {
    //     let lin = this.aggregate.body.getLinearVelocity().normalize();
    //     const pos = this.mesh.getAbsolutePosition();
    //     const reflectForward = Vector3.Reflect(lin, Vector3.Forward());
    //     //---------------------------------------------------------------

    //     const angle = Vector3.GetAngleBetweenVectors(lin, reflectForward, Vector3.Up());
    //     //const arr = [pos, pos.add(lin)]
    //     // if (!this.liinVelForwardLine) {
    //     //     draw.call(this, arr);
    //     // } else {
    //     //     (this.liinVelForwardLine as LinesMesh).dispose();
    //     //     draw.call(this, arr);
    //     // }

    //     if (Math.abs(Tools.ToDegrees(angle)) < 5) {
    //         if (lin.x > 0 && lin.z > 0) {
    //             this.aggregate.body.applyImpulse(new Vector3(this.correctAngleImpulse, 0, this.correctAngleImpulse), new Vector3(0, 0, 0))
    //         } else if (lin.x > 0 && lin.z < 0) {
    //             this.aggregate.body.applyImpulse(new Vector3(this.correctAngleImpulse, 0, -this.correctAngleImpulse), new Vector3(0, 0, 0))
    //         } else if (lin.x < 0 && lin.z > 0) {
    //             this.aggregate.body.applyImpulse(new Vector3(-this.correctAngleImpulse, 0, this.correctAngleImpulse), new Vector3(0, 0, 0))
    //         } else if (lin.x < 0 && lin.z < 0) {
    //             this.aggregate.body.applyImpulse(new Vector3(-this.correctAngleImpulse, 0, -this.correctAngleImpulse), new Vector3(0, 0, 0))
    //         }
    //     }

    //     function draw(points: Array<Vector3>) {
    //         this.liinVelForwardLine = MeshBuilder.CreateLines("debugLinVel", {
    //             points: points,
    //             colors: [new Color4(0.5, 0.1, 0.1, 1), new Color4(0.5, 0.1, 0.1, 1)]
    //         }, GAME.Scene);
    //     }

    // }
}