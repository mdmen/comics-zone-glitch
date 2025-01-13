import type { SoundLayer } from './SoundLayer';
import { Observable } from '../Observable';
import { Logger } from '../Logger';

export class Sound {
  private readonly logger = Logger.getInstance();
  private sourceNode: AudioBufferSourceNode | null = null;

  public readonly playEvent = new Observable<this>();
  public readonly stopEvent = new Observable<this>();

  constructor(
    private readonly buffer: AudioBuffer,
    private readonly layer: SoundLayer,
    private readonly loop = false
  ) {}

  private onStop = () => {
    this.stop();
    this.stopEvent.notify(this);
  };

  private createSourceNode() {
    const context = this.layer.getContext();
    const sourceNode = new AudioBufferSourceNode(context, {
      buffer: this.buffer,
    });

    sourceNode.connect(this.layer.getGainNode());
    sourceNode.addEventListener('ended', this.onStop);

    this.loop && (sourceNode.loop = true);

    return sourceNode;
  }

  public play() {
    try {
      this.sourceNode ||= this.createSourceNode();
      this.sourceNode.start();

      this.playEvent.notify(this);
    } catch (error) {
      this.logger.error(error);
    }
  }

  public stop() {
    try {
      if (!this.sourceNode) return;

      this.sourceNode.stop();
      this.sourceNode.disconnect();
      this.sourceNode = null;
    } catch (error) {
      this.logger.error(error);
    }
  }
}
