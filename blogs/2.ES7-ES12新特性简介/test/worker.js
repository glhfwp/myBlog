// var num = 0;
// function work() {
//   postMessage(num);  //用于向 HTML页面传回一段消息
//   num++;
//   setTimeout(work, 1000);
// }
// work();

const sharedBuffer = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * 10)
const sharedArray = new Int32Array(sharedBuffer) // (B)
// Share sharedBuffer with the worker
postMessage(sharedArray)
console.log(sharedArray[0]) // Int32Array(10) [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

setTimeout(() => {
  sharedArray[0] = 5; // 5
  // Atomics.store(typedArray, index, value) 将数组中指定的元素设置为给定的值，并返回该值。
  // typedArray一个指定类型的shared数组. 类型为Int8Array,Uint8Array,Int16Array,Uint16Array,Int32Array,Uint32Array。
  // index typedArray中用来存储value的位置.
  // value要存储的数字.
  console.log(Atomics.store(sharedArray, 0, 123)) // 123
  // Atomics.add 将指定位置上的数组元素与给定的值相加，并返回相加前该元素的值。
  console.log(Atomics.add(sharedArray, 0, 12)) // 123
  // Atomics.load 返回数组中指定元素的值。
  console.log(Atomics.load(sharedArray, 0)); // 135
  console.log(sharedArray) // Int32Array(10) [135, 0, 0, 0, 0, 0, 0, 0, 0, 0]
}, 1000)