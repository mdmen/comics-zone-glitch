import { Logger } from '../common/Logger';
import { isEmpty } from '../common/utils';

type Sources = Record<string, unknown>;
type Resources = Sources;

export abstract class Assets {
  private readonly sources;
  private readonly count;
  private readonly assets;

  constructor(sources: Sources) {
    this.sources = sources;
    this.count = Object.keys(sources).length;
    this.assets = {} as Resources;
  }

  private async load(): Promise<void> {
    try {
      const names = Object.keys(this.sources);

      await Promise.all(
        names.map(async (key) => {
          const source = this.sources[key];
          const asset = await this.loadAsset(source);

          this.assets[key] = asset;
        })
      );
    } catch (error) {
      Logger.error(error);
    }
  }

  protected async retrieve(): Promise<unknown> {
    const keys = Object.keys(this.assets);

    if (isEmpty(keys)) {
      await this.load();
    }

    return this.assets;
  }

  protected abstract loadAsset(src: unknown): Promise<unknown>;

  protected abstract get(): Promise<unknown>;
}
