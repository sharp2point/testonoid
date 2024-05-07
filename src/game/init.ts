import * as havok from "@babylonjs/havok";
import { Engine, HavokPlugin, Vector3 } from "@babylonjs/core";
import { GAME } from "../state/global";

function initGameState(canvas:HTMLCanvasElement) {
    GAME.Canvas = canvas;
    GAME.HVK = new HavokPlugin(true, GAME.Physics);
    GAME.Engine = new Engine(GAME.Canvas, true, {
        xrCompatible: false,
        antialias: true,
        adaptToDeviceRatio:false,
    }, false);
    GAME.Gravity = new Vector3(0, -9.81, 0);
}
async function initCore(canvas: HTMLCanvasElement) {
    if (GAME.Engine) {
        initGameState(canvas)
    } else {
        const physics = await havok.default();
        GAME.Physics = physics;
        initGameState(canvas)
    }

    return Promise.resolve(GAME);
}

export { initCore };