import { Settings } from '../Settings';

interface Options {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  xOffset?: number;
  yOffset?: number;
}

export class Camera {
  private x;
  private y;
  private width;
  private height;
  private xOffset;
  private yOffset;

  constructor({
    x = 0,
    y = 0,
    width = Settings.getValue('canvasWidth'),
    height = Settings.getValue('canvasHeight'),
    xOffset = Settings.getValue('cameraXOffset'),
    yOffset = Settings.getValue('cameraYOffset'),
  }: Options) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.xOffset = xOffset;
    this.yOffset = yOffset;
  }

  public getRightInnerBoundary(): number {
    return this.x + this.width - this.xOffset;
  }

  public getLeftInnerBoundary(): number {
    return this.x + this.xOffset;
  }

  public getTopInnerBoundary(): number {
    return this.x + this.yOffset;
  }

  public getBottomInnerBoundary(): number {
    return this.x + this.height + this.yOffset;
  }
}
