const LilDb = require('../LilDb')

const db = new LilDb();
db.insert({a: 1});
db.insert([{a: 2}, {a: 3}, {a: 4, id: 'my-unique-id'}]);
db.saveAs('data/mydb3.json')