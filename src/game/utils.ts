import { Mesh, MeshBuilder, Scene, Tools, Vector3 } from "@babylonjs/core";
import { GAME } from "../state/global";

function cameraSettings() {
    const aspect = getScreenAspect();
    if (GAME.Camera) {
        const camera = GAME.Camera;
        console.log("AP: ", aspect.toFixed(2));
        let position = camera.position;
        let target = camera.target;
        let FOV = Tools.ToRadians(camera!.fov);

        if (aspect < 0.5) { // !
            position = new Vector3(0, 40, -6.7);
            target = new Vector3(0, 20.2, 3.3);
            FOV = Tools.ToRadians(72);

        } else if (aspect >= 0.5 && aspect < 0.7) {//!
            position = new Vector3(0, 39.8, -19.2);
            target = new Vector3(0, 8.9, 2.5);
            FOV = Tools.ToRadians(52);

        } else if (aspect >= 0.7 && aspect <= 1.1) {//!
            position = new Vector3(0, 28.1, -18.6);
            target = new Vector3(0, -6.8, 14.6);
            FOV = Tools.ToRadians(64);

        } else if (aspect > 1.1) {
            position = new Vector3(0, 15.0, -16);
            target = new Vector3(0, -11, 9);
            FOV = Tools.ToRadians(61);
        }
        camera.position = position;
        camera.target = target;
        camera.fov = FOV;

    }
}
function getScreenAspect() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    return width / height;
}
function createFrame(name: string, options: { path: Array<Vector3>, profile: Array<Vector3> }, scene: Scene) {
    const path = options.path;
    const profile = options.profile;

    let originX = Number.MAX_VALUE;

    for (let m = 0; m < profile.length; m++) {
        originX = Math.min(originX, profile[m].x);
    }

    let angle = 0;
    let width = 0;
    const cornerProfile = new Array<Vector3[]>();

    const nbPoints = path.length;
    let line = Vector3.Zero();
    const nextLine = Vector3.Zero();
    path[1].subtractToRef(path[0], line);
    path[2].subtractToRef(path[1], nextLine);

    for (let p = 0; p < nbPoints; p++) {
        angle = Math.PI - Math.acos(Vector3.Dot(line, nextLine) / (line.length() * nextLine.length()));
        const direction = Vector3.Cross(line, nextLine).normalize().z;
        const lineNormal = new Vector3(line.y, -1 * line.x, 0).normalize();
        line.normalize();
        const extrusionLength = line.length();
        cornerProfile[(p + 1) % nbPoints] = new Array<Vector3>();
        //local profile
        for (let m = 0; m < profile.length; m++) {
            width = profile[m].x - originX;
            cornerProfile[(p + 1) % nbPoints].push(
                path[(p + 1) % nbPoints]
                    .subtract(
                        (lineNormal.scale(width) as Vector3))
                    .subtract(
                        line.scale(direction * width / Math.tan(angle / 2))
                    )
            );
        }

        line = nextLine.clone();
        path[(p + 3) % nbPoints].subtractToRef(path[(p + 2) % nbPoints], nextLine);
    }

    const frame = new Array<Mesh>();

    for (let p = 0; p < nbPoints; p++) {
        const extrusionPaths = new Array<Vector3[]>();
        for (let m = 0; m < profile.length; m++) {
            const vecm = profile[m] as Vector3;
            const vecpm = cornerProfile[p][m] as Vector3;
            extrusionPaths[m] = new Array<Vector3>();
            extrusionPaths[m].push(new Vector3(vecpm.x, vecpm.y, vecm.y));
            extrusionPaths[m].push(new Vector3((cornerProfile[(p + 1) % nbPoints][m] as Vector3).x, (cornerProfile[(p + 1) % nbPoints][m] as Vector3).y, profile[m].y));
        }

        frame[p] = MeshBuilder.CreateRibbon("frameLeft", { pathArray: extrusionPaths, sideOrientation: Mesh.DOUBLESIDE, updatable: true, closeArray: true }, scene);
    }
    const mesh = Mesh.MergeMeshes(frame, true)!.convertToFlatShadedMesh();
    mesh.name = "wall"
    return mesh;
}
function createCanvas(id: string, options: { width: number, height: number }) {
    const canvas = document.createElement("canvas");
    canvas.id = id;
    canvas.width = options.width;
    canvas.height = options.height;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    return canvas;
}
function gameResize() {

}
export { getScreenAspect, cameraSettings, createFrame, createCanvas };