const LilDb = require('../LilDb')

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

const res = db1.query({}, {projection: {name: 'name', room: 'joinDepartment.room'}})

console.log(JSON.stringify(res, null, 2))