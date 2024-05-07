import type{ GameScene } from "@/game/game_scene";
import type{ Enemy } from "@/game/objects/enemy";
import type { Engine, HavokPlugin, Scene, UniversalCamera, Vector3 } from "@babylonjs/core";
import type GameMenu from "@/game/components/menu";
import type GameApp from "@/game/components/game";


export type GameState = {
    PlaceMenu: HTMLElement | null,
    PlaceGame: HTMLElement | null,
    GameApp: GameApp | null,
    GameMenu: GameMenu | null
    Physics: any,
    HVK: HavokPlugin | null,
    Canvas: HTMLCanvasElement | null,
    CanvasMenu: HTMLCanvasElement | null,
    Engine: Engine | null,
    Gravity: Vector3 | null,
    GameScene: GameScene | null,
    Scene: Scene | null,
    Camera: UniversalCamera | null,
    dragBox: {
        up: number,
        down: number,
        left: number,
        rigth: number
    },
    gameBox: { width: number, height: number },
    gameState: number,
    enemiesMap: Map<string, Enemy>,
}

export type UserState = {
    name: string,
    id: string,
    level: number,
    points: number,
}
export type EnemyData = {
    name: string,
    type: number,
    position: Vector3
}