const fs = require("fs");
const EventEmitter = require("events");

function createLeakyClosure() {
  const largeArray = new Array(1000).fill("leak");
  return function () {
    console.log(largeArray.length);
  };
}
const leakyClosure = createLeakyClosure();

const emitter = new EventEmitter();
for (let i = 0; i < 100; i++) {
  emitter.on("event", () => {
    console.log("Listener " + i);
  });
}
emitter.emit("event");

const cache = new Map();
for (let i = 0; i < 100; i++) {
  const largeData = new Array(1000).fill("data");
  cache.set(`key-${i}`, largeData);
}

global.largeData = new Array(1000).fill("global leak");

const writeStream = fs.createWriteStream("./leak.txt");
for (let i = 0; i < 1000; i++) {
  writeStream.write("This is a leaky file operation\n");
}

console.log("Memory usage before next tick:");
console.log(process.memoryUsage());

if (global.gc) {
  global.gc();
  console.log("Memory usage after GC:");
  console.log(process.memoryUsage());
} else {
  console.log(
    "Run the script with `--expose-gc` to measure memory usage after garbage collection."
  );
}
