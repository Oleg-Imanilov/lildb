# lildb

Super simple, in memory DB with persisting option.

In a small projects, we may have too much data to handle it manually as lot of JSONs, but not enough to start using real database. Usually I used `nedb` in such cases. But it is old, not maintained and most important using volnurable dependencies.

So here is lilDb with no dependencies at all.

## Creation of instance

Instance of lildb can be created without persist option
```javascript
import MyDb from 'lildb'
const db = new MyDb()
```

You still may `saveAs` the database to a file, or connect and autoSave it to a file.
```javascript
import MyDb from 'mydb'
const db = new MyDb()
await db.insert({a:1})
await db.saveAs('mydb.db')
```
or
```javascript
import MyDb from 'mydb'
const db = new MyDb()
await db.insert({a:1})
// Save every 30 seconds
db.connect('test.db', {autosave:30})
```

