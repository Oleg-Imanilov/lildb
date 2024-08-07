const LilDb = require('../LilDb')

const db = new LilDb();
db.insert({a: 1});
db.saveAs('data/mydb.json');