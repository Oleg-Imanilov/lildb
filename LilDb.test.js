import LilDb from './LilDb.js';

test('inmemory instance', () => {
    const db = new LilDb()
    expect(db.count()).toBe(0)
    expect(db).toBeInstanceOf(LilDb)
});


test('inmemory insert', () => {
    const db = new LilDb()
    db.insert({ name: 'John', age: 21 });
    expect(db.count()).toBe(1)
});
