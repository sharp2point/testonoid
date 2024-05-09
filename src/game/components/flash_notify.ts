import type { ComboDescription } from "@/types/game_types";

export default class FlashNotifyConmponent extends HTMLElement {
    private root: ShadowRoot;
    private host: HTMLElement;
    private description: ComboDescription;
    private timeLive = 2500;
    private timeout = 1.5;

    constructor(comboDescription: ComboDescription, host: HTMLElement ,options:{timeout:number,timeLive:number}) {
        super();
        this.root = this.attachShadow({ mode: "open" });
        this.timeLive = options.timeLive;
        this.timeout = options.timeout;
        this.root.innerHTML = template(comboDescription,this.timeout);
        this.description = comboDescription;
        this.host = host;
        host.appendChild(this);
    }
    connectedCallback() {
        const timeHandler = setTimeout(() => {
            this.remove();
            clearTimeout(timeHandler);
        }, this.timeLive);
    }
}

if (!customElements.get("nice2jam-notify-component")) {
    customElements.define("nice2jam-notify-component", FlashNotifyConmponent);
}

function template(comboDescription: ComboDescription, timeout:number) {
    const html = `
        <h2>${comboDescription.header}</h3>
        <p>${comboDescription.description}</p>
        <svg version="1.1" xmlns="//www.w3.org/2000/svg" xmlns:xlink="//www.w3.org/1999/xlink" style="display:none;">
        <defs>
            <filter id="stroke-text-svg-filter">
            <feMorphology operator="dilate" radius="2"></feMorphology>
            <feComposite operator="over" in="SourceGraphic"/>
            </filter>
        </defs>
        </svg>
    `;
    const css = `
    <style>
    :host{
        --color-header:${comboDescription.settings.color};
        position:absolute;
        top:100px;
        left:calc(100vw/2 - 100px);
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content: space-between;
        padding:1rem;
        min-width:200px;
        z-index:10;
        animation: emersionHeader ${timeout}s linear;
        opacity:0.5;
        transform:scale(0);
    }
    h2{
        font:3rem bold,Impact;
        color:var(--color-header);
        text-shadow:0px 0px 15px rgba(200,200,200,1);
        filter:url(#stroke-text-svg-filter);
    }
    @keyframes emersionHeader{
        0%{
            transform: scale(0);
            opacity:0;
        }
        30%{
            transform: scale(1.5);
            opacity:1;
        }
        70%{
            transform: scale(1.2);
            opacity:0.1;
        }
        100%{
            transform:scale(5);
            opacity:0;
        }
    }
    </style>
    `;
    return `${html}${css}`;
}