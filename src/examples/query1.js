const LilDb = require('../LilDb')

const db = new LilDb('data/mydb3.json');

const x = db.query({a: 4});
console.log('x',x)
const y = db.query({id: 'my-unique-id'});
console.log('y',y)

