export default class ScoreboardComponent extends HTMLElement {
    private points: number = 0;
    private root: ShadowRoot;
    private score: HTMLElement;
    private combo: HTMLElement;

    set Score(val: string) {
        this.score.innerText = val;
    }
    
    set Combo(val: string) {
        this.combo.innerText = val;
    }

    constructor(score:number) {
        super();
        this.root = this.attachShadow({ mode: 'open' });
        this.root.innerHTML = template(score);
    }
    connectedCallback() {
        this.score = this.root.querySelector("#score");
        this.combo = this.root.querySelector("#combo");
    }
    addScore(val: number) {
        this.score.innerText = `${parseInt(this.score.innerText)+val}`;
    }
}

if (!customElements.get('nice2jam-scoreboard-component')) {
    customElements.define('nice2jam-scoreboard-component', ScoreboardComponent);
}

function template(score:number) {
    const html = `
    <div class="place points-place">
        <h1>Points: </h1>
        <span id="score">${score}</span>
    </div>
    <div class="place combo-place">
        <h1>Combo: </h1>
        <span id="combo">0000</span>
    </div>
    `;
    const css = `
    <style>
    :host{
        min-width:200px;
        min-height:70px;
        display: flex;
        flex-direction: row;
        gap:0.25rem;
        align-items: center;
        justify-content: center;
    }
    .place{
        width:100px;
        display:flex;
        flex-direction:column;
        justify-content:space-between;
        align-items:center;
        padding:0.25rem;
        border:1px solid white;
        background:rgba(100,100,100,0.8);
        border-radius:0.5rem;
    }
    h1{
        font:1.25rem bold,Impact;
        color:white;
    }
    #score, #combo{
        font:1.0rem bold,Impact;
    }
    </style>
    `;
    return `${html}${css}`;
}

