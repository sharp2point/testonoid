export class Preloader {
    private cnv: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D | null = null;
    // private lineHeight: number = 70;
    private effect: Effect | null = null;
    private text: string = '';
    private frame = 0;
    private start = true;
    private frameTime = 0;

    get canvas() {
        return this.cnv;
    }
    constructor(canvas: HTMLCanvasElement) {
        this.cnv = canvas;
        if (this.cnv) {
            this.ctx = this.cnv.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
            this.effect = new Effect(this.ctx, this.cnv.width, this.cnv.height);
        }
        window.addEventListener('resize', () => {
            if (this.ctx && this.effect) {
                this.ctx.clearRect(0, 0, this.cnv.width, this.cnv.height);
                this.effect.resize(this.cnv.width, this.cnv.height);
                this.setText(this.text);
            }
        });
    }
    setText(text: string) {
        if (this.effect && this.ctx) {
            this.ctx.clearRect(0, 0, this.cnv.width, this.cnv.height);
            this.text = text;
            this.effect!.wrapText(this.text);
            this.effect!.render();
        }
    }
    animate(timeStamp: number) {
        if (this.start && timeStamp) {
            this.start = false;
            this.frameTime = timeStamp
        }
        if (this.ctx && this.effect) {
            switch (this.frame) {
                case 0: {
                    if ((timeStamp - this.frameTime) >= 2000) {
                        this.frameTime = timeStamp;
                        this.frame++;
                        this.setText("present");
                    }
                    this.ctx.clearRect(0, 0, this.cnv.width, this.cnv.height);
                    this.effect.render();
                    requestAnimationFrame((ts) => { this.animate(ts) });
                    break;
                }
                case 1: {
                    if ((timeStamp - this.frameTime) >= 2000) {
                        this.frameTime = timeStamp;
                        this.frame++;
                    }
                    this.ctx.clearRect(0, 0, this.cnv.width, this.cnv.height);
                    this.effect.render();
                    requestAnimationFrame((ts) => { this.animate(ts) });
                    break;
                }
                case 2: {
                    console.log("End Preload")
                    break;
                }

            }
        }
    }
}

class Particle {
    private effect: Effect;
    private x: number;
    private y: number;
    private color: string;
    private originX: number;
    private originY: number;
    private size: number;
    // private dx = 0;
    // private dy = 0;
    // private vx = 0;
    // private vy = 0;
    // private force = 0;
    // private angle = 0;
    // private distance = 0;
    // private friction = Math.random() * 0.6 + 0.15;
    private ease = Math.random() * 0.1 + 0.05;

    constructor(effect: Effect, x: number, y: number, color: string) {
        this.effect = effect;
        this.x = Math.random() * this.effect.width;
        this.y = Math.random() * this.effect.height;
        this.color = color;
        this.originX = x;
        this.originY = y;
        this.size = this.effect.gap - 1;
    }

    draw() {
        if (this.effect.context) {
            this.effect.context.fillStyle = this.color;
            this.effect.context.fillRect(this.x, this.y, this.size, this.size);
        }
    }
    update() {
        this.x += (this.originX - this.x) * this.ease;
        this.y += (this.originY - this.y) * this.ease;
    }
}

class Effect {
    private _context: CanvasRenderingContext2D | null;
    private canvasWidth: number;
    private canvasHeight: number;
    private textX: number;
    private textY: number;
    private particles: Particle[] = [];
    private fontSize = 60;
    private maxTextWidth: number;
    private lineHeight = 120;
    private _gap = 2;

    get gap() {
        return this._gap;
    }
    get context() {
        return this._context;
    }
    get width() {
        return this.canvasWidth;
    }
    get height() {
        return this.canvasHeight;
    }

    constructor(context: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) {
        this._context = context;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.textX = this.canvasWidth / 2;
        this.textY = this.canvasHeight / 2;
        this.maxTextWidth = this.canvasWidth * 0.1;
    }
    wrapText(text: string) {
        if (this._context) {
            const gradient = this._context.createLinearGradient(0, 0, this.canvasWidth, this.canvasHeight);
            gradient.addColorStop(0.46, 'black');
            gradient.addColorStop(0.5, 'gold');
            gradient.addColorStop(0.55, 'black');
            this._context.font = `${this.fontSize}px Impact`;
            this._context.fillStyle = gradient;
            this._context.textAlign = 'center';
            this._context.lineWidth = 1;
            this._context.strokeStyle = 'white';
            //-------------------------------------
            const lines = [];
            let lineCounter = 0;
            const words = text.split(' ');
            let line = '';
            for (let i = 0; i < words.length; i++) {
                const testLine = line + words[i] + ' ';
                if (this._context.measureText(testLine).width > this.maxTextWidth) {
                    line = words[i] + ' ';
                    lineCounter++;
                } else {
                    line = testLine;
                }
                lines[lineCounter] = line;
            }
            const textHeight = this.lineHeight * lineCounter;
            this.textY = this.canvasHeight / 2 - textHeight / 2;

            lines.forEach((el, index) => {
                this._context!.fillText(el, this.textX, this.textY + (index * this.lineHeight));
                this._context!.strokeText(el, this.textX, this.textY + (index * this.lineHeight));
            });
            this.convertToParticles();
        }
    }
    convertToParticles() {
        this.particles = [];
        const pixels = this._context!.getImageData(0, 0, this.canvasWidth, this.canvasHeight).data;
        this._context!.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        for (let y = 0; y < this.canvasHeight; y += this._gap) {
            for (let x = 0; x < this.canvasWidth; x += this._gap) {
                const index = (y * this.canvasWidth + x) * 4;
                const a = pixels[index + 3];
                if (a > 0) {
                    const r = pixels[index];
                    const g = pixels[index + 1];
                    const b = pixels[index + 2];
                    const color = `rgb(${r},${g},${b})`;
                    this.particles.push(new Particle(this, x, y, color));
                }
            }
        }
    }
    render() {
        this.particles.forEach(particle => {
            particle.draw();
            particle.update();
        });
    }
    resize(width: number, height: number) {
        this.canvasWidth = width;
        this.canvasHeight = height;
        this.textX = this.canvasWidth / 2;
        this.textY = this.canvasHeight / 2;
        this.maxTextWidth = this.canvasWidth * 0.1;
    }
}

