import Atlas from "./Atlas";

export default class ResourceManager {
  promises: Map<string, Promise<unknown>>;
  loaders: Promise<unknown>[];
  atlases: Record<string, Atlas>;
  images: Record<string, HTMLImageElement>;

  constructor() {
    this.promises = new Map();
    this.loaders = [];
    this.atlases = {};
    this.images = {};
  }

  private start<T>(src: string, promise: Promise<T>) {
    this.promises.set(src, promise);
    this.loaders.push(promise);
    return promise;
  }

  loadImage(src: string): Promise<HTMLImageElement> {
    const res = this.promises.get(src);
    if (res) return res as Promise<HTMLImageElement>;

    return this.start(
      src,
      new Promise<HTMLImageElement>((resolve) => {
        const img = new Image();
        img.src = src;

        img.addEventListener("load", () => {
          this.images[src] = img;
          resolve(img);
        });
      })
    );
  }

  loadAtlas(src: string): Promise<Atlas> {
    const res = this.promises.get(src);
    if (res) return res as Promise<Atlas>;

    return this.start(
      src,
      fetch(src)
        .then<Atlas>((r) => r.json())
        .then((atlas) => {
          this.atlases[src] = atlas;
          return atlas;
        })
    );
  }
}
