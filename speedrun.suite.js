'use strict';

const speedrunSuite = {
    run: function (args) {
        runSuite(args);
    }
}

const runSuite = function (args) {
    args = getArgs(args);
    const speedrunData = getSpeedrunData();
    if (speedrunData.roomName == undefined)
        return;
    const rclData = getRclData(speedrunData.roomName);
    trackRclProgress(speedrunData.roomName, args);
    const data = prepareData(rclData);
    displayData(args, data);
}
const getSpeedrunData = function () {
    if (!global.speedrunData) {
        global.speedrunData = {};
        for (const roomName of Object.keys(Game.rooms)) {
            if (Game.rooms[roomName].controller && Game.rooms[roomName].controller.my) {
                global.speedrunData.roomName = roomName;
                break;
            }
        }
        global.setup = true;
    }
    return global.speedrunData;
}
const getRclData = function (roomName) {
    const data = global.rclData || Memory.rclData && JSON.parse(Memory.rclData) || {},
        room = Game.rooms[roomName], controller = room.controller;
    let update = false;
    if (data[1] == undefined) {
        for (let x = 1; x <= controller.level; x++) {
            data[x] = Game.time;
        }
        update = true;
    }
    if (data[controller.level] == undefined) {
        data[controller.level] = Game.time;
        update = true;
    }
    if (update) {
        global.rclData = data;
        Memory.rclData = JSON.stringify(data);
    }
    return data;
}
const trackRclProgress = function (roomName, args) {
    const controller = Game.rooms[roomName].controller;
    if (!global.rclProgress || global.rclProgress.level != controller.level) {
        global.rclProgress = {
            level: controller.level,
            progress: [],
            last: controller.progress,
            avg: 0
        };
    }
    global.rclProgress.progress.push(controller.progress - global.rclProgress.last);
    global.rclProgress.last = controller.progress;
    while (global.rclProgress.progress.length > args.avgDuration)
        global.rclProgress.progress.splice(0, 1);
    let avg = 0;
    for (let x = 0; x < global.rclProgress.progress.length; x++) {
        avg += global.rclProgress.progress[x];
    }
    global.rclProgress.avg = avg / (global.rclProgress.progress.length || 1);
}
const prepareData = function (rclData) {
    const data = {}, max = Object.keys(rclData).length;
    data.spawned = rclData[1];
    data.max = max;
    for (let x = 1; x <= max; x++) {
        data[x] = {
            tick: rclData[x],
            time: rclData[x] - rclData[x - 1],
        };
    }
    return data;
}
const displayData = function (args, data) {
    const visual = new RoomVisual(), x = args.position.x, y = args.position.y, stop = Math.min(args.showPastMax ? Infinity : args.maxRCL, data.max);
    let line = y;
    visual.text("Speedrun Statistics:", x, line++, { align: "left", color: "#00CCFF" });
    for (let c = 2; c <= stop; c++) {
        let string = "RCL " + c + ": " + delimit(data[c].time) + " (" + delimit(data[c].tick - data.spawned) + ")";
        string += " - Avg. CP: " + (Math.floor(CONTROLLER_LEVELS[c - 1] / data[c].time * 10) / 10) + "e/t";
        visual.text(string, x, line++, { align: "left" });
    }
    // Current (to next) RCL
    if (data.max + 1 < args.maxRCL) {
        const nextRCL = data.max + 1, controller = Game.rooms[global.speedrunData.roomName].controller, toRcl = controller.progressTotal - controller.progress,
            ept = Math.floor(global.rclProgress.avg * 10) / 10, tickEstimate = Game.time + Math.floor(toRcl / ept), tPlusEstimate = tickEstimate - Game.time;
        visual.text("Next RCL: " + nextRCL, x, line++, { align: "left", color: "#AACCFF" });
        visual.text("Progress: " + delimit(controller.progress) + " / " + delimit(controller.progressTotal) + " (" + (Math.floor(controller.progress / controller.progressTotal * 1000) / 10) + "%)", x, line++, { align: "left" });
        visual.text("Elapsed: " + delimit(Game.time - data[data.max].tick) + " (" + delimit(Game.time - data.spawned) + ")", x, line++, { align: "left" });
        visual.text("Estimated RCL: " + (tPlusEstimate == Infinity ? "No Data" : "T+" + delimit(tPlusEstimate) +
            " (" + delimit(tickEstimate - data.spawned) + ")"), x, line++, { align: "left" });
        visual.text("Avg. Control Points: " + ept + "e/t", x, line++, { align: "left" });
    }
    // GOAL
    // visual.text("GOAL (RCL " + args.maxRCL + "):", x, line++, { align: "left", color: "#99FFFF" });
    // visual.text("RCL")
}
const getArgs = function (args = {}) {
    args.startTime = args.startTime || Memory.startTime || Game.time;
    args.position = args.position || { x: 1, y: 1 };
    args.avgDuration = args.avgDuration || 100;
    args.maxRCL = args.maxRCL || 8;
    args.showPastMax = args.showPastMax || false;
    return args;
}
const delimit = function (number, digit = 3) {
    const dec = number % 1;
    number = number.toString();
    let newNumber = "", post = "";
    if (dec) {
        const pre = number;
        number = "";
        for (const x in pre) {
            if (pre[x] == ".") {
                for (let y = +x + 1; y < pre.length; y++) {
                    post += pre[y];
                }
                break;
            }
            else {
                number += pre[x];
            }
        }
    }
    const offset = number.length % digit;
    for (const x in number) {
        const num = number[x];
        newNumber += (x > 0 && x % digit == offset ? "," : "") + num;
    }
    if (post)
        newNumber += "." + post;
    return newNumber;
}
const tickToClocktime = function (ticks) {
    return ticks;
}

module.exports = speedrunSuite;
