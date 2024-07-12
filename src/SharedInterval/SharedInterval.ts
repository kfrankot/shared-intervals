/*global setInterval, clearInterval, NodeJS*/

export type BatchFn = (callback: () => unknown) => unknown

export class SharedInterval {
  private intervalId: number | NodeJS.Timeout
  private callbacks: Map<number, () => unknown> = new Map()

  constructor(
    public delay: number,
    public batchFn: BatchFn = (callback) => callback(),
  ) {
    // TODO: Need to check whether self re-assign is actually necessary, test it
    // by checking if changes to batchFn and callbacks are reflected
    const self = this
    this.intervalId = setInterval(() => {
      self.batchFn(() => {
        self.callbacks.forEach((callback) => callback())
      })
    }, this.delay)
  }

  clearInterval(): void {
    clearInterval(this.intervalId)
  }

  addCallback(callback: () => unknown, id: number) {
    this.callbacks.set(id, callback)
  }

  removeCallback(id: number): void {
    this.callbacks.delete(id)
  }

  has(id: number): boolean {
    return this.callbacks.has(id)
  }

  empty(): boolean {
    return this.callbacks.size === 0
  }
}
