/*eslint-env jest*/

const request = require('supertest');
const server = require('../../app');
const db = require('../../utils/db');

describe('POST/ user login', () => {
    test('dummy test', () => {
        expect(3 + 2).toBe(5);
    });
});
