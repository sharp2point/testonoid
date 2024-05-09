import {
    Color3, Color4, Constants, DirectionalLight, Engine, HavokPlugin, HemisphericLight,
    Material,
    Mesh, MeshBuilder, ParticleSystem, PhysicsAggregate, PhysicsMotionType, PhysicsShapeType,
    Scene, ShaderLanguage, ShaderMaterial, ShadowGenerator, StandardMaterial, Texture, TextureSampler, Tools, TransformNode,
    UniversalCamera, Vector3,
    type IShadowLight
} from "@babylonjs/core";
import { cameraSettings, createFrame } from "./utils";
import { Ball } from "./objects/ball";
import { Shield } from "./objects/shield";

import { initAllMaterials } from "./materials/all_materials";
import { LevelBuilder } from "./level_builder";
import { initBaseMeshes } from "./meshes/base_meshes";
import { collideMask, COMBODESCRIPTION, COMBOTYPES, ENEMYTYPES, GAME, GAMESIGNALS, USER } from "../state/global";
import type { EnemyData, GameState, UserState } from "../types/game_types";
import { EnemyGenerator } from "./enemy_generator";
import type { Enemy } from "./objects/enemy";
import NotifyComponent from "./components/notify";
import { DEBUG } from "@/state/debug";
import { ComboFutures } from "./futures/combo";
import FlashNotifyConmponent from "./components/flash_notify";
import { loadFX } from "./fx/shaders";
import { enemyDeathShader } from "./fx/enemy_death_shader";
import { initAllPArticles } from "./materials/all_particles";

export class GameScene {
    private scene: Scene;
    private camera: UniversalCamera;
    private ball: Ball | null = null;
    private shield: Shield | null = null;
    private allMaterials: Map<string, Material>;
    private allParticles: Map<string, ParticleSystem>;
    private enemyGenerator: EnemyGenerator;

    get gameScene() {
        return this.scene;
    }
    get materials() {
        return this.allMaterials;
    }
    get particles() {
        return this.allParticles;
    }

    constructor(game_state: GameState, user_state: UserState) {
        this.scene = new Scene(game_state.Engine as Engine);
        this.scene.enablePhysics(game_state.Gravity, game_state.HVK as HavokPlugin);
        this.scene.clearColor = Color4.FromHexString("#676D5Cff");
        this.scene.ambientColor = new Color3(1, 1, 1);
        GAME.Scene = this.scene;

        this.camera = new UniversalCamera("main-scene-camera", new Vector3(0, 0, 0), this.scene);
        this.camera.position = new Vector3(0, 15, -10);
        this.camera.target = Vector3.Zero();
        this.camera.fov = Tools.ToRadians(80);
        GAME.Camera = this.camera;
        cameraSettings();

        const sceneLight = this.addLight(this.scene);

        this.allMaterials = initAllMaterials(this.scene);
        this.allParticles = initAllPArticles(this.scene);
        // loadFX();
        // const shaderMaterial = this.initShaderMaterial();
        // enemyDeathShader();
        this.createWorld(this.scene);
        this.dragBoxLines();

        this.shield = new Shield("shield", new Vector3(0, 0, -9));

        this.ball = new Ball("ball", this.collideEnemyCallback);
        this.ball.material = this.allMaterials.get('ballMaterial') as StandardMaterial
        this.appendShadows(sceneLight, this.ball.mesh);

        initBaseMeshes(this.scene);
        //new LevelBuilder(user_state.level, this.scene, this.winCallback);

        this.enemyGenerator = new EnemyGenerator(this.scene, 10);

        GAME.comboFutures = new ComboFutures(this.comboCallback);

        this.addSceneGameEvents();

        let time = 0;
        this.scene.onBeforeRenderObservable.add(() => {
            // shaderMaterial.setFloat("time", time);
            // time += 0.02;

            // shaderMaterial.setVector3("cameraPosition", GAME.Scene.activeCamera.position);
            if (this.ball && this.shield) {
                if (!this.ball.isRun) {
                    this.ball.ballJoinShield(this.shield);
                }
            }
        })
        this.scene.onKeyboardObservable.add(async (info) => {
            switch (info.event.key) {
                case "w": {
                    this.ball!.run();
                    break;
                }
                case "b": {
                    const flashNotify = new FlashNotifyConmponent(
                        COMBODESCRIPTION.THREE_EQ_SEQ_RED,
                        GAME.PlaceGame,
                        { timeLive: 2500, timeout: 1.5 });
                    break;
                }
            }
            if (info.event.key === 'i' && info.event.altKey) {
                const DBGL = await import("@babylonjs/core/Debug/debugLayer");
                const DBG = await import("@babylonjs/inspector");
                DBG.Inspector.Show(GAME.Scene, {
                    globalRoot: document.querySelector("#app")
                });
                const explorer = document.querySelector("#scene-explorer-host") as HTMLElement;
                explorer.style.zIndex = '100';
                const inspector = document.querySelector("#inspector-host") as HTMLElement;
                inspector.style.zIndex = '100';

            }
        });
        this.scene.onDisposeObservable.add(() => {
            this.scene.onBeforeRenderObservable.clear();
            this.scene.onKeyboardObservable.clear();
            this.scene.onDisposeObservable.clear();
        })
    }

