import Dir from "./types/Dir";
import Engine from "./Engine";
import image from "../res/atlas/minma1.png";
import json from "../res/atlas/minma1.json";
import mapJson from "../res/map.json";
import testWorld from "./data/testWorld";
import { xy } from "./tools/geometry";

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
  // g.loadWorld(testWorld);
}

window.addEventListener("load", () => loadEngine(document.body));
