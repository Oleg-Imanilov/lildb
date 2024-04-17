import q from '../src/query.js'; 

describe('Query Functions', () => {
    const doc = {
        name: 'John Doe',
        age: 30,
        details: {
            height: 175,
            location: 'New York'
        },
        hobbies: ['reading', 'swimming', 'coding']
    };

    describe('_not function', () => {
        it('should return false if any condition matches', () => {
            const query = { $not: { age: 30 } };
            expect(q(query, doc)).toBeFalsy();
        });

        it('should return true if no conditions match', () => {
            const query = { $not: { age: 31 } };
            expect(q(query, doc)).toBeTruthy();
        });
    });

    describe('_or function', () => {
        it('should return true if any condition matches', () => {
            const query = { $or: [{ age: 30 }, { age: 31 }] };
            expect(q(query, doc)).toBeTruthy();
        });

        it('should return false if no conditions match', () => {
            const query = { $or: [{ age: 31 }, { age: 32 }] };
            expect(q(query, doc)).toBeFalsy();
        });

        it('should throw error if $or is not an array', () => {
            const query = { $or: { age: 30 } };
            expect(() => q(query, doc)).toThrow('Invalid query. $or must be an array.');
        });
    });
    
    describe('_and function', () => {
        it('should return true if all conditions match', () => {
            const query = { $and: [{ age: 30 }, { 'details.height': 175 }] };
            expect(q(query, doc)).toBeTruthy();
        });

        it('should return false if any condition does not match', () => {
            const query = { $and: [{ age: 30 }, { age: 31 }] };
            expect(q(query, doc)).toBeFalsy();
        });

        it('should throw error if $and is not an array', () => {
            const query = { $and: { age: 30 } };
            expect(() => q(query, doc)).toThrow('Invalid query. $and must be an array.');
        });
    });

    describe('_lt function', () => {
        it('should return true if the field is less than the value', () => {
            const query = { $lt: { age: 35 } };
            expect(q(query, doc)).toBeTruthy();
        });

        it('should return true if the deep field is less than the value', () => {
            const query = { $lt: { "details.height": 176}};
            expect(q(query, doc)).toBeTruthy();
        });

        it('should return false if the field is not less than the value', () => {
            const query = { $lt: { age: 25 } };
            expect(q(query, doc)).toBeFalsy();
        });

        it('should return false if the field is equal to the value', () => {
            const query = { $lt: { age: 30 } };
            expect(q(query, doc)).toBeFalsy();
        });

        it('should throw error if $lt is not an object', () => {
            const query = { $lt: ['age', 35] };
            expect(() => q(query, doc)).toThrow('Invalid query. $lt must be an object.');
        });
    });

    describe('_gt function', () => {
        it('should return true if the field is greater than the value', () => {
            const query = { $gt: { age: 25 } };
            expect(q(query, doc)).toBeTruthy();
        });

        it('should return false if the field is not greater than the value', () => {
            const query = { $gt: { age: 35 } };
            expect(q(query, doc)).toBeFalsy();
        });

        it('should return false if the field is equalto the value', () => {
            const query = { $gt: { age: 30 } };
            expect(q(query, doc)).toBeFalsy();
        });

        it('should throw error if $gt is not an object', () => {
            const query = { $gt: ['age', 35] };
            expect(() => q(query, doc)).toThrow('Invalid query. $gt must be an object.');
        });
    });

    describe('_lte function', () => {
        it('should return true if the field is less than the value', () => {
            const query = { $lte: { age: 35 } };
            expect(q(query, doc)).toBeTruthy();
        });

        it('should return true if the field is equal to value', () => {
            const query = { $lte: { age: 30 } };
            expect(q(query, doc)).toBeTruthy();
        });

        it('should return false if the field is not less than the value', () => {
            const query = { $lte: { age: 25 } };
            expect(q(query, doc)).toBeFalsy();
        });

        it('should throw error if $lte is not an object', () => {
            const query = { $lte: ['age', 35] };
            expect(() => q(query, doc)).toThrow('Invalid query. $lte must be an object.');
        });
    });

    describe('_gte function', () => {
        it('should return true if the field is greater than the value', () => {
            const query = { $gte: { age: 25 } };
            expect(q(query, doc)).toBeTruthy();
        });

        it('should return true if the field is equal to the value', () => {
            const query = { $gte: { age: 30 } };
            expect(q(query, doc)).toBeTruthy();
        });

        it('should return false if the field is not greater than the value', () => {
            const query = { $gte: { age: 35 } };
            expect(q(query, doc)).toBeFalsy();
        });

        it('should throw error if $gte is not an object', () => {
            const query = { $gte: ['age', 35] };
            expect(() => q(query, doc)).toThrow('Invalid query. $gte must be an object.');
        });
    });

    describe('_in function', () => {
        it('should return true if the value is in the array', () => {
            const query = { $in: { age: [23, 30] } };
            expect(q(query, doc)).toBeTruthy();
        });

        it('should return false if the value is not in the array', () => {
            const query = { $in: { age: [70, 80] } };
            expect(q(query, doc)).toBeFalsy();
        });

        it('should throw error if $in is not an object with array values', () => {
            const query = { $in: { age: 30 } };
            expect(() => q(query, doc)).toThrow('Invalid query. Every value of $in/$nin must be an array.');
        });
    });

    describe('_nin function', () => {
        it('should return false if the value is in the array', () => {
            const query = { $nin: { age: [23, 30] } };
            expect(q(query, doc)).toBeFalsy();
        });

        it('should return true if the value is not in the array', () => {
            const query = { $nin: { age: [70, 80] } };
            expect(q(query, doc)).toBeTruthy();
        });

        it('should throw error if $nin is not an object with array values', () => {
            const query = { $nin: { age: 30 } };
            expect(() => q(query, doc)).toThrow('Invalid query. Every value of $in/$nin must be an array.');
        });
    });

    it('should return true if nested operator used', () => {
        const query = { $not : {$lt: { age: 25 }}};
        expect(q(query, doc)).toBeTruthy();
    });


});
