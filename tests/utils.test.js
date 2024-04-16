import { deepValue, deepValueSet, uuid } from '../src/utils'

test('uuid', () => {
    const result = uuid()
    expect(result).toHaveLength(32)
    expect(result).toMatch(/^[a-zA-Z0-9]+$/)
});

test('deepValueSet', () => {
    const obj = { a: { b: { c: 1 } } }
    const key = 'a.b.c'
    const value = 2
    deepValueSet(key, obj, value)
    expect(obj.a.b.c).toBe(value)
})

test('deepValue', () => {
    const obj = { a: { b: { c: 1 } } }
    const key = 'a.b.c'
    const result = deepValue(key, obj)
    expect(result).toBe(1)
})