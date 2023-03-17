export default class Soon {
  timeout?: number;

  constructor(private callback: () => void) {}

  schedule() {
    if (!this.timeout) this.timeout = requestAnimationFrame(this.call);
  }

  call = () => {
    this.timeout = undefined;
    this.callback();
  };
}
