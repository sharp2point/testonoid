import { Tools, UniversalCamera, Vector3 } from "@babylonjs/core";
import RangeControl from "./rangeControl";

export default class CameraControl extends HTMLElement {
    private root: ShadowRoot;
    private cameraData = {
        position: new Vector3(0, 0, 0),
        target: new Vector3(0, 0, 0),
        fov: 80,
    }

    constructor(camera: UniversalCamera) {
        super();
        this.root = this.attachShadow({ mode: "open" });
        this.root.innerHTML = template();
        this.cameraData.position = camera.position;
        this.cameraData.target = camera.target;
        this.cameraData.fov = camera.fov;
    }
    connectedCallback() {

        const cameraDataEvent = new CustomEvent('on-camera-control', {
            bubbles: false,
            cancelable: true,
            detail: this.cameraData
        })
        const controls = this.root.querySelector(".controls");
        const posY = new RangeControl("posY", -20, 40, 0.1, this.cameraData.position.y);
        const posZ = new RangeControl("posZ", -40, -1, 0.1, this.cameraData.position.z);
        const trgY = new RangeControl("trgY", -20, 40, 0.1, this.cameraData.target.y);
        const trgZ = new RangeControl("trgZ", -20, 40, 0.1, this.cameraData.target.z);
        const fov = new RangeControl("fov", 40, 180, 1,Tools.ToDegrees(this.cameraData.fov));

        controls.appendChild(posY);
        controls.appendChild(posZ);
        controls.appendChild(trgY);
        controls.appendChild(trgZ);
        controls.appendChild(fov);

        posY.addEventListener("on-range-event", (e) => {
            this.cameraData.position.y = parseFloat(e.detail.value)
            this.dispatchEvent(cameraDataEvent)
        })
        posZ.addEventListener("on-range-event", (e) => {
            this.cameraData.position.z = parseFloat(e.detail.value)
            this.dispatchEvent(cameraDataEvent)
        })
        trgY.addEventListener("on-range-event", (e) => {
            this.cameraData.target.y = parseFloat(e.detail.value);
            this.dispatchEvent(cameraDataEvent)
        })
        trgZ.addEventListener("on-range-event", (e) => {
            this.cameraData.target.z = parseFloat(e.detail.value);
            this.dispatchEvent(cameraDataEvent)
        })
        fov.addEventListener("on-range-event", (e) => {
            this.cameraData.fov = parseFloat(e.detail.value);
            this.dispatchEvent(cameraDataEvent)
        })
        //------------------------------------
        const buttonClose = this.root.querySelector(".close-button") as HTMLButtonElement;
        buttonClose.addEventListener("click", () => {
            this.remove();
        })
    }
    disconnectedCallback() {

    }
}
if (!customElements.get('nice2jam-camera-control')) {
    customElements.define('nice2jam-camera-control', CameraControl);
}

function template() {
    const html = `
        <div class="controls"></div>
        <button class="close-button">Close</button>
    `;
    const css = `
    <style>
        :host{
            position:absolute;
            top:100px;
            left: calc(100vw/2 - 155px);
            display:flex;
            flex-direction:column;
            justify-content:center;
            align-items:center;
            gap:1rem;
            width:250px;
            background:rgba(100,100,100,0.5);
            border:1px solid white;
            border-radius:1rem;
            margin:1rem;
            padding:1rem;

        }
        button{
            width:50px;
            height:50px;
            border-radius:1rem;
        }
    </style>
    `;
    return `${html}${css}`;
}