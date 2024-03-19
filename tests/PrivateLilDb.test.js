import fs from 'fs';
import PrivateLilDb from '../src/PrivateLilDb';
import { uuid } from '../src/utils';

jest.mock('fs');
jest.mock('../src/utils', () => ({
    uuid: jest.fn()
}));


describe('PrivateLilDb', () => {
    let db;

    beforeEach(() => {
        db = new PrivateLilDb();
        jest.clearAllMocks();
        uuid.mockReturnValue('unique-id');
    });

    afterEach(() => {
        db.end()
    })

    describe('_connect method', () => {
        it('should read from the specified file and populate DB', () => {
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue('{"_id": "doc1", "data": "test"}\n{"_id": "doc2", "data": "example"}');

            db._connect('test.db');

            expect(db.DB).toHaveLength(2);
            expect(db.fileName).toBe('test.db');
            expect(fs.readFileSync).toHaveBeenCalledWith('test.db', 'utf-8');
        });

        it('should create a new file if it does not exist', () => {
            fs.existsSync.mockReturnValue(false);
            const mockSave = jest.spyOn(db, 'save');

            db._connect('newfile.db');

            expect(mockSave).toHaveBeenCalled();
            expect(db.fileName).toBe('newfile.db');
        });

        it('should set up autosave if autosave is enabled', () => {
            jest.useFakeTimers();
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue('');
            const mockSave = jest.spyOn(db, 'save');

            db._connect('test.db', { autoSave: 1 }); 

            jest.advanceTimersByTime(1001); 

            expect(db.save).toHaveBeenCalledTimes(1);

            jest.useRealTimers();
        });
    });

    describe('_insertDoc method', () => {
        it('should add a new document to DB', () => {
            const doc = { data: 'new' };

            const result = db._insertDoc(doc);

            expect(result._id).toBe('unique-id');
            expect(db.DB).toContainEqual({ _id: 'unique-id', data: 'new' });
        });

        it('should throw error if trying to insert a duplicate _id without override', () => {
            db.DB.push({ _id: 'unique-id', data: 'existing' });

            expect(() => {
                db._insertDoc({ _id: 'unique-id', data: 'new' });
            }).toThrow('Duplicate _id');
        });

        it('should replace a document if _id exists and override is true', () => {
            db.DB.push({ _id: 'unique-id', data: 'old' });

            db._insertDoc({ _id: 'unique-id', data: 'updated' }, true);

            expect(db.DB).toContainEqual({ _id: 'unique-id', data: 'updated' });
            expect(db.DB).toHaveLength(1); 
        });
    });

    describe('end', () => {
        it('should stop autosave if autosave was set', () => {
            jest.useFakeTimers();
            db._connect('test.db', { autoSave: 1 });
            const mockSave = jest.spyOn(db, 'save');            
            db.end();
            jest.advanceTimersByTime(1000); 
            expect(mockSave).toHaveBeenCalledTimes(1); 
            jest.useRealTimers();
        });
    });
    

});
