import type { Enemy } from "@/game/objects/enemy";
import type { GameState, UserState } from "../types/game_types";
import { ComboFutures } from "@/game/futures/combo";

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
    comboFutures: null,
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
    scores: 0,
}
export const ENEMYTYPES = {
    GREEN: {
        type: 1,
        score:5,
    },
    BLUE: {
        type: 2,
        score: 10,
    },
    RED: {
        type: 3,
        score: 15,
    },
}
export const COMBOTYPES = {
    THREE_EQ_SEQ_RED: 1,
    THREE_EQ_SEQ_GREEN: 11,
    THREE_EQ_SEQ_BLUE: 12,
}
export const COMBODESCRIPTION = {
    THREE_EQ_SEQ_RED: {
        header: "Red Combo",
        description: "Get Red Bonus!",
        settings: {
            color:"#a30202",
        }
    },
    THREE_EQ_SEQ_GREEN: {
        header: "Green Combo",
        description: "Get Green Bonus!",
        settings: {
            color: "#068f23",
        }
    },
    THREE_EQ_SEQ_BLUE: {
        header: "BLUE Combo",
        description: "Get Blue Bonus!",
        settings: {
            color: "#053f82",
        }
    }
}

