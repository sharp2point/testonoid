import { ParticlesEffect } from "../particle_effect";

export default class GameMenu extends HTMLElement {
    private root: ShadowRoot;
    private canvas: HTMLCanvasElement;
    private button: HTMLButtonElement;
    private particle: ParticlesEffect;

    constructor() {
        super();
        this.root = this.attachShadow({ mode: "open" });
        this.root.innerHTML = template();
    }
    connectedCallback() {
        const event = new CustomEvent("on-run-game", {
            bubbles: false,
            cancelable: true,
            detail: 'menu game button event'
        })

        this.button = this.root.querySelector(".liquid-button") as HTMLButtonElement;
        this.button.addEventListener("click", () => {
            this.particle.stopAnimation();
            this.dispatchEvent(event);
        })

        this.canvas = this.root.querySelector("#menu-canvas") as HTMLCanvasElement;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.particle = new ParticlesEffect(this.canvas);
        this.particle.animate(0);

        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.particle.resize();
        })
    }
    disconnectedCallback() {
    }
    toLive() {
        this.particle.animate(0);
    }
}

if (!customElements.get("nice2jam-game-menu")) {
    customElements.define('nice2jam-game-menu', GameMenu);
}

function template() {
    const html = `
        <div class="main-menu">
            <canvas id="menu-canvas"></canvas>
            <header>
            <h1>BallWall</h1>
            <span>arcanoid</span>
            </header>
            <button class="liquid-button">RUN</button>
        </div>
    `
    const css = `
    <style>
    .liquid-button{
        width:200px;
        height:70px;
        cursor:pointer;
        z-index:110;
    }
    #menu-canvas{
        position:absolute;
        top:0;
        left:0;
        width:100vw;
        height:100vh;
        background:transparent;
        pointer-events: none;
    }
    .main-menu {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 100vw;
        height: 100vh;
        background-color: rgb(103, 109, 92);        
    }
    header {
        width: 100%;
        height: 300px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: white;
        z-index: 100;
    }
    header h1 {
        font: 6rem "Impact";
        text-shadow: 3px 3px 15px rgba(30, 30, 30,1);
    }
    header span {
        color: #cdc5c2;
        font: 1.8rem "Impact";
        letter-spacing: 0.9rem;
        margin-top: -3rem;
    }
    @media screen and (max-width: 430px) {
        header h1 {
        font-size: 4.5rem;
        }
        header span {
        font-size: 1.3rem;
        letter-spacing: 0.7rem;
        }
    }
    </style>
    `
    return `${html}${css}`
}