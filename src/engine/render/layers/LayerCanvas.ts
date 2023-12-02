import { Logger } from '../../Logger';
import { createCanvas, createContext2D } from '../../utils';
import { Layer, type LayerOptions } from './Layer';
import { type Picture } from '../Picture';
import { type Rect } from '../Rect';
import { type SpriteText } from '../sprites';
import { Drawable } from '../Drawable';

interface LayerCanvasOptions extends LayerOptions {
  transparent?: boolean;
}

export class LayerCanvas extends Layer {
  private context!: CanvasRenderingContext2D;
  private transparent;

  constructor({ transparent, ...options }: LayerCanvasOptions) {
    super(options);

    this.transparent = transparent;

    this.onContextChange = this.onContextChange.bind(this);
    this.bindEvents();
  }

  private bindEvents() {
    this.node.addEventListener('contextlost', this.onContextChange);
    this.node.addEventListener('contextrestored', this.onContextChange);
  }

  private onContextChange(event: Event) {
    Logger.error(event);
  }

  protected create(): HTMLCanvasElement {
    const canvas = createCanvas();
    this.context = createContext2D(canvas, this.transparent);

    return canvas;
  }

  protected syncWithCamera() {
    const position = this.camera!.getPosition();
    const posX = -Math.floor(position.x);
    const posY = -Math.floor(position.y);

    this.context.translate(posX, posY);
  }

  preDraw() {
    this.clear();
    this.context.save();

    super.preDraw();
  }

  drawImage(image: Picture | SpriteText) {
    if (!this.shouldDraw(image)) return;

    const position = image.getOffsetPosition();
    const source = image.getSource();
    const width = image.getWidth();
    const height = image.getHeight();
    const opacity = image.getOpacity();

    this.context.save();

    if (opacity !== 1) {
      this.context.globalAlpha = opacity;
    }

    this.context.drawImage(
      image.getImage(),
      source.x | 0,
      source.y | 0,
      width | 0,
      height | 0,
      position.x | 0,
      position.y | 0,
      width | 0,
      height | 0
    );

    this.context.restore();
  }

  postDraw() {
    this.context.restore();
  }

  protected shouldDraw(drawable: Drawable): boolean {
    return (
      super.shouldDraw(drawable) &&
      drawable.isVisible() &&
      drawable.getOpacity() !== 0
    );
  }

  drawRect(shape: Rect) {
    if (!this.shouldDraw(shape)) return;

    const position = shape.getOffsetPosition();
    const opacity = shape.getOpacity();

    this.context.save();
    this.context.fillStyle = shape.getColor();

    if (opacity !== 1) {
      this.context.globalAlpha = opacity;
    }

    this.context.fillRect(
      position.x | 0,
      position.y | 0,
      shape.getWidth() | 0,
      shape.getHeight() | 0
    );

    this.context.restore();
  }

  getNode(): HTMLCanvasElement {
    return super.getNode() as HTMLCanvasElement;
  }

  getContext(): CanvasRenderingContext2D {
    return this.context;
  }

  clear() {
    this.context.clearRect(0, 0, this.width, this.height);
  }
}
