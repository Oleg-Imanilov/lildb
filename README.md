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

#### **Save to File**: Manually save the current state of the database to a file.
```javascript
import lildb from '@nosyara/lildb';
const db = new lildb();
db.insert({a: 1});
db.saveAs('mydb.db');
```
or 
```javascript
import lildb from '@nosyara/lildb';
const db = new lildb();
db.load('mydb.db');
// ...
db.save()
// ...
db.insert({b: 2});
// ...
db.save()
```

## Data Manipulation

### Inserting Data

**lilDb** allows insertion of either single objects or arrays of objects. Each document will automatically be assigned a 32-character `id` unless one is explicitly provided.

```javascript
import lildb from '@nosyara/lildb';
const db = new lildb();
db.insert({a: 1});
db.insert([{a: 2}, {a: 3}, {a: 4, id: 'my-unique-id'}]);
```

### Querying Data

**lilDb** supports simple queries where all specified properties must match, as well as more advanced queries using logical operations.

Simple Queries
For a basic query, all properties in the query object must match those in the database.

```javascript
const x = db.query({a: 4});
const y = db.query({id: 'my-unique-id'});
```

Queries can also match nested properties:
```javascript
db.insert({a: {b: 123}, c: [1, 2, 3]});
db.insert({a: {b: 567}, c: [7, 8, 9]});

const result1 = db.query({'a.b': 123});
const result2 = db.query({'c.1': 2});
```

Logical Operations

lilDb supports several logical operators within queries: `$or`, `$and`, `$not`, `$in`, `$nin`, `$lt`, `$gt`, `$lte`,  `$gte`, `$regex`,`$size`, `$null`.
   

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

db.insert([
  {x:10, a:{b:{c:1}}}, 
  {x:20, a:{b:{c:2}}}, 
  {x:30, a:{b:{c:3}}}])

// Condition a->b->c in (2, 3, 4)
const result2 = db.query({$in: { 'a.b.c': [2,3,4] }}) // returns 2 records
```

### Query Options

Query result may be sorted, grouped and projected. 
`db.query(<query object>, <options>)`

**LilDb** supports following options:
* **projection**: {newName: dot.separated.property}
* **sortAsc**: dot.separated.property
* **sortDesc**: dot.separated.property
* **group**: dot.separated.property

### Data Example

```javascript
  const users = [
    { id:1, name: 'Alice', department: { name: 'Engineering', managerId: 2 }, role: 'Developer' },
    { id:2, name: 'Bob', department: { name: 'Engineering', managerId: null }, role: 'Manager' },
    { id:3, name: 'Charlie', department: { name: 'Sales', managerId: 4 }, role: 'Salesperson' },
    { id:4, name: 'Diana', department: { name: 'Sales', managerId: null }, role: 'Manager' },
    { id:5, name: 'Ethan', department: { name: 'HR', managerId: 6 }, role: 'Recruiter' },
    { id:6, name: 'Fiona', department: { name: 'HR', managerId: null }, role: 'Manager' },
  ];
  db.insert(users);
```

### Sorting

Any query result may be sorted by using `sortAsc` or `sortDesc` option 

```javascript
  const result = db.query({}, {sortDesc: 'name', projection: { user:"name", manager: "department.managerId" }});
```
The output:
```javascript
[
  {"user": "Fiona","manager": null},
  {"user": "Ethan","manager": 6},
  {"user": "Diana","manager": null},
  {"user": "Charlie","manager": 4},
  {"user": "Bob","manager": null},
  {"user": "Alice","manager": 2}
]
```

### Groupping

```javascript
  const result = db.query({}, {group:'department.name'});
```
The output:
```javascript
{"Engineering": [
  { "id": 1, "name": "Alice", "department": { "name": "Engineering", "managerId": 2}, "role": "Developer" },
  { "id": 2, "name": "Bob", "department": { "name": "Engineering", "managerId": null}, "role": "Manager" }
],
"Sales": [
  { "id": 3, "name": "Charlie", "department": { "name": "Sales", "managerId": 4}, "role": "Salesperson" },
  { "id": 4, "name": "Diana", "department": { "name": "Sales", "managerId": null}, "role": "Manager" }
],
"HR": [
  { "id": 5, "name": "Ethan", "department": { "name": "HR", "managerId": 6}, "role": "Recruiter" },
  { "id": 6, "name": "Fiona", "department": { "name": "HR", "managerId": null }, "role": "Manager"}
]}
```

### Group & Projection 

```javascript
  const result = db.query({}, { group:'department.name', projection: { user:"name", department: "department.name" }});
```

Output:

```javascript
{
  "Engineering": [
    { "user": "Alice", "department": "Engineering" },
    { "user": "Bob", "department": "Engineering" }
  ],
  "Sales": [
    { "user": "Charlie", "department": "Sales" },
    { "user": "Diana", "department": "Sales" }
  ],
  "HR": [
    { "user": "Ethan", "department": "HR" },
    { "user": "Fiona", "department": "HR" }
  ]
}
```

### Join DBs

```javascript
const db1 = new LilDb()
const db2 = new LilDb()

db1.insert([
  {id:1, name: "Samon", department: { name: "Sales"}},
  {id:2, name: "David", department: { name: "Sales"}},
  {id:3, name: "Sarah", department: { name: "Finance"}}
])

db2.insert([
  {id:1, departmentName: "Sales", room: 123 },
  {id:2, departmentName: "Finance", room: 678 },
])

db1.join('joinDepartment', db2, {'department.name': 'departmentName'})

const result = db1.query({}, {projection: {name: 'name', room: 'joinDepartment.room'}})
```
Results:
```javascript
[
  {"name": "Samon","room": 123},
  {"name": "David","room": 123},
  {"name": "Sarah","room": 678}
]
```


Enjoy using **lilDb** for your small project needs, providing a lightweight and efficient data management solution.
