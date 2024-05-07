import { Observer, Scalar, Scene, setAndStartTimer, Vector3 } from "@babylonjs/core";
import { Enemy } from "./objects/enemy";
import { GAME } from "@/state/global";

export class EnemyGenerator {
    private scene: Scene;
    private enemyCount = 0;
    private isRun = true;
    private inOptions = {
        oldEnemyPosition: new Vector3(),
    }

    get EnemyCounts() {
        return this.enemyCount
            ;
    }

    constructor(scene: Scene, count: number) {
        this.scene = scene;
        this.enemyCount = count;
    }
    generateEnemy() {
        const rnd = Math.floor(Math.random() * 10000);
        const name = `enemy-${rnd}`;
        let position: Vector3;
        while (true) {
            position = new Vector3(Math.floor(Scalar.RandomRange(-GAME.gameBox.width / 2 + 1, GAME.gameBox.width / 2 - 1)), 0.55, GAME.gameBox.height / 2 - 1)
            if (position.x !== this.inOptions.oldEnemyPosition.x) {
                break;
            }
        }
        const enemy = new Enemy({
            name: name,
            position: position,
            type: this.randomEnemyType()
        }, this.scene);
        GAME.enemiesMap.set(name, enemy);
        this.enemyCount--;
        if (this.enemyCount === 0) {
            this.stop();
        }
    }
    start(callback: (count: number) => void) {
        setAndStartTimer({
            timeout: 1000,
            contextObservable: this.scene.onBeforeRenderObservable,
            breakCondition: () => { return !this.isRun },
            onEnded: (e) => {
                callback(this.enemyCount)
                this.generateEnemy();
                this.start(callback); // возврат кол-ва Enemy count
            },
            onTick: (e) => { },
            onAborted: (e) => { ; }
        })
    }
    stop() {
        this.isRun = false;
    }
    randomEnemyType() {
        return Math.floor(Math.random() * 3) + 1;
    }
}

