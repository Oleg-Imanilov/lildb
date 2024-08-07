const LilDb = require('../LilDb')

const db = new LilDb();

db.insert({a: {b: 123}, c: [1, 2, 3]});
db.insert({a: {b: 567}, c: [7, 8, 9]});

const result1 = db.query({'a.b': 123});
console.log('result1', result1)
const result2 = db.query({'c.1': 2});
console.log('result2', result2)