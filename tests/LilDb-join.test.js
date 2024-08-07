const LilDb = require('../src/LilDb');

describe('LilDb', function() {
  describe('join with query', function() {
    let db1, db2

    beforeEach(function() {
      db1 = new LilDb()
      db2 = new LilDb()

      db1.insert([
        { id: 1, name: 'John', cityId: 1 },
        { id: 2, name: 'Alice', cityId: 2 },
      ])

      db2.insert([
        { id: 1, city: 'New York' },
        { id: 2, city: 'London' },
      ])

      db1.join('city', db2, { cityId: 'id' })
    })

    it('should join and query records', function() {
      const result = db1.query({ name: 'John' }, { projection: { name: 'name', cityName: 'city.city' } })

        console.log(result)

      expect(result).toHaveLength(1) 
      expect(result[0].name).toBe('John')
      expect(result[0].cityName).toBe('New York') 

    })
  })
})