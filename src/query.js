const { deepValue } = require("./utils")

function _or(qq, doc) {
    if (!Array.isArray(qq)) throw new Error('Invalid query. $or must be an array.')
    for (let i = 0; i < qq.length; i++) {
        if (_(qq[i], doc) !== null) return true
    }
    return false
}

function _and(qq, doc) {
    if (!Array.isArray(qq)) throw new Error('Invalid query. $and must be an array.')
    for (let i = 0; i < qq.length; i++) {
        if (_(qq[i], doc) === null) return false
    }
    return true
}

function _not(qq, doc) {
    return _(qq, doc) === null
}

function _lt(q, doc) {
    if (typeof q !== 'object' || Array.isArray(q)) throw new Error('Invalid query. $lt must be an object.')
    const keys = Object.keys(q)
    return keys.every(k => deepValue(k, doc) < q[k])
}

function _ne(q, doc) {
    if (typeof q !== 'object' || Array.isArray(q)) throw new Error('Invalid query. $ne must be an object.')
    const keys = Object.keys(q)
    return keys.every(k => {
        const v1 = deepValue(k, doc)
        const v2 = q[k]
        return v1 !== v2
    })
}

function _regex(q, doc) {
    if (typeof q !== 'object' || Array.isArray(q)) throw new Error('Invalid query. $regex must be an object.')
    const keys = Object.keys(q)
    return keys.every(k => {
        const v1 = deepValue(k, doc)
        const v2 = q[k]
        return v1.match(v2)
    })
}

function _size(q, doc) {
    if (typeof q !== 'object' || Array.isArray(q)) throw new Error('Invalid query. $size must be an object.')
    const keys = Object.keys(q)
    return keys.every(k => {
        const v1 = deepValue(k, doc)
        const v2 = q[k]
        return v1.length === v2
    })
}

function _gt(q, doc) {
    if (typeof q !== 'object' || Array.isArray(q)) throw new Error('Invalid query. $gt must be an object.')
    const keys = Object.keys(q)
    return keys.every(k => deepValue(k, doc) > q[k])
}

function _lte(q, doc) {
    if (typeof q !== 'object' || Array.isArray(q)) throw new Error('Invalid query. $lte must be an object.')
    const keys = Object.keys(q)
    return keys.every(k => deepValue(k, doc) <= q[k])
}

function _gte(q, doc) {
    if (typeof q !== 'object' || Array.isArray(q)) throw new Error('Invalid query. $gte must be an object.')
    const keys = Object.keys(q)
    return keys.every(k => deepValue(k, doc) >= q[k])
}

function _null(q, doc) {
    if (typeof q !== 'string') throw new Error('Invalid query. $null must be an string (key).')
    const v = deepValue(q, doc)
    return v === null || v === undefined
}

function _in(q, doc) {
    if (typeof q !== 'object' || Array.isArray(q)) throw new Error('Invalid query. $in/$nin must be an object.')
    const keys = Object.keys(q)
    if (!Object.values(q).every(v => Array.isArray(v))) throw new Error('Invalid query. Every value of $in/$nin must be an array.')
    return keys.every(k => q[k].includes(deepValue(k, doc)))
}

function _nin(q, doc) {
    return !_in(q, doc)
}

const OP = {
    '$or': _or,
    '$and': _and,
    '$not': _not,
    '$lt': _lt,
    '$gt': _gt,
    '$lte': _lte,
    '$gte': _gte,
    '$in': _in,
    '$nin': _nin,
    '$ne': _ne,
    '$regex': _regex,
    '$size': _size,
    '$null': _null,
}

function _(query, doc) {
    if (typeof query !== 'object' || Array.isArray(query)) throw new Error('Invalid query. Must be an object.')
    const qq = Object.keys(query)
    if (qq.length === 0) return doc
    const match = qq.map(k => {
        if (k.startsWith('$')) {
            if(OP[k]) return OP[k](query[k], doc)
            return query[k] === deepValue(k, doc)
        } else {
            return query[k] === deepValue(k, doc)
        }
    }).every(v => v === true)
    return match ? doc : null;
}

module.exports = _;