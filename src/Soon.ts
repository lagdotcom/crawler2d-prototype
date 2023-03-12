export default class Soon {
  timeout?: number;

  constructor(private callback: () => void) {
    this.call = this.call.bind(this);
  }

  schedule() {
    if (!this.timeout) this.timeout = requestAnimationFrame(this.call);
  }

  private call() {
    this.timeout = undefined;
    this.callback();
  }
}
