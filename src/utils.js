import crypto from 'crypto';

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

export function deepValue(key, doc) {
    if (typeof doc !== 'object' || !key) return null
    const kk = Array.isArray(key) ? key : key.split('.')
    const d = doc[kk[0]]
    if (kk.length === 1) {
        return d
    } else {
        return deepValue(kk.slice(1), d)
    }
}

export function deepValueSet(key, doc, value) {
    if (typeof doc !== 'object') return
    const kk = Array.isArray(key) ? key : key.split('.')
    if (kk.length === 1) {
        doc[kk[0]] = value
        return
    } else {
        if(doc[kk[0]] === undefined) doc[kk[0]] = {}
        return deepValueSet(kk.slice(1), doc[kk[0]], value)
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

export function project(doc, projection) {
    const projected = {}
    Object.keys(projection).forEach(k => {
        projected[k] = deepValue(projection[k], doc)
    })
    return projected
}
