type BatchFn = (callback: () => unknown) => unknown

class SharedInterval {
  private intervalId: number
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

export class SharedIntervalManager {
  private intervals: Map<number, SharedInterval> = new Map()

  // TODO: Test batchFn with React batch function
  constructor(private batchFn: BatchFn = (callback) => callback()) {}

  setInterval(callback: () => void, delay: number): number {
    if (!this.intervals.has(delay)) {
      this.intervals.set(delay, new SharedInterval(delay, this.batchFn))
    }
    const sharedInterval = this.intervals.get(delay) as SharedInterval
    const uniqueId = this.getUniqueCallbackId()
    sharedInterval.addCallback(callback, uniqueId)
    return uniqueId
  }

  clearInterval(callbackId: number): void {
    const interval = this.getSharedIntervalByCallbackId(callbackId)
    if (interval) {
      interval.removeCallback(callbackId)
      if (interval.empty()) {
        interval.clearInterval()
        this.intervals.delete(interval.delay)
      }
    }
  }

  setBatchFn(batchFn: BatchFn): void {
    this.batchFn = batchFn
    for (let interval of this.intervals.values()) {
      interval.batchFn = batchFn
    }
  }

  private getUniqueCallbackId(): number {
    let random: number
    do {
      random = Math.random()
    } while (this.idExists(random))
    return random
  }

  private idExists(id: number): boolean {
    const interval = this.getSharedIntervalByCallbackId(id)
    return !!interval
  }

  private getSharedIntervalByCallbackId(
    id: number,
  ): SharedInterval | undefined {
    for (let interval of this.intervals.values()) {
      if (interval.has(id)) {
        return interval
      }
    }
  }
}

const sharedIntervalManagerGlobal = new SharedIntervalManager()

export const setInterval = sharedIntervalManagerGlobal.setInterval.bind(
  sharedIntervalManagerGlobal,
)
export const clearInterval = sharedIntervalManagerGlobal.clearInterval.bind(
  sharedIntervalManagerGlobal,
)
export const setBatchFn = sharedIntervalManagerGlobal.setBatchFn.bind(
  sharedIntervalManagerGlobal,
)
