# lildb

Super simple, in memory DB with persisting option.

In a small projects, we may have too much data to handle it manually as lot of JSONs, but not enough to start using real database. Usually I used `nedb` in such cases. But it is old, not maintained and most important using volnurable dependencies.

So here is lilDb with no dependencies at all.

## Creation of instance

Instance of lildb can be created without persist option
```javascript
import lildb from '@nosyara/lildb'
const db = new lildb()
```

You still may `saveAs` the database to a file, or connect and autoSave it to a file.
```javascript
import lildb from '@nosyara/lildb'
const db = new lildb()
db.insert({a:1})
await db.saveAs('mydb.db')
```
or connected with autosave every 30 seconds
```javascript
import lildb from '@nosyara/lildb'

const db = new lildb()
db.insert({a:1})
// Save every 30 seconds
db.connect('test.db', {autosave:30})
```

## Insert data

You can insert any object or array of objects. If object contains `_id` property - it would be used as ID, otherwais 32 char `_id` would be added automatically to each doc. 

```javascript
import MyDb from 'mydb'
const db = new MyDb()
db.insert({a:1})
db.insert([{a:2}, {a:3}, {a:4,_id:'my-unique-id'}])
```

## Query data

When simple query used, all properties should be equal

### Simple query
```javascript
const x = db.query({a:4})
const y = db.query({_id:'my-unique-id'})
```
Query keys can be deeper to compare internal properties

Both results should return the first record
```javascript
  db.insert({a:{b:123},c:[1,2,3]})
  db.insert({a:{b:567},c:[7,8,9]})

  const result1 = db.query({'a.b':123})
  const result2 = db.query({'c.1':2})
```

### Logical operations

You can use spatial keys in query: `$or`, `$and`, `$not`, `$in`, `$nin`, `$lt`, `$gt`, `$lte`, `$gte`

```javascript
db.insert([
    {a:10, b:10}, 
    {a:10, b:11}, 
    {a:11, b:10},
    {a:11, b:11}
])

const result1 = db.query({ $or: [{ a: 10 }, { b: 10 }] }) // return 3 records
const result2 = db.query({ $and: [{ a: 10 }, { b: 10 }] }) // return 1 record
const result3 = db.query({ $not: { a: 10 } }) // return 2 records
const result4 = db.query({ $in: { a: [10,11] } }) // return 4 records
const result5 = db.query({ $lt: { a: 11 } }) // return 2 records
const result6 = db.query({ $gt: { a: 10 } }) // return 2 records
const result7 = db.query({ $gte: { a: 10 } }) // return 4 records 
```

Several logical operations may be combined

```javascript
db.insert([
    {a:10, b:10}, 
    {a:10, b:11}, 
    {a:11, b:10},
    {a:11, b:11}
])

// a = 10 and b != 10
const result1 = db.query({ $and: [{ a: 10 }, {$not: { b: 10 }}] }) // returns 1 record 
```