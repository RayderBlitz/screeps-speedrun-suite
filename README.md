# screeps-speedrun-suite

This is a plug and play library for Screeps speedrunning. It's supposed to display useful information for various runs so the data is more easily accessible.

## Room visuals

- Display GCL data, recording duration as well as (overall) avg. controller progress per tick per level
- Display current level's progress, time and controller progress (last 100 ticks by default), as well as estimate next RCL up as per available data

## Usage

Import the module to your codebase and use the `run` method to execute it where convenient. This could look like the following:

```js
const speedrunSuite = require("speedrun.suite");
mainLoop() {
  // other code
  speedrunSuite.run({ position: { x: 1, y: 25 }, avgDuration: 250 });
}
```

## Arguments

- position (x: int, y: int): the position you want to display the room visuals at, x = y = 1 by default
- avgDuration (int): the average duration you want to use for estimate CP calculations

### Debug / Not yet fully implemented

- startTime (int): sets the start time to be referenced as spawn time. Debug only, dont use for actual runs!
- maxRCL (int): the max RCL you want to display
- showPastMax (bool): whether or not you want to display data past the maxRCL (goal)
