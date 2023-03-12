import Engine from "./Engine";
import testWorld from "./data/testWorld";

function loadEngine(parent: HTMLElement) {
  const container = document.createElement("div");
  parent.appendChild(container);
  const canvas = document.createElement("canvas");
  canvas.tabIndex = 1;
  container.appendChild(canvas);

  const g = new Engine(canvas);
  requestAnimationFrame(() => canvas.focus());
  (window as any).g = g;

  const onResize = () => {
    const wantWidth = 320;
    const wantHeight = 240;

    const ratioWidth = Math.floor(window.innerWidth / wantWidth);
    const ratioHeight = Math.floor(window.innerHeight / wantHeight);
    const ratio = Math.min(ratioWidth, ratioHeight);

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

  g.loadWorld(testWorld);
}

window.addEventListener("load", () => loadEngine(document.body));
