import { SharedInterval, BatchFn } from '../SharedInterval'

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

  setBatchFunction(batchFn: BatchFn): void {
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

export const setSharedInterval = sharedIntervalManagerGlobal.setInterval.bind(
  sharedIntervalManagerGlobal,
)
export const clearSharedInterval =
  sharedIntervalManagerGlobal.clearInterval.bind(sharedIntervalManagerGlobal)
export const setBatchFunction =
  sharedIntervalManagerGlobal.setBatchFunction.bind(sharedIntervalManagerGlobal)
