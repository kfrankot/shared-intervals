/*global global, setInterval, clearInterval*/

import { SharedInterval } from './SharedInterval'

describe('SharedInterval', () => {
  let originalSetInterval: typeof setInterval
  let originalClearInterval: typeof clearInterval
  let mockSetInterval: jest.Mock
  let mockClearInterval: jest.Mock

  beforeEach(() => {
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
  })

  test('constructor initializes correctly and starts interval', () => {
    const batchFn = jest.fn()
    const delay = 1000
    new SharedInterval(delay, batchFn)
    expect(mockSetInterval).toHaveBeenCalledWith(expect.any(Function), delay)
  })

  test('clearInterval clears the interval', () => {
    const interval = new SharedInterval(1000)
    interval.clearInterval()
    expect(mockClearInterval).toHaveBeenCalledWith(expect.anything())
  })

  test('addCallback and removeCallback manage callbacks correctly', () => {
    const interval = new SharedInterval(1000)
    const callback = jest.fn()
    interval.addCallback(callback, 1)
    expect(interval.has(1)).toBe(true)
    interval.removeCallback(1)
    expect(interval.has(1)).toBe(false)
  })

  test('empty returns true when no callbacks are present', () => {
    const interval = new SharedInterval(1000)
    expect(interval.empty()).toBe(true)
    interval.addCallback(() => {}, 1)
    expect(interval.empty()).toBe(false)
  })

  test('batchFn is called with a function that calls all callbacks', () => {
    const batchFn = jest.fn((executeAll) => executeAll())
    const callback1 = jest.fn()
    const callback2 = jest.fn()
    const interval = new SharedInterval(1000, batchFn)
    interval.addCallback(callback1, 1)
    interval.addCallback(callback2, 2)
    mockSetInterval.mock.calls[0][0]() // Simulate the interval tick
    expect(batchFn).toHaveBeenCalled()
    expect(callback1).toHaveBeenCalled()
    expect(callback2).toHaveBeenCalled()
  })
})
