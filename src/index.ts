import Engine from "./Engine";
import mapJson from "../res/map.json";

function loadEngine(parent: HTMLElement) {
  const container = document.createElement("div");
  parent.appendChild(container);
  const canvas = document.createElement("canvas");
  canvas.tabIndex = 1;
  container.appendChild(canvas);

  const g = new Engine(canvas);
  requestAnimationFrame(() => canvas.focus());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).g = g;

  const onResize = () => {
    const wantWidth = 320;
    const wantHeight = 240;

    const ratioWidth = Math.floor(window.innerWidth / wantWidth);
    const ratioHeight = Math.floor(window.innerHeight / wantHeight);
    const ratio = Math.max(1, Math.min(ratioWidth, ratioHeight));

    const width = wantWidth * ratio;
    const height = wantHeight * ratio;

    container.style.width = `${width}px`;
    container.style.height = `${height}px`;
    canvas.width = wantWidth;
    canvas.height = wantHeight;

    g.draw();
  };
  window.addEventListener("resize", onResize);
  onResize();

  g.loadGCMap(mapJson, 0, 1);
}

window.addEventListener("load", () => loadEngine(document.body));
