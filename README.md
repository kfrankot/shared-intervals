# Shared Intervals

Shared Intervals is a TypeScript package designed to efficiently manage and synchronize multiple intervals with shared delays. For all intervals with the equal delays, it will use a single call to `setInterval`, so that all callbacks are triggered at the same time.

## Features

- **Sychronization of intervals**: All intervals with the same `delay` will be synchronized
- **Efficient Interval Management**: Manages multiple intervals with shared delays using a single `setInterval` per delay.
- **Batch Function Support**: Supports setting a batch function to wrap or modify callback execution.
- **Dynamic Callback Management**: Allows for the dynamic addition and removal of callbacks.

## Installation

To install Shared Intervals, run the following command in your project directory:

```bash
npm install shared-intervals
```

or if you are using `yarn`:

```bash
yarn add shared-intervals
```

## Usage

First, import `share:

### Setting a Shared Interval

To set a shared interval, you import `setSharedInterval` and call it like a typical call to `setInterval`.

```typescript
import { setSharedInterval } from 'shared-intervals'

const callbackId = setSharedInterval(() => {
  console.log('This will log every second globally.')
}, 1000)

const anotherCallbackId = setSharedInterval(() => {
  console.log('This will re-use the existing interval for 1000ms')
}, 1000)
```

### Clearing a Shared Interval

To clear a shared interval, use `clearSharedInterval` with the unique identifier returned by `setSharedInterval`.

```typescript
import { clearSharedInterval } from 'shared-intervals'

// Remove the callback associated with callbackId, but the interval continues running for other callbacks
clearSharedInterval(callbackId)
// Remove last callback, which will clear the interval entirely
clearSharedInterval(anotherCallbackId)
```

### Setting a Batch Function

To set a batch function that wraps or modifies the execution of all interval callbacks, use `setBatchFunction`.

```typescript
import { setBatchFunction } from 'shared-intervals'

setBatchFunction((executeCallbacksForInterval) => {
  console.log('Batch function: Before executing callbacks')
  executeCallbacksForInterval()
  console.log('Batch function: After executing callbacks')
})
```

### Multiple Shared Interval Instances

You may wish to have multipe independent instances of shared interval management. Use `SharedIntervalManager` for this.

```typescript
import { SharedIntervalManager } from 'shared-intervals'

const intervalManager1 = new SharedIntervalManager()
intervalManager1.setBatchFunction((executeAll) => {
  console.log('Batch function: Runs only for intervalManager1')
  executeAll()
})
const intervalManager2 = new SharedIntervalManager()

const callbackId1 = intervalManager1.setInterval(() => {
  console.log(
    'This will only share intervals with other callbacks from intervalManager1',
  )
}, 1000)
const callbackId2 = intervalManager2.setInterval(() => {
  console.log(
    'This will only share intervals with other callbacks from intervalManager2',
  )
}, 1000)
intervalManager1.clearInterval(callbackId1)
intervalManager2.clearInterval(callbackId2)
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
