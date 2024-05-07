export default class RangeControl extends HTMLElement {
    private root: ShadowRoot;
    private rangeData = {
        min: 0,
        max: 0,
        step: 0,
        value: 0
    }

    constructor(title: string, min: number, max: number, step: number, value: number) {
        super();
        this.root = this.attachShadow({ mode: "open" });
        this.root.innerHTML = template(title, min, max, step, value);
    }
    connectedCallback() {
        
        const spanVal = this.root.querySelector(".value") as HTMLElement;
        const range = this.root.querySelector("#range") as HTMLElement;
        range.addEventListener("input", (e) => {
            const val = e.target.value
            const rangeEvent = new CustomEvent("on-range-event", {
                bubbles: false,
                cancelable: true,
                detail: { value: val }
            });
            spanVal.textContent = val
            this.dispatchEvent(rangeEvent);
        })
    }
    disconnectedCallback() {
        console.log("dispose Range")
    }
}
if (!customElements.get("nice2jam-range-control")) {
    customElements.define("nice2jam-ramge-control", RangeControl);
}
function template(title: string, min: number, max: number, step: number, value: number) {
    const html = `
        <fieldset>
            <legend>${title}: <span class="value">${value}</span></legend>
            <input id="range" type="range" name="${title}" min="${min}" max="${max}" step="${step}" value="${value}"/>
        </fieldset>
    `;
    const css = `
    <style>
        :host{
            width:90%;
        }
    </style>
    `;
    return `${html}${css}`;
}