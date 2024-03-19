import LilDb from '../src/LilDb';
import fs from 'fs';

jest.mock('fs');

describe('LilDb', () => {
    let db;

    beforeEach(() => {
        db = new LilDb();
        jest.clearAllMocks(); // Clear mock calls between tests
    });

    describe('connect', () => {
        it('should create and return a new instance of LilDb', () => {
            const connectedDb = LilDb.connect('test.db');
            expect(connectedDb).toBeInstanceOf(LilDb);
            expect(connectedDb.fileName).toBe('test.db');
        });
    });

    describe('setLog', () => {
        it('should set the log function', () => {
            const mockLog = jest.fn();
            db.setLog(mockLog);
            expect(db.log).toBe(mockLog);
        });
    });

    describe('save', () => {
        it('should throw an error if no filename is set', async () => {
            await expect(() => db.save()).toThrow('No file name');
        });
    });

    describe('saveAs', () => {
        it('should write to the file and set the filename', () => {
            const testData = {data:'test data'};
            db.insert(testData);
            db.saveAs('newfile.db');
            expect(fs.writeFileSync).toHaveBeenCalledWith('newfile.db', expect.any(String), 'utf8');
            expect(db.fileName).toBe('newfile.db');
        });
    });

    describe('insert', () => {
        it('should insert data correctly', () => {
            const data = { a: 1 };
            const result = db.insert(data);
            expect(result).toHaveLength(1);
            expect(result[0]).toHaveProperty('_id');
        });
    });

    describe('query', () => {
        it('should return correct query results', () => {
            const data = { name: 'John', age: 30 };
            db.insert(data);
            const result = db.query({ name: 'John' });
            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('John');
        });
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
