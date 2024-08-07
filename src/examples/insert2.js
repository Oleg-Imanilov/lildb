const LilDb = require('../LilDb')

const db = new LilDb();
db.load('data/mydb.json');
db.insert({b: 2});
db.save()