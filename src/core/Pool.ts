interface PoolObject {
  active: boolean;
  reset(): void;
}

interface Options {
  create(): PoolObject;
  initialSize?: number;
  maxSize?: number;
}

export class Pool {
  private readonly create;
  private readonly maxSize;
  private readonly initialSize;
  private readonly objects: Map<number, PoolObject> = new Map();
  private readonly nonActiveObjects: Set<number> = new Set();
  private readonly resetInterval = 10000;
  private resetTimer!: NodeJS.Timeout;
  private lastId = 0;

  constructor({ create, maxSize = 100, initialSize = 5 }: Options) {
    this.create = create;
    this.maxSize = maxSize;
    this.initialSize = initialSize;

    this.init();
    this.bindReset();
  }

  private bindReset() {
    const start = () => {
      if (this.shouldReset()) {
        this.reset();
      }

      this.resetTimer = setTimeout(start, this.resetInterval);
    };

    start();
  }

  private init() {
    for (let i = 0; i < this.initialSize; i++) {
      const object = this.create();
      this.objects.set(i, object);
      this.updateNonActives(object, i);
    }

    this.lastId = this.initialSize - 1;
  }

  private shouldReset() {
    return this.hasNoActives() && this.objects.size > this.initialSize;
  }

  private hasNoActives() {
    return this.objects.size - this.nonActiveObjects.size === 0;
  }

  private hasOnlyActives() {
    return this.objects.size - this.nonActiveObjects.size === this.objects.size;
  }

  private shouldExpand() {
    return this.hasOnlyActives() && !this.isMaxFull();
  }

  private isMaxFull() {
    return this.objects.size === this.maxSize;
  }

  private isMaxFullOfActives() {
    return this.isMaxFull() && this.hasOnlyActives();
  }

  private updateNonActives(object: PoolObject, id: number) {
    object.isActive()
      ? this.nonActiveObjects.delete(id)
      : this.nonActiveObjects.add(id);
  }

  private reset() {
    let counter = 0;

    for (const key of this.objects.keys()) {
      if (counter++ > this.initialSize) {
        this.objects.delete(key);
      }
    }

    this.objects.forEach((object, id) => {
      this.updateNonActives(object, id);
    });
  }

  private expand() {
    for (let i = 0; i < this.initialSize && !this.isMaxFull(); i++) {
      this.lastId++;

      const object = this.create();
      this.updateNonActives(object, this.lastId);

      this.objects.set(this.lastId, object);
    }
  }

  get() {
    if (this.isMaxFullOfActives()) return this.create();

    if (this.shouldExpand()) {
      this.expand();
    }

    const [id] = this.nonActiveObjects;
    return this.objects.get(id) as PoolObject;
  }

  destroy() {
    clearTimeout(this.resetTimer);
    this.objects.clear();
    this.nonActiveObjects.clear();
  }
}
