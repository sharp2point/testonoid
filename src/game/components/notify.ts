export default class NotifyComponent extends HTMLElement {
    private root: ShadowRoot;
    constructor(data: {
        header: string,
        description: string
    }) {
        super();
        this.root = this.attachShadow({ mode: "open" });
        this.root.innerHTML = template(data.header, data.description);
    }
    connectedCallback() {
        const onOkEvent = new CustomEvent('on-ok-event', {
            bubbles: false,
            cancelable: true,
            detail: 'Notify Ok Custom Event'
        })
        const button = this.root.querySelector(".ok-button") as HTMLButtonElement;
        button.addEventListener("click", () => {
            this.dispatchEvent(onOkEvent);
            this.remove()
        })
    }
    disconnectedCallback() {
        
    }
}

if (!customElements.get('nice2jam-notify')) {
    customElements.define('nice2jam-notify', NotifyComponent);
}

function template(header: string, description: string) {
    const html = `
        <header>
            <h1 class="header">${header}</h1>
            <p>${description}</p>
            <button class="ok-button">OK</button>
        </header>
        
    `;
    const css = `
    <style>
    :host{
        position:absolute;
        top:0;
        left:0;
        z-index:1000;
        width:100vw;
        height:100vh;
        display:flex;
        justify-content:center;
        align-items:center;
        background: rgba(30,30,30,0.7);
    }
    header{
        min-width:250px;
        height:600px;
        background: rgba(100,100,100,1);
        border-radius:1rem;
        box-shadow:5px 5px 15px;
        display:flex;
        flex-direction:column;
        justify-content:center;
        align-items:center;
    }
    .ok-button{
        width:100px;
        padding:1rem;
        margin:1rem;
        border-radius:0.3rem;
        cursor:pointer;
    }
    </style>
    `;
    return `${html}${css}`;
}