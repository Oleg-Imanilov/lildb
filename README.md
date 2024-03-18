# LilDb: A Lightweight In-Memory Database with Persistence Option

In many small-scale projects, we often encounter a scenario where there's too much data to manage manually through numerous JSON files, yet not enough data to justify the overhead of integrating a full-fledged database system. In the past, solutions like NeDB provided a middle ground, but it has become outdated and is no longer maintained, with the added concern of relying on vulnerable dependencies.

Enter **LilDb**: a super-simple, in-memory database designed for small to medium projects. LilDb is crafted to fill the gap between raw JSON files and traditional databases by providing a streamlined, efficient data management solution without the complexity and maintenance issues.

## Key Features of LilDb:

* **Zero Dependencies**: **LilDb** is self-contained with absolutely no external dependencies, ensuring a lightweight footprint and minimizing security risks.
* **In-Memory Operations**: Fast data access and modifications directly in memory for high-speed performance.
* **Persistence Option**: While primarily an in-memory database, **LilDb** offers the option to persist your data, safeguarding against data loss during unplanned disruptions.
* **Ease of Use**: Designed with simplicity in mind, LilDb can be integrated into your project swiftly, allowing you to focus on development without wrestling with database complexities.

## Ideal Use Cases:

* Small to medium projects where traditional databases are overkill.
* Applications requiring rapid development cycles with minimal setup.
* Projects that need a lightweight solution to manage a moderate amount of data.
* Environments where external dependencies pose a security risk or increase overhead.

By choosing **LilDb**, you're opting for a modern, secure, and straightforward solution to manage your project's data effectively without the bloat and security concerns of older, unmaintained databases.

Feel free to adapt or expand this documentation to better fit the specifics of your project or to add more detailed instructions on how to install, configure, and use **LilDb**.


## Getting Started

### Creating an Instance

To create a new instance of **lilDb**, simply initialize it without any options for a pure in-memory experience:

```javascript
import lildb from '@nosyara/lildb';
const db = new lildb();
```
However, lilDb still provides the flexibility to persist your data:

* **Save to File**: Manually save the current state of the database to a file.
```javascript
import lildb from '@nosyara/lildb';
const db = new lildb();
db.insert({a: 1});
await db.saveAs('mydb.db');
```
* **AutoSave**: Automatically save the database to a file at specified intervals (e.g., every 30 seconds).
```javascript
import lildb from '@nosyara/lildb';

const db = new lildb();
db.insert({a: 1});
db.connect('test.db', {autosave: 30}); // Autosave every 30 seconds
```
## Data Manipulation

### Inserting Data

**lilDb** allows insertion of either single objects or arrays of objects. Each document will automatically be assigned a 32-character `_id` unless one is explicitly provided.

```javascript
import lildb from '@nosyara/lildb';
const db = new lildb();
db.insert({a: 1});
db.insert([{a: 2}, {a: 3}, {a: 4, _id: 'my-unique-id'}]);
```

### Querying Data

**lilDb** supports simple queries where all specified properties must match, as well as more advanced queries using logical operations.

Simple Queries
For a basic query, all properties in the query object must match those in the database.

```javascript
const x = db.query({a: 4});
const y = db.query({_id: 'my-unique-id'});
```

Queries can also match nested properties:
```javascript
db.insert({a: {b: 123}, c: [1, 2, 3]});
db.insert({a: {b: 567}, c: [7, 8, 9]});

const result1 = db.query({'a.b': 123});
const result2 = db.query({'c.1': 2});
```

Logical Operations

lilDb supports several logical operators within queries: `$or`, `$and`, `$not`, `$in`, `$nin`, `$lt`, `$gt`, `$lte`, and `$gte`.
```javascript
db.insert([
    {a: 10, b: 10}, 
    {a: 10, b: 11}, 
    {a: 11, b: 10},
    {a: 11, b: 11}
]);

const result1 = db.query({ $or: [{ a: 10 }, { b: 10 }] }); // Returns 3 records
const result2 = db.query({ $and: [{ a: 10 }, { b: 10 }] }); // Returns 1 record
const result3 = db.query({ $not: { a: 10 } }); // Returns 2 records
const result4 = db.query({ $in: { a: [10, 11] } }); // Returns 4 records
const result5 = db.query({ $lt: { a: 11 } }); // Returns 2 records
const result6 = db.query({ $gt: { a: 10 } }); // Returns 2 records
const result7 = db.query({ $gte: { a: 10 } }); // Returns 4 records
```

Multiple logical operations can be combined for more complex queries:
```javascript
// Condition: a = 10 and b != 10
const result1 = db.query({ $and: [{ a: 10 }, {$not: { b: 10 }}] }); // Returns 1 record
```

Enjoy using **lilDb** for your small project needs, providing a lightweight and efficient data management solution.
