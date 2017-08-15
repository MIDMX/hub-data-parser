'use strict';

/**
 * Library to parse byte buffer from MQTT packets
 */

class HubDataParser {

    /**
     * Creates the parser from a buffer
     */
    constructor(buffer) {
        this.buffer = buffer;
        this.offset = 0; // start from the first byte
    }

    /**
     * Extracts the date from the buffer with the current offset
     * @returns 
     */
    getDate() {
        var o = this.offset;

        // read
        var y = this.buffer.slice(o, o + 2).readUInt16LE(); o += 2;
        var m = this.buffer.slice(o, o + 1).readUInt8(); o += 1;
        var d = this.buffer.slice(o, o + 1).readUInt8(); o += 1;
        var hr = this.buffer.slice(o, o + 1).readUInt8(); o += 1;
        var mn = this.buffer.slice(o, o + 1).readUInt8(); o += 1;
        var sc = this.buffer.slice(o, o + 1).readUInt8(); o += 1;

        // min max
        if (y < 1970) y = 1970;
        else if (y > 2050) y = 2050;
        if (m < 1) m = 1;
        else if (m > 12) m = 12;
        m -= 1;
        if (hr > 23) hr = 23;
        if (mn > 59) mn = 59;
        if (sc > 59) sc = 59;

        this.offset = o;

        return new Date(Date.UTC(y, m, d, hr, mn, sc));
    }

    /**
     * Extracts a float from the buffer
     */
    getFloat() {
        var o = this.offset;
        this.offset += 4;
        return this.buffer.slice(o, o + 4).readFloatLE();
    }

    /**
     * Extracts an Int from the buffer
     */
    getInteger() {
        var o = this.offset;
        this.offset += 2;
        return this.buffer.slice(o, o + 2).readInt16LE();
    }

    /**
     * Extracts a single byte from the buffer
     */
    getByte() {
        var o = this.offset;
        this.offset += 1;
        return this.buffer.slice(o, o + 1).readUInt8();
    }

    /**
     * Extracts a battery data from the buffer
     */
    getBatteryData() {
        var percentage = this.getInteger();
        var voltage = this.getInteger();
        var capacity = this.getInteger();
        var current = this.getInteger();
        var temperature = this.getFloat();
        var status = this.getByte();
        return {
            percentage:percentage,
            voltage:voltage,
            capacity:capacity,
            current:current,
            temperature:temperature,
            status:status
        }
    }
}

module.exports = HubDataParser;