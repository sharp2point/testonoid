export class ParticlesEffect {
    private cnv: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D | null = null;
    private effect: Effect | null = null;
    private is_resize = false;
    private animationHandler = 0;

    get canvas() {
        return this.cnv;
    }
    constructor(canvas: HTMLCanvasElement) {
        this.cnv = canvas;
        if (this.cnv) {
            this.ctx = this.cnv.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
            this.effect = new Effect(this.ctx, this.cnv.width, this.cnv.height);
        }
    }
    resize() {
        if (!this.is_resize) {
            this.is_resize = true;
            setTimeout(() => {
                this.is_resize = false;
                if (this.cnv) {
                    this.ctx = this.cnv.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
                    this.effect = new Effect(this.ctx, this.cnv.width, this.cnv.height);
                }
            }, 1000);
        }
    }
    animate(timeStamp: number) {
        if (this.effect instanceof Effect) {
            this.effect!.render();
        }
        this.animationHandler = requestAnimationFrame((timeStamp: number) => {
            this.animate(timeStamp);
        });
    }
    stopAnimation() {
        cancelAnimationFrame(this.animationHandler);
    }
}

class Particle {
    private effect: Effect;
    private x: number;
    private y: number;
    private radius = 0;
    private vx = Math.random() * 1 - 0.7;
    private vy = Math.random() * 1 - 0.7;
    private ease = Math.random() * 0.1 + 0.05;

    get posX() {
        return this.x;
    }
    get posY() {
        return this.y;
    }


    constructor(effect: Effect) {
        this.effect = effect;
        this.x = this.radius + Math.random() * (this.effect.width - this.radius * 2);
        this.y = this.radius + Math.random() * (this.effect.height - this.radius * 2);
        this.radius = Math.random() * 20 + 5;
    }

    draw(context: CanvasRenderingContext2D) {
        if (context) {
            // context.fillStyle = `hsl(${this.x * 0.5},100%,50%)`;
            context.beginPath();
            context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            context.fill();
            context.stroke();
        }
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x > (this.effect.width - this.radius) || this.x < this.radius) {
            this.vx *= -1;
        }
        if (this.y > (this.effect.height - this.radius) || this.y < this.radius) {
            this.vy *= -1;
        }
    }
}

class Effect {
    private _context: CanvasRenderingContext2D | null;
    private canvasWidth: number;
    private canvasHeight: number;
    private particles: Particle[] = [];
    private numberOfParticles = 50;
    private fillColor: CanvasGradient;
    private strokeColor: CanvasGradient;

    get context() {
        return this._context as CanvasRenderingContext2D;
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
        this.createParticles();
        this.fillColor = this._context.createLinearGradient(0, 0, this.canvasWidth, this.canvasHeight);
        this.fillColor.addColorStop(0, `rgba(181,184,182,0.1)`);
        this.fillColor.addColorStop(1, `rgba(201,192,187,1)`);
        this.strokeColor = this._context.createLinearGradient(0, 0, this.canvasWidth, this.canvasHeight);
        this.strokeColor.addColorStop(0, `rgba(203,209,205,0.05)`);
        this.strokeColor.addColorStop(1, `rgba(203,209,205,0.05)`);
        this._context.fillStyle = this.fillColor;
        this._context.strokeStyle = this.strokeColor;
    }
    createParticles() {
        for (let i = 0; i < this.numberOfParticles; i++) {
            this.particles.push(new Particle(this));
        }
    }
    reset() {
        this.particles = [];
        this.createParticles();
    }
    handleParticles() {
        this.connectParticles();
        this.particles.forEach(particle => {

            particle.draw(this._context as CanvasRenderingContext2D);

            particle.update();
        });

    }
    connectParticles() {
        const maxDistance = 300;
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = 0; j < this.particles.length; j++) {
                const dx = this.particles[i].posX - this.particles[j].posX;
                const dy = this.particles[i].posY - this.particles[j].posY;
                const distance = Math.hypot(dx, dy);
                if (distance < maxDistance) {
                    this._context?.save();
                    const opaq = 1 - (distance / maxDistance);
                    (this._context as CanvasRenderingContext2D).globalAlpha = opaq;
                    this._context?.beginPath();
                    this._context?.moveTo(this.particles[i].posX, this.particles[i].posY);
                    this._context?.lineTo(this.particles[j].posX, this.particles[j].posY);
                    this._context?.stroke();
                    this._context?.restore();
                }
            }
        }
    }
    render() {
        this._context?.clearRect(0, 0, this.width, this.height);
        this.handleParticles();
    }
    resize(width: number, height: number) {
        this.canvasWidth = width;
        this.canvasHeight = height;
        this.reset();
    }
}