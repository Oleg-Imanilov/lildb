const { deepValue, deepValueSet, deepUpdate, uuid } = require('../src/utils')

test('uuid', () => {
    const result = uuid()
    expect(result).toHaveLength(32)
    expect(result).toMatch(/^[a-zA-Z0-9]+$/)
});


describe('deepValueSet', () => {
    it('should set the value of a nested property', () => {
        const obj = { a: { b: { c: 1 } } };
        const key = 'a.b.c';
        const value = 2;
        deepValueSet(key, obj, value);
        expect(obj.a.b.c).toBe(value);
    });

    it('should create nested properties if they do not exist', () => {
        const obj = {};
        const key = 'a.b.c';
        const value = 3;
        deepValueSet(key, obj, value);
        expect(obj.a.b.c).toBe(value);
    });

    it('should return undefined if the input is not an object', () => {
        const obj = 'not an object';
        const key = 'a.b.c';
        const value = 4;
        const result = deepValueSet(key, obj, value);
        expect(result).toBeUndefined();
    });
});


test('should return the value of a nested property', () => {
    const doc = {
        user: {
            name: 'Alice',
            age: 30
        }
    };

    const value = deepValue('user.name', doc);
    expect(value).toBe('Alice');
});

test('should return null if the property does not exist', () => {
    const doc = {
        user: {
            name: 'Alice',
            age: 30
        }
    }
    const value = deepValue('user.email', doc);
    expect(value).toBe(undefined)
});

test('should return null if the input is not an object', () => {
    const doc = 'not an object';

    const value = deepValue('user.name', doc);

    expect(value).toBeNull();
});

test('should return null if the key is falsy', () => {
    const doc = {
        user: {
            name: 'Alice',
            age: 30
        }
    }

    const value = deepValue('', doc);

    expect(value).toBeNull();
});


describe('deepUpdate', () => {
    it('should update nested properties in the object', () => {
        const from = {
            name: 'Alice',
            age: 30,
            address: {
                city: 'New York',
                zip: '10001'
            }
        };

        const to = {
            name: 'Bob',
            age: 25,
            address: {
                city: 'Los Angeles'
            }
        };

        deepUpdate(from, to);

        expect(to).toEqual({
            name: 'Alice',
            age: 30,
            address: {
                city: 'New York',
                zip: '10001'
            }
        });
    });

    it('should add new properties to the object', () => {
        const from = {
            hobby: 'Soccer',
            skills: {
                coding: 'JavaScript',
                design: 'Photoshop'
            }
        };

        const to = {
            name: 'Alice',
            skills: {
                cooking: 'Italian'
            }
        };

        deepUpdate(from, to);

        expect(to).toEqual({
            name: 'Alice',
            hobby: 'Soccer',
            skills: {
                coding: 'JavaScript',
                design: 'Photoshop',
                cooking: 'Italian'
            }
        });
    });

    it('should add new object properties to the object', () => {
        const from = {
            event: { name: 'Birthday Party' },
        };

        const to = {
            name: 'Alice',
            skills: {
                cooking: 'Italian'
            }
        };

        deepUpdate(from, to);

        expect(to).toEqual({
            name: 'Alice',
            event: { name: 'Birthday Party' },
            skills: {
                cooking: 'Italian'
            }
        });
    });
});