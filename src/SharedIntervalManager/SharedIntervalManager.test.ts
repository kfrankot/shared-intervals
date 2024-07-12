/*global global, setInterval, clearInterval*/

import {
  SharedIntervalManager,
  setSharedInterval,
  clearSharedInterval,
  setBatchFunction,
} from './SharedIntervalManager'

describe('SharedIntervalManager', () => {
  let manager: SharedIntervalManager
  let originalSetInterval: typeof setInterval
  let originalClearInterval: typeof clearInterval
  let mockSetInterval: jest.Mock
  let mockClearInterval: jest.Mock

  beforeEach(() => {
    manager = new SharedIntervalManager()
    originalSetInterval = global.setInterval
    originalClearInterval = global.clearInterval
    mockSetInterval = jest.fn(() =>
      Math.round(Math.random() * Number.MAX_SAFE_INTEGER),
    )
    mockClearInterval = jest.fn()
    global.setInterval = mockSetInterval as unknown as typeof setInterval
    global.clearInterval = mockClearInterval
  })

  afterEach(() => {
    global.setInterval = originalSetInterval
    global.clearInterval = originalClearInterval
    jest.resetAllMocks()
    jest.clearAllTimers()
  })

  test('should add a single interval correctly', () => {
    const callback = jest.fn()
    const delay = 1000
    const id = manager.setInterval(callback, delay)

    expect(typeof id).toBe('number')
    expect(manager['intervals'].has(delay)).toBeTruthy()
  })

  test('should manage multiple intervals with different delays separately', () => {
    const callback1 = jest.fn()
    const callback2 = jest.fn()
    const delay1 = 1000
    const delay2 = 2000

    manager.setInterval(callback1, delay1)
    manager.setInterval(callback2, delay2)

    expect(manager['intervals'].has(delay1)).toBeTruthy()
    expect(manager['intervals'].has(delay2)).toBeTruthy()
    expect(manager['intervals'].size).toBe(2)
  })

  test('should manage multiple intervals with the same delay by the same SharedInterval instance', () => {
    const callback1 = jest.fn()
    const callback2 = jest.fn()
    const delay = 1000

    manager.setInterval(callback1, delay)
    manager.setInterval(callback2, delay)

    expect(manager['intervals'].get(delay)?.['callbacks'].size).toBe(2)
  })

  test('should clear an interval correctly', () => {
    const callback1 = jest.fn()
    const callback2 = jest.fn()
    const delay = 1000
    const id1 = manager.setInterval(callback1, delay)
    const id2 = manager.setInterval(callback2, delay)

    manager.clearInterval(id1)
    expect(manager['intervals'].get(delay)?.['callbacks'].size).toBe(1)

    manager.clearInterval(id2)
    expect(manager['intervals'].has(delay)).toBeFalsy()
  })

  test('should ensure unique callback IDs for each interval', () => {
    const callback1 = jest.fn()
    const callback2 = jest.fn()
    const delay = 1000

    const id1 = manager.setInterval(callback1, delay)
    const id2 = manager.setInterval(callback2, delay)

    expect(id1).not.toEqual(id2)
  })

  test('should execute callback within the interval', () => {
    // useFakeTimers overwrites the setInterval and clearInterval mocks
    jest.useFakeTimers()
    const callback = jest.fn()
    const callbackNotToBeCalled = jest.fn()
    const delay = 1000

    const mockBatchFn = jest.fn((executeAll) => executeAll())
    manager.setBatchFunction(mockBatchFn)
    manager.setInterval(callback, delay)
    manager.setInterval(callbackNotToBeCalled, delay + 1000)
    jest.advanceTimersByTime(delay)

    expect(mockBatchFn).toHaveBeenCalled()
    expect(callback).toHaveBeenCalled()
    expect(callbackNotToBeCalled).not.toHaveBeenCalled()
    jest.useRealTimers()
  })

  test('should update batch function for all intervals', () => {
    jest.useFakeTimers()
    const callback = jest.fn()
    const delay = 1000

    const mockBatchFnOld = jest.fn((executeAll) => executeAll())
    const mockBatchFnNew = jest.fn((executeAll) => executeAll())
    manager.setBatchFunction(mockBatchFnOld)
    manager.setInterval(callback, delay)
    manager.setBatchFunction(mockBatchFnNew)
    jest.advanceTimersByTime(delay)

    expect(mockBatchFnOld).not.toHaveBeenCalled()
    expect(mockBatchFnNew).toHaveBeenCalledTimes(1)
    jest.useRealTimers()
  })

  test('global handlers should work correctly', () => {
    jest.useFakeTimers()
    const callback = jest.fn()
    const delay = 1000

    const mockBatchFn = jest.fn((executeAll) => executeAll())
    setBatchFunction(mockBatchFn)
    const id = setSharedInterval(callback, delay)
    jest.advanceTimersByTime(delay)

    expect(mockBatchFn).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledTimes(1)

    clearSharedInterval(id)
    jest.advanceTimersByTime(delay)

    expect(mockBatchFn).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledTimes(1)

    jest.useRealTimers()
  })
})