    changeAmbientColor(color: Color3) {
        this.scene.ambientColor = color;
    }
    changeClearColor(color: Color4) {
        this.scene.clearColor = color;
    }
    addLight(scene: Scene) {
        const hemiEnemyLight = new HemisphericLight("enemy-hemilight", new Vector3(0, 1, -8), scene);
        hemiEnemyLight.diffuse = new Color3(1, 1, 1);
        hemiEnemyLight.specular = new Color3(1, 1, 1);
        hemiEnemyLight.intensity = 1;

        const dirLight = new DirectionalLight("main-scene-dirlight", new Vector3(0, -1, 0), scene);
        dirLight.position = new Vector3(0, 5, 0);
        dirLight.diffuse = new Color3(1, 1, 1);
        dirLight.specular = new Color3(0.2, 0.2, 0.2);
        dirLight.intensity = 0.1;
        return dirLight;
    }
    createWorld(scene: Scene) {
        const world_node = new TransformNode("world-transform-node", scene);
        const ground = MeshBuilder.CreateGround("ground", {
            width: GAME.gameBox.width,
            height: GAME.gameBox.height
        }, scene);
        ground.receiveShadows = true;

        const ground_aggregate = new PhysicsAggregate(ground, PhysicsShapeType.CONVEX_HULL, {
            mass: 10000,
            restitution: 0,
            friction: 0.5
        }, scene);
        ground_aggregate.shape.filterCollideMask = collideMask.groups.ground;
        ground_aggregate.shape.filterMembershipMask = collideMask.ground;
        ground_aggregate.body.setMotionType(PhysicsMotionType.STATIC);

        // --------- ROOF -------------->
        const roof = MeshBuilder.CreatePlane("roof", {
            width: GAME.gameBox.width + 2,
            height: GAME.gameBox.height + 2,
        }, scene);
        roof.rotation.x = Tools.ToRadians(90);
        roof.position.y = 0.7;

        const roof_aggregate = new PhysicsAggregate(roof, PhysicsShapeType.BOX, {
            mass: 100, friction: 0, restitution: 0
        }, scene);
        roof_aggregate.body.setMotionType(PhysicsMotionType.STATIC);
        roof_aggregate.shape.filterMembershipMask = collideMask.roof;
        roof_aggregate.shape.filterCollideMask = collideMask.groups.roof;

        const roof2 = MeshBuilder.CreatePlane("roof2", {
            width: GAME.gameBox.width + 2,
            height: GAME.gameBox.height + 2,
        }, scene);
        roof2.rotation.x = Tools.ToRadians(90);
        roof2.position.y = 0.9;

        const roof2_aggregate = new PhysicsAggregate(roof, PhysicsShapeType.BOX, {
            mass: 100, friction: 0, restitution: 0
        }, scene);
        roof2_aggregate.body.setMotionType(PhysicsMotionType.STATIC);
        roof2_aggregate.shape.filterMembershipMask = collideMask.roof;
        roof2_aggregate.shape.filterCollideMask = collideMask.groups.roof;

        //---------- WALLS ------------->

        ground.parent = world_node;

        const wall_coord = [
            new Vector3(-10, -13, 0),
            new Vector3(10, -13, 0),
            new Vector3(10, 13, 0),
            new Vector3(-10, 13, 0),
        ];
        const profilePoints = [
            new Vector3(-0.5, 1.5, 0),
            new Vector3(-0.5, -1.5, 0),
            new Vector3(0.5, -1.5, 0),
            new Vector3(0.5, 0.2, 0),
            new Vector3(0.2, 0.2, 0),
            new Vector3(0.2, 1.5, 0)
        ];
        const walls = createFrame("wall", { path: wall_coord, profile: profilePoints }, this.scene);
        walls.receiveShadows = true;
        walls.rotation.x = Tools.ToRadians(90);
        walls.setParent(world_node);
        const wall_aggregate = new PhysicsAggregate(walls, PhysicsShapeType.MESH, {
            mass: 100000, restitution: 0.5, friction: 0.5
        }, this.scene)
        wall_aggregate.body.setMotionType(PhysicsMotionType.STATIC);
        wall_aggregate.shape.filterMembershipMask = collideMask.ground;
        wall_aggregate.shape.filterCollideMask = collideMask.groups.ground;

        const wall_aggregate2 = new PhysicsAggregate(walls, PhysicsShapeType.MESH, {
            mass: 100000, restitution: 0.5, friction: 0.5
        }, this.scene)
        wall_aggregate2.body.setMotionType(PhysicsMotionType.STATIC);
        wall_aggregate2.shape.filterMembershipMask = collideMask.ground;
        wall_aggregate2.shape.filterCollideMask = collideMask.groups.ground;
        world_node.position.x -= 0.2;
        //--------------------------------------------->  
        ground.receiveShadows = true;
        walls.receiveShadows = true;

        ground.material = this.allMaterials.get('groundMaterial') as StandardMaterial;
        // ground.material = GAME.Scene.getMaterialByName("shader") as ShaderMaterial;
        roof.material = this.allMaterials.get('roofMaterial') as StandardMaterial;
        roof2.material = this.allMaterials.get('roofMaterial') as StandardMaterial;
        walls.material = this.allMaterials.get('wallMaterial') as StandardMaterial;

        return world_node;
    }
    dragBoxLines() {
        MeshBuilder.CreateLines("center-line", {
            points: [new Vector3(GAME.dragBox.left, 0.1, 0),
            new Vector3(0, 0.1, 0),
            new Vector3(GAME.dragBox.rigth, 0.1, 0)],
            colors: [new Color4(0.5, 0.5, 0.5, 0.3), new Color4(0.5, 0.5, 0.5, 0.3), new Color4(0.5, 0.5, 0.5, 0.3)]
        }, this.scene);
        MeshBuilder.CreateLines("up-line", {
            points: [new Vector3(GAME.dragBox.left, 0.1, GAME.dragBox.up),
            new Vector3(0, 0.1, GAME.dragBox.up),
            new Vector3(GAME.dragBox.rigth, 0.1, GAME.dragBox.up)],
            colors: [new Color4(0.3, 0.5, 0.5, 1), new Color4(0.9, 0.5, 0.5, 1), new Color4(0.3, 0.5, 0.5, 1)]
        }, this.scene);
        MeshBuilder.CreateLines("down-line", {
            points: [new Vector3(GAME.dragBox.left, 0.1, GAME.dragBox.down),
            new Vector3(0, 0.1, GAME.dragBox.down),
            new Vector3(GAME.dragBox.rigth, 0.1, GAME.dragBox.down)],
            colors: [new Color4(0.3, 0.5, 0.5, 1), new Color4(0.9, 0.5, 0.5, 1), new Color4(0.3, 0.5, 0.5, 1)]
        }, this.scene)
    }
    appendShadows(light: IShadowLight, mesh: Mesh) {
        const shadowGen = new ShadowGenerator(512, light);
        shadowGen.useKernelBlur = true;
        shadowGen.useExponentialShadowMap = true
        shadowGen.addShadowCaster(mesh);
    }
    addSceneGameEvents() {
        this.scene.onPointerDown = () => {
            if (this.shield && this.ball) {
                if (GAME.gameState === GAMESIGNALS.RUN && !this.shield.pointerDown) {
                    const pic = this.scene.pick(this.scene.pointerX, this.scene.pointerY, () => true);
                    this.shield.pointerDown = true;
                    this.shield.position = pic.pickedPoint as Vector3;
                }
            }
        };
        this.scene.onPointerUp = () => {
            if (this.shield && this.ball) {
                if (GAME.gameState === GAMESIGNALS.RUN && this.shield.pointerDown) {
                    this.shield.pointerDown = false;
                    if (!this.ball.isRun) {
                        this.ball.run();
                    }
                }
            }
        }
        this.scene.onPointerMove = () => {
            if (this.shield && this.ball) {
                if (GAME.gameState === GAMESIGNALS.RUN && this.shield.pointerDown) {
                    const pic = this.scene.pick(this.scene.pointerX, this.scene.pointerY, () => true);
                    this.shield.position = pic.pickedPoint as Vector3;
                }
            }
        }
    }
    winCallback() {
        GAME.gameState = GAMESIGNALS.GAMEWIN;
    }
    initShaderMaterial() {
        const shaderMaterial = new ShaderMaterial("shader", GAME.Scene, {
            vertex: "custom",
            fragment: "custom",
        },
            {
                attributes: ["position", "normal", "uv"],
                uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"],
                uniformBuffers: GAME.Engine.isWebGPU ? ["Scene", "Mesh"] : undefined,
                shaderLanguage: GAME.Engine.isWebGPU ? ShaderLanguage.WGSL : ShaderLanguage.GLSL
            }
        );
        const refTexture = new Texture("./public/images/ref.jpg", GAME.Scene);
        refTexture.wrapU = Texture.CLAMP_ADDRESSMODE;
        refTexture.wrapV = Texture.CLAMP_ADDRESSMODE;

        const mainTexture = new Texture("./public/images/amiga.jpg", GAME.Scene);

        shaderMaterial.setTexture("refSampler", refTexture);
        shaderMaterial.setTexture("textureSampler", mainTexture);

        // if (GAME.Engine.isWebGPU) {
        //     shaderMaterial.setTexture("diffuse", mainTexture);
        //     const sampler = new TextureSampler();
        //     sampler.setParameters(); // use the default values
        //     sampler.samplingMode = Constants.TEXTURE_NEAREST_SAMPLINGMODE;
        //     shaderMaterial.setTextureSampler("mySampler", refTexture);
        // }
        shaderMaterial.setFloat("time", 0);
        shaderMaterial.setVector3("cameraPosition", Vector3.Zero());
        shaderMaterial.backFaceCulling = false;
        return shaderMaterial;
    }
    startEnemyGenerator() {
        this.enemyGenerator.start(this.getEnemyCountCallback);
    }
    allEnemiesDeathCallback() {
        const notify = new NotifyComponent({
            header: "Wave is Win!",
            description: "All enemy is Death!...",
        });
        GAME.PlaceGame.appendChild(notify);
        notify.addEventListener('on-ok-event', () => {
            GAME.GameApp.dispatchEvent(GAME.GameApp.onMenuEvent);
        })
    }
    getEnemyCountCallback(count: number) {
        if (count === 1) {
            console.log("All Enemy is Counted: ");
        }
    }
    scoringEnemy(enemyType: number) {
        switch (enemyType) {
            case ENEMYTYPES.RED.type: {
                USER.scores += ENEMYTYPES.RED.score;
                break;
            }
            case ENEMYTYPES.GREEN.type: {
                USER.scores += ENEMYTYPES.GREEN.score;
                break;
            }
            case ENEMYTYPES.BLUE.type: {
                USER.scores += ENEMYTYPES.BLUE.score;
                break;
            }
        }
    }
    collideEnemyCallback(enemyData: EnemyData) {
        // функция вызывается объектом Ball при столкновении с Enemy
        GAME.comboFutures.initCombo(enemyData.type);
        GAME.GameScene.scoringEnemy(enemyData.type);
        GAME.GameApp.Scoreboard.Score = `${USER.scores}`;
    }
    comboCallback(comboType: number) {
        GAME.GameApp.Scoreboard.Combo = `${comboType}`;
        let flashNotify: FlashNotifyConmponent;
        switch (comboType) {
            case COMBOTYPES.THREE_EQ_SEQ_RED: {
                flashNotify = new FlashNotifyConmponent(
                    COMBODESCRIPTION.THREE_EQ_SEQ_RED,
                    GAME.PlaceGame, { timeLive: 2500, timeout: 1.5 });
                break;
            }
            case COMBOTYPES.THREE_EQ_SEQ_GREEN: {
                flashNotify = new FlashNotifyConmponent(
                    COMBODESCRIPTION.THREE_EQ_SEQ_GREEN,
                    GAME.PlaceGame, { timeLive: 2500, timeout: 1.5 });
                break;
            }
            case COMBOTYPES.THREE_EQ_SEQ_BLUE: {
                flashNotify = new FlashNotifyConmponent(
                    COMBODESCRIPTION.THREE_EQ_SEQ_BLUE,
                    GAME.PlaceGame, { timeLive: 2500, timeout: 1.5 });
                break;
            }
        }
    }
    dispose() {
        this.shield.dispose();
        this.ball.dispose();
        this.scene.dispose();
    }
}