import { deepValue } from "./utils"


function or(qq, doc) {
    if(!Array.isArray(qq)) throw new Error('Invalid query. $or must be an array.')
    for(let i = 0; i < qq.length; i++) {
        if(_(qq[i], doc) !== null) return true
    }
    return false
}

function and(qq, doc) {
    if(!Array.isArray(qq)) throw new Error('Invalid query. $and must be an array.')    
    for(let i = 0; i < qq.length; i++) {
        if(_(qq[i], doc) === null) return false
    }
    return true
}

function not(qq, doc) {
    return _(qq, doc) === null
}

function lt(q, doc) {
    if(typeof q !== 'object') throw new Error('Invalid query. $lt must be an object.')
    const keys = Object.keys(q)
    return keys.every(k => deepValue(k, doc) < q[k])
}

function gt(q, doc) {
    if(typeof q !== 'object') throw new Error('Invalid query. $gt must be an object.')
    const keys = Object.keys(q)
    return keys.every(k => deepValue(k, doc) > q[k])
}

function lte(q, doc) {
    if(typeof q !== 'object') throw new Error('Invalid query. $lte must be an object.')
    const keys = Object.keys(q)
    return keys.every(k => deepValue(k, doc) <= q[k])
}

function gte(q, doc) {
    if(typeof q !== 'object') throw new Error('Invalid query. $gte must be an object.')
    const keys = Object.keys(q)
    return keys.every(k => deepValue(k, doc) >= q[k])
}

function _in(q, doc) {
    if(typeof q !== 'object') throw new Error('Invalid query. $in/$nin must be an object.')
    const keys = Object.keys(q)
    if(!Object.values(q).every(v => Array.isArray(v))) throw new Error('Invalid query. Every value of $in/$nin must be an array.')
    return keys.every(k => q[k].includes(deepValue(k, doc)))
}


export default function _(query, doc) {
    const qq = Object.keys(query)
    const match = qq.map(k => {
        if(k.startsWith('$')) {
            if(k === '$or') return or(query[k], doc)
            if(k === '$and') return and(query[k], doc)
            if(k === '$not') return not(query[k], doc)
            if(k === '$lt') return lt(query[k], doc)
            if(k === '$gt') return gt(query[k], doc)
            if(k === '$lte') return lte(query[k], doc)
            if(k === '$gte') return gte(query[k], doc)
            if(k === '$in') return _in(query[k], doc)
            if(k === '$nin') return !_in(query[k], doc)
            return query[k] === deepValue(k, doc)
        } else {
            return query[k] === deepValue(k, doc)
        }
    }).every(v => v === true)
    return match ? doc : null;
}
