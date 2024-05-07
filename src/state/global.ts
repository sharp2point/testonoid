import type { Enemy } from "@/game/objects/enemy";
import type { GameState, UserState } from "../types/game_types";

export const GAMESIGNALS = {
    MENU: 1,
    RUN: 10,
    WIN: 20,
    GAMEOTHER: 30,
    GAMEWIN: 100,
}
export const GAME: GameState = {
    PlaceMenu: null,
    PlaceGame: null,
    GameApp: null,
    GameMenu: null,
    GameScene: null,
    Physics: null,
    HVK: null,
    Canvas: null,
    CanvasMenu: null,
    Engine: null,
    Gravity: null,
    Scene: null,
    Camera: null,
    dragBox: {
        up: -7,
        down: -11.5,
        left: -8.5,
        rigth: 8.5
    },
    gameBox: { width: 18, height: 25 },
    gameState: GAMESIGNALS.MENU,
    enemiesMap: new Map<string, Enemy>(),
};

export const collideMask = {
    shield: 0b00000001,
    ball: 0b00000010,
    enemy: 0b00000100,
    enemyParts: 0b00001000,
    rocket: 0b00010000,
    ground: 0b00100000,
    roof: 0b10000000,
    bombParts: 0b01000000,
    groups: {
        shield: 0b00000010,
        ball: 0b10101101,
        enemy: 0b01111110,
        enemyAnimatic: 0b01111010,
        rocket: 0b00000100,
        enemyParts: 0b00100110,
        bombParts: 0b00100100,
        ground: 0b01111111,
        roof: 0b00000010,
    }
}
export const USER: UserState = {
    name: '',
    id: '',
    level: 1,
    points: 0,
}
export const ENEMYTYPES = {
    GREEN: 1,
    BLUE: 2,
    RED: 3,
}

