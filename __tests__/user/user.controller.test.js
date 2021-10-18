/*eslint-env jest*/

const request = require('supertest');
const server = require('../../app');
const db = require('../../utils/db');

const userAccounts = [
    {
        email: 'user1@test.com',
        password: 'admin1234',
        name: 'User 1',
        contactNo: '0123456789',
    },
    {
        email: 'user2@test.com',
        password: 'admin1234',
        name: 'User 2',
        contactNo: '0123456789',
    },
    {
        email: 'user3@test.com',
        password: 'admin1234',
        name: 'User 3',
        contactNo: '0123456789',
    },
];

describe('POST/ user register', () => {
    beforeAll((done) => {
        db.connectMock({ users: [...userAccounts] })
            .then(() => done())
            .catch((err) => done(err));
    }, 20000);

    afterAll((done) => {
        db.close()
            .then(() => done())
            .catch((err) => done(err));
    });

    test('should send a 400 when email already exists', (done) => {
        request(server)
            .post('/user/register')
            .send(userAccounts[0])
            .then((res) => {
                expect(res.statusCode).toBe(400);
                expect(res.body.success).toBe(false);
                console.log(res.body);
                done();
            })
            .catch((err) => done(err));
    });

    test('should send a 200 when email is valid', (done) => {
        request(server)
            .post('/user/register')
            .send({
                name: 'User 5',
                email: 'user5@gmail.com',
                password: 'admin1234',
                contactNo: '0123456789',
            })
            .then((res) => {
                expect(res.statusCode).toBe(200);
                expect(res.body.success).toBe(true);
                done();
            })
            .catch((err) => done(err));
    });
});
