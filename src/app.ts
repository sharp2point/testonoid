import { cameraSettings } from "@/game/utils";
import { GAME, GAMESIGNALS, USER } from "@/state/global";
import GameMenu from "@/game/components/menu";
import GameApp from "@/game/components/game";
import NotifyComponent from "./game/components/notify";

window.addEventListener("load", () => {
    GAME.PlaceMenu = document.querySelector(".app-menu") as HTMLElement;
    GAME.PlaceGame = document.querySelector(".app-game") as HTMLElement;

    GAME.GameMenu = new GameMenu();
    GAME.GameApp = new GameApp();

    GAME.PlaceMenu.appendChild(GAME.GameMenu);
    GAME.PlaceGame.appendChild(GAME.GameApp);

    GAME.GameMenu.addEventListener('on-run-game', (e) => {
        if (GAME.gameState !== GAMESIGNALS.GAMEWIN) {
            GAME.GameApp.loadLevel(USER);
            switchGameState("game")
        }
    });
    GAME.GameApp.addEventListener('on-run-menu', (e) => {
        switchGameState("menu");        
    });
    GAME.GameApp.addEventListener('on-win-game', (e) => {
        const notify = new NotifyComponent({ header: "You Winer !", description: "Small Step to Great Win!" });
        GAME.PlaceGame.appendChild(notify);
        notify.addEventListener('on-ok-event', () => {            
            if (GAME.gameState !== GAMESIGNALS.GAMEWIN) {
                USER.level += 1;
            }
            switchGameState("menu");
        })
    });
    GAME.GameApp.addEventListener('on-loose-game', (e) => {
        const notify = new NotifyComponent({ header: "You Loose ...", description: "In One in World..." });
        GAME.PlaceGame.appendChild(notify);
        notify.addEventListener('on-ok-event', () => {
            switchGameState("menu");
        });
    })
    GAME.gameState = GAMESIGNALS.MENU;
});

window.addEventListener("resize", () => {
    if (GAME.Engine) {
        GAME.Engine.resize();
        cameraSettings()
    }
})
window.addEventListener("keyup", async (e) => {
    if (e.key === "i" && e.altKey && GAME.gameState === GAMESIGNALS.RUN) {

    }
})

function switchGameState(state: "menu" | "game") {
    switch (state) {
        case "menu": {
            GAME.GameMenu.toLive();
            GAME.PlaceMenu.style.display = "block";
            GAME.PlaceGame.style.display = "none";
            GAME.gameState = GAMESIGNALS.MENU;
            break;
        }
        case "game": {
            GAME.PlaceMenu.style.display = "none";
            GAME.PlaceGame.style.display = "block";
            GAME.gameState = GAMESIGNALS.RUN;
            break;
        }
    }
}