type ContextId = "2d" | "bitmaprenderer" | "webgl" | "webgl2";

interface ContextOptions {
  "2d": CanvasRenderingContext2DSettings;
  bitmaprenderer: ImageBitmapRenderingContextSettings;
  webgl: WebGLContextAttributes;
  webgl2: WebGLContextAttributes;
}

interface RenderingContext {
  "2d": CanvasRenderingContext2D;
  bitmaprenderer: ImageBitmapRenderingContext;
  webgl: WebGLRenderingContext;
  webgl2: WebGL2RenderingContext;
}

export default function getCanvasContext<T extends ContextId>(
  canvas: HTMLCanvasElement,
  type: T,
  options?: ContextOptions[T]
): RenderingContext[T] {
  const ctx = canvas.getContext(type, options);
  if (!ctx) throw new Error(`canvas.getContext(${type})`);
  return ctx as RenderingContext[T];
}
