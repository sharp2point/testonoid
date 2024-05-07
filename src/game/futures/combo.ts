import { COMBOTYPES, ENEMYTYPES } from "@/state/global";

export class ComboFutures {
    private threeEqualsSequence = {
        type: 0,
        count: 0
    };
    private comboThreeEqualSequenceCallback: (comboType: number) => void;

    constructor(comboThreeEqualSequenceCallback: (comboType: number) => void) {
        this.comboThreeEqualSequenceCallback = comboThreeEqualSequenceCallback;
    }
    initCombo(enemyType: number) {
        this.comboThreeEqualSequence(enemyType)
    }
    comboThreeEqualSequence(enemyType: number) {
        // Комбо состоялось если уничтожено 3 подряд одинаковых Enemy
        if (this.threeEqualsSequence.type) {
            if (this.threeEqualsSequence.type === enemyType) {
                this.threeEqualsSequence.count += 1;
                if (this.threeEqualsSequence.count === 3) {
                    console.log(this.threeEqualsSequence)
                    callbackCombo.call(this, this.threeEqualsSequence.type);
                    // clearCombo.call(this, null);
                    this.threeEqualsSequence = {
                        type: 0,
                        count: 0
                    };
                }
            } else {
                // clearCombo.call(this, null);
                this.threeEqualsSequence = {
                    type: 0,
                    count: 0
                };
            }
        } else {
            this.threeEqualsSequence.type = enemyType;
            this.threeEqualsSequence.count = 1;
        }
        function callbackCombo(selector: number) {
            switch (selector) {
                case ENEMYTYPES.RED: {
                    this.comboThreeEqualSequenceCallback(COMBOTYPES.THREE_EQ_SEQ_RED);
                    break;
                }
                case ENEMYTYPES.GREEN: {
                    this.comboThreeEqualSequenceCallback(COMBOTYPES.THREE_EQ_SEQ_GREEN);
                    break;
                }
                case ENEMYTYPES.BLUE: {
                    this.comboThreeEqualSequenceCallback(COMBOTYPES.THREE_EQ_SEQ_BLUE);
                    break;
                }
            }
        }
        function clearCombo() {
            this.threeEqualsSequence = {
                type: 0,
                count: 0
            };
        }
    }
}