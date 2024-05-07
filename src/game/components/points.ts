export default class PointsComponent extends HTMLElement {
    private points: number = 0;
    private root: ShadowRoot;
    private score: HTMLElement;

    set Score(val: string) {
        this.score.innerText = val;
    }

    constructor() {
        super();
        this.root = this.attachShadow({ mode: 'open' });
        this.root.innerHTML = template();
    }
    connectedCallback() {
        this.score = this.root.querySelector("#score");
        console.log("Connected Scoreboard");
    }
    setScore(val: string) {
        this.score.innerText = val;
    }

}

if (!customElements.get('nice2jam-points-component')) {
    customElements.define('nice2jam-points-component', PointsComponent);
}

function template() {
    const html = `
    <div class="points">
        <span>Points: </span>
        <span id="score">1000</span>
    </div>
    `;
    const css = `
    <style>
    :host{
        min-width:200px;
        min-height:70px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
    </style>
    `;
    return `${html}${css}`;
}

