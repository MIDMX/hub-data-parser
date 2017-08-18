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
            percentage: percentage,
            voltage: voltage,
            capacity: capacity,
            current: current,
            temperature: temperature,
            status: status
        }
    }

    /**
     * Extracts a signal packet from the buffer
     */
    getNetworkSignalInfo() {
        var rssi = this.getInteger();
        var ber = this.getInteger();
        if (rssi == 99) rssi = 0;
        var rssi_dbm = rssi * 2.032258065 - 115;
        return {
            rssi_raw: rssi,
            rssi_dbm: rssi_dbm,
            quality_band: ber
        }
    }

    /**
     * Extract a short location data (GSP/GPS) without extra fields
     */
    getShortLocationData() {
        var accuracy = this.getByte();
        var accuracy_as_text = accuracy == 0 ? 'NONE' : accuracy == 1 ? 'GPS' : 'GSM';

        // if accuracy is NONE (no GPS no GSM) don't parse lat and lon
        var flat = 0;
        var flon = 0;
        if (accuracy > 0) {
            flat = this.getFloat();
            flon = this.getFloat(); // Alain de Flon
        }

        return {
            loc: { lat: flat, lon: flon },
            accuracy: accuracy,
            accuracyText: accuracy_as_text
        }
    }

    /**
     * Extract a hybrid GSM/GPS location packet from the buffer
     */
    getLocationData() {
        var flat = this.getFloat(); // flat earther gtfo
        var flon = this.getFloat();
        var fix_status = this.getByte();
        var accuracy = this.getByte();
        var satellites_in_view = this.getByte();
        var satellites_used = this.getByte();
        var c_N0 = this.getByte();
        var accuracy_as_text = accuracy == 0 ? 'NONE' : accuracy == 1 ? 'GPS' : 'GSM';
        return {
            loc: { lat: flat, lon: flon },
            accuracy: accuracy,
            accuracyText: accuracy_as_text,
            gpsExtra: {
                fix: fix_status,
                satellitesUsed: satellites_used,
                satellitesInView: satellites_in_view,
                noiseRatio: c_N0
            }
        }
    }

    /**
     * Extracts a string from the buffer
     * The default encoding is ASCII!
     */
    getString(len) {
        var str = this.buffer.toString('ascii', this.offset, this.offset + len);
        this.offset += len;
        return str;
    }
}

module.exports = HubDataParser;