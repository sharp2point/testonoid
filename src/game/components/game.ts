import { GAME, GAMESIGNALS, USER } from "@/state/global";
import { GameScene } from "../game_scene";
import { initCore } from "../init";
import { UserState } from "@/types/game_types";
import CameraControl from "@/debug/component/camera_control/cameraControl";
import { HavokPlugin, Scene, Tools } from "@babylonjs/core";
import ScoreboardComponent from "./scoreboard";
import { Enemy } from "../objects/enemy";
import { DEBUG } from "@/state/debug";

export default class GameComponent extends HTMLElement {
    private root: ShadowRoot;
    private canvas: HTMLCanvasElement;
    private menu: HTMLElement;
    onMenuEvent: CustomEvent;
    private scoreboard: ScoreboardComponent;

    get Scoreboard() {
        return this.scoreboard;
    }

    constructor() {
        super();
        this.root = this.attachShadow({ mode: 'open' });
        this.root.innerHTML = template();
        new ScoreboardComponent();
    }
    connectedCallback() {
        this.scoreboard = this.root.querySelector(".scoreboard");

        this.onMenuEvent = new CustomEvent('on-run-menu', {
            bubbles: false,
            cancelable: true,
            detail: 'Run Menu Custom Event'
        });
        const onWinEvent = new CustomEvent('on-win-game', {
            bubbles: false,
            cancelable: true,
            detail: 'Win Game Custom Event'
        });
        const onLooseEvent = new CustomEvent('on-loose-game', {
            bubbles: false,
            cancelable: true,
            detail: 'Loose Game Custom Event'
        });

        this.canvas = this.root.querySelector("#game");
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.menu = this.root.querySelector("nav");

        this.menu.addEventListener('click', (e) => {
            const target = (e.target as HTMLElement).dataset.target;
            switch (target) {
                case "menu": {
                    this.dispatchEvent(this.onMenuEvent);
                    break;
                }
                case "win": {
                    this.dispatchEvent(onWinEvent)
                    break;
                }
                case "loose": {
                    this.dispatchEvent(onLooseEvent)
                    break;
                }
                case "debug": {
                    this.runDebug();
                    break;
                }
                default: {
                    this.dispatchEvent(this.onMenuEvent)
                    break;
                }
            }
            GAME.Engine.stopRenderLoop();
        });
    }
    initGame(USER: UserState) {
        initCore(this.canvas).then((state) => {
            if (GAME.Scene) {
                GAME.GameScene.dispose();
            }
            GAME.enemiesMap = new Map<string, Enemy>();
            const gameScene = new GameScene(GAME, USER);
            if (DEBUG.enemyGenerator) {
                gameScene.startEnemyGenerator();
            }
            GAME.GameScene = gameScene;
            GAME.Engine.runRenderLoop(() => {
                GAME.Scene.render();
            })
        });
    }
    loadLevel(USER: UserState) {
        if (GAME.Engine) {
            GAME.Engine.stopRenderLoop();
        }
        this.initGame(USER);
    }
    runDebug() {
        const cameraControl = new CameraControl(GAME.Camera);
        cameraControl.addEventListener('on-camera-control', (e) => {
            GAME.Camera.position = e.detail.position;
            GAME.Camera.target = e.detail.target;
            GAME.Camera.fov = Tools.ToRadians(e.detail.fov);
        })
        this.root.appendChild(cameraControl);
        console.log("RunDebug");
    }

}
if (!customElements.get('nice2jam-game-app')) {
    customElements.define('nice2jam-game', GameComponent);
}

function template() {
    const html = `
        <canvas id="game"></canvas>
        <nav>
            <button class="menu-button" data-target="menu">Go to Menu</button>
            <button class="menu-button" data-target="win">WIN</button>
            <button class="menu-button" data-target="loose">LOOSE</button>
            <button class="menu-button" data-target="debug">Debug</button>
        </nav>
        <nice2jam-scoreboard-component class="scoreboard"></nice2jam-scoreboard-component>
    `;
    const css = `
        <style>
        :host{
            position:absolute;
            top:0;
            left:0;
            width:100vw;
            height:100vh;
            z-index:1;
        }
        #game{
            position:absolute;
            top:0;
            left:0;
            width:100vw;
            height:100vh;
        }
        nav{
            position:absolute;
            top:0;
            left:0;
            display:flex;
            flex-direction:raw;
            gap:1rem;
            justify-content:start;
            align-items:center;
            z-index:2;
            margin:1rem;
            padding:1rem;
            border-radius:0.3rem;
        }
        .scoreboard{
            position:absolute;
            top:0;
            left:calc(100%/2 - 100px);
            z-index:2;
        }
        </style>
    `;
    return `${html}${css}`;
}