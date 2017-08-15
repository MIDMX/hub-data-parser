# hub-data-parser
Quick library to parse bytes continuously from a Nodejs buffer into float, integers, etc 

To use this library, just create the object from the buffer. Then, extract the data you are expecting using the provided functions.

**Note:** All variables are supposed to be stored in Little-Endian in the buffer

## Examples

Let's put inside a buffer a date & time, with year (2 bytes), month (1), day (1), hours (1), minutes (1), seconds (1). Let's add as well a 16 bits integer and a single 8 bit value.

```javascript

// Get the library
var HubDataParser = require('./hub-data-parser');

// Create a buffer with:
//
// datetime:
// 07 E1 = 2017
// 08 = August
// 15 = 15th
// 14 11 10 = 14:11:10
//
// integer:
// 10 1 = 0x0A01 = 2561
//
// char:
// 5
const buf = Buffer.from([
  0xE1, 0x07,
  8, 
  15, 
  14, 11, 10,
  1, 10, 
  5
]);

var p1 = new HubDataParser(buf);

console.log(p1.getDate());
console.log(p1.getInteger());
console.log(p1.getByte());
```

And the console log should be what we are expecting...

```
2017-08-15T14:11:10.000Z
2561
5
```
