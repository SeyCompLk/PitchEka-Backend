/*eslint-env jest*/

const request = require('supertest');
const server = require('../../app');
const db = require('../../utils/db');

const adminAccounts = [
    {
        email: 'admin1@test.com',
        password: 'admin1234',
        verified: false,
    },
    {
        email: 'admin2@test.com',
        password: 'admin1234',
        verified: true,
    },
    {
        email: 'admin3@test.com',
        password: 'admin1234',
        verified: true,
    },
];

describe('POST/ admin register', () => {
    beforeAll((done) => {
        db.connectMock({ admins: [...adminAccounts] })
            .then(() => done())
            .catch((err) => done(err));
    }, 20000);

    afterAll((done) => {
        db.close()
            .then(() => done())
            .catch((err) => done(err));
    });

    test('Should send a bad response if another admin account exists', (done) => {
        request(server)
            .post('/admin/register')
            .send({ email: 'admin3@test.com', password: 'admin1234' })
            .set('Content-Type', 'application/json')
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body.success).toBe(false);
                return done();
            });
    });

    test('Should send a 200 respone when valid email is provided', (done) => {
        request(server)
            .post('/admin/register')
            .send({ email: 'newadmin@test.com', password: 'admin1234' })
            .set('Content-Type', 'application/json')
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body.success).toBe(true);
                return done();
            });
    });
});

describe('POST/ admin login', () => {
    beforeAll((done) => {
        db.connectMock({ admins: [...adminAccounts] })
            .then(() => done())
            .catch((err) => done(err));
    }, 20000);

    afterAll((done) => {
        db.close()
            .then(() => done())
            .catch((err) => done(err));
    });

    test('should send a 400 if email cannot be found', (done) => {
        request(server)
            .post('/admin/login')
            .send({ email: 'newadmin@test.com', password: 'admin1234' })
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body.success).toBe(false);
                return done();
            });
    });

    test('should send a 400 if email can be found and password is wrong', (done) => {
        request(server)
            .post('/admin/login')
            .send({
                email: adminAccounts[1].email,
                password: adminAccounts[1].password,
            })
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body.success).toBe(false);
                return done();
            });
    });

    test('should send a 400 if email can be found and password is correct but account is not verified', (done) => {
        request(server)
            .post('/admin/login')
            .send({ email: adminAccounts[0].email, password: 'admin1234' })
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body.success).toBe(false);
                return done();
            });
    });

    test('should send a 200 if account is verified and credentials are correct', (done) => {
        request(server)
            .post('/admin/login')
            .send({
                email: 'admin2@test.com',
                password: 'admin1234',
            })
            .expect(200)
            .then((res) => {
                expect(res.body.success).toBe(true);
                done();
            })
            .catch((err) => {
                done(err);
            });
    });
});
