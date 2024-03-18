import crypto from 'crypto';
import { performance } from 'perf_hooks';
import { createReadStream, promises as fs } from 'fs';
import { createInterface } from 'readline';

const ALPHANUMERICS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/**
 * @param {*} length of target string
 * @returns random alphanumeric string of length
 */
export function uuid(length = 32) {
    return Array.from(crypto.randomBytes(length))
        .map(i => ALPHANUMERICS[i % ALPHANUMERICS.length])
        .join('');
}

/**
 * @returns hexadecimal string of current time in microseconds
 */
export function mikroNow() {
    const currentTimeMillis = Date.now(); // Current timestamp in milliseconds
    const highResTimeMillis = performance.now(); // High-resolution time in milliseconds
    const currentTimeMicros = BigInt(currentTimeMillis) * BigInt(1000);
    const elapsedMicros = BigInt(Math.floor(highResTimeMillis * 1000));
    const fullTimeInMicros = currentTimeMicros + elapsedMicros;
    return fullTimeInMicros.toString(16);
}

/**
 * @param {*} hexString 
 * @returns [Date, microsecond]
 */
export function microHexToDateTime(hexString) {
    const microseconds = BigInt('0x' + hexString);
    const milliseconds = Number(microseconds / BigInt(1000));
    const micro = Number(microseconds % BigInt(1000));
    return [new Date(milliseconds), micro];
}


export async function fileExists(fileName) {
    try {
        await fs.access(fileName);
        return true;
    } catch {
        return false;
    }
}

export function deepValue(key, doc) {
    if (typeof doc !== 'object') return null
    const kk = key.split('.')
    const d = doc[kk[0]]
    if (kk.length === 1) {
        return d
    } else {
        return deepValue(kk.slice(1).join('.'), d)
    }
}

export function deepValueSet(key, doc, value) {
    if (typeof doc !== 'object') return
    const kk = key.split('.')
    if (kk.length === 1) {
        doc[kk[0]] = value
        return
    } else {
        return deepValueSet(kk.slice(1).join('.'), doc[kk[0]], value)
    }
}

export function deepUpdate(from, to) {
    Object.keys(from).forEach(k => {
        if (typeof from[k] === 'object') {
            to[k] = to[k] || {}
            deepUpdate(from[k], to[k])
        } else {
            to[k] = from[k]
        }
    })
}


export async function processFileLineByLine(filePath, handleLine, handleEnd) {
    const fileStream = createReadStream(filePath);

    const rl = createInterface({
        input: fileStream,
        crlfDelay: Infinity, 
    });

    for await (const line of rl) {
        handleLine(line);
    }
    handleEnd()
}

