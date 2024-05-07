import { Vector3, type Scene } from "@babylonjs/core";
import { Enemy } from "./objects/enemy";
import { maps } from "./maps/level_1";


export class LevelBuilder {
    private enemyNodes: Array<Enemy> = [];
    private scene: Scene;
    private deltaX = 0.1;
    private deltaZ = 0.1;
    private deltaMapX = 1.3;
    private deltaMapY = 0;

    constructor(level: number, scene: Scene, winCallback: () => void) {
        if (maps.length > level) {
            const map = maps[level];
            this.scene = scene;
            this.buildMap(map);
        }
        else {
            const map = maps[level];
            this.scene = scene;
            this.buildMap(map);
            winCallback();
        }

    }
    buildMap(map: Array<Array<number>>) {
        for (let i = 0; i < map.length; i++) {
            for (let j = 0; j < map[i].length; j++) {
                if (map[i][j] === 1) {
                    const rnd = Math.floor(Math.random() * 1000)
                    const enemy = new Enemy(`enemy-${rnd}-${i}-${j}`, {
                        position: new Vector3(i + this.deltaX, 0.55, j + this.deltaZ).
                            add(new Vector3(-this.deltaMapX, 0, this.deltaMapY)), type: 1
                    }, this.scene);
                    this.enemyNodes.push(enemy);
                }

            }
        }
    }
}