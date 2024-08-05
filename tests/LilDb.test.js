const LilDb = require('../src/LilDb');
const fs = require('fs');

jest.mock('fs');

describe('LilDb', () => {
    let db;

    beforeEach(() => {
        db = new LilDb();
        jest.clearAllMocks(); // Clear mock calls between tests
    });

    describe('save', () => {
        it('should throw an error if no filename is set', async () => {
            await expect(() => db.save()).toThrow('No file name');
        });
    });

    describe('load', () => {
        it('should load data from a file and throw', async () => {
            fs.readFileSync.mockReturnValueOnce('[]');
            db.load('test.db')
            expect(fs.readFileSync).toHaveBeenCalledWith('test.db', 'utf-8');
        });
    });

    describe('saveAs', () => {
        it('should write to the file and set the filename', () => {
            const testData = { data: 'test data' };
            db.insert(testData);
            db.saveAs('newfile.db');
            expect(fs.writeFileSync).toHaveBeenCalledWith('newfile.db', expect.any(String), 'utf-8');
            expect(db.fileName).toBe('newfile.db');
        });
    });

    describe('insert', () => {
        it('should insert data correctly', () => {
            const data = { a: 1 };
            const result = db.insert(data);
            expect(result).toHaveLength(1);
            expect(result[0]).toHaveProperty('id');
        });
    });

    describe('insert throws duplicate ID', () => {
        it('should throw duplicate ID and when insert data incorrectly', async () => {
            const data = { id:1, a: 1 };
            const result = db.insert(data);
            await expect(() => db.insert(data)).toThrow('Duplicate id');
        });
    });




    describe('query', () => {
        it('should return correct query results', () => {
            const data = { name: 'John', age: 30 };
            db.insert(data);
            const result = db.query({ name: 'John' });
            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('John');
        })

        it('should return correct query results for nested prop', () => {
            const data = { name: 'John', age: 30, department: { name: 'Engineering' } };
            db.insert(data);
            const result = db.query({ "department.name": 'Engineering' });
            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('John');
        })

        it('should asc sort the result', () => {
            const data = [
                { name: 'John', age: 30 },
                { name: 'Jane', age: 25 }
            ];
            db.insert(data);
            const result = db.query({}, { sortAsc: 'age' });
            expect(result[0].name).toBe('Jane');
        })

        it('should asc sort the result', () => {
            const data = [
                { name: 'Jane', age: 25 },
                { name: 'John', age: 30 }
            ];
            db.insert(data);
            const result = db.query({}, { sortDesc: 'age' });
            expect(result[0].name).toBe('John');
        })

        it('should group data', () => {
            const data = [
                { role: "admin", name: 'Jane', age: 25 },
                { role: "admin", name: 'Mike', age: 40 },
                { role: "user", name: 'John', age: 30 }
            ];
            db.insert(data);
            const result = db.query({}, { group: 'role' });
            expect(result["admin"][0].name).toBe('Jane');
            expect(result["user"][0].name).toBe('John');
        })

        it('should use projection', () => {
            const data = [
                { name: 'Jane', age: 25 },
                { name: 'John', age: 30 }
            ];
            db.insert(data);
            const result = db.query({}, { projection: { user: "name" } });
            expect(result[0].user).toBe('Jane');
        })
    });

    describe('remove', () => {
        it('should remove data correctly', () => {
            const data = { name: 'John', age: 30 };
            db.insert(data);
            const removed = db.remove({ name: 'John' });
            expect(removed).toHaveLength(1);
            expect(db.query({ name: 'John' })).toHaveLength(0);
        });
    });

    describe('update', () => {
        it('should update data correctly', () => {
            const data = { name: 'John', age: 30 };
            db.insert(data);
            const updates = db.update({ name: 'John' }, { age: 31 });
            expect(updates).toHaveLength(1);
            expect(db.query({ age: 31 })).toHaveLength(1);
        });
    });

    describe('count', () => {
        it('should return the correct count', () => {
            db.insert({ name: 'John' });
            db.insert({ name: 'Jane' });
            expect(db.count()).toBe(2);
        });
    });
});
