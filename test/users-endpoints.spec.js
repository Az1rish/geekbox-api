const knex = require('knex');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Users Endpoints', () => {
    let db;

    const { testUsers, testCategories, testResources, testComments } = helpers.makeResourceFixtures();
    const testUser = testUsers[0];

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL
        });
        app.set('db', db);
        console.log('knex instance made');
    });

    after('disconnect from db', () => {
        db.destroy()
        console.log('disconnected')
    });

    before('cleanup', () => {
        helpers.cleanTables(db);
        console.log('cleanedup');
    });

    afterEach('cleanup', () => helpers.cleanTables(db));

    describe('POST /api/users', () => {
        context('User Validation', () => {
            beforeEach('insert tables', () => {
                helpers.seedResourceTables(
                db,
                testUsers,
                testCategories, 
                testResources, 
                testComments
            );
            console.log('inserted');
                });

            const requiredFields = ['first_name', 'last_name', 'user_name', 'password'];

            requiredFields.forEach((field) => {
                const registerAttemptBody = {
                    first_name: 'test first name',
                    last_name: 'test last name',
                    user_name: 'test user name',
                    password: 'test password'
                };

                it(`responds with 400 required error when '${field}' is missing`, () => {
                    delete registerAttemptBody[field];

                    return supertest(app)
                        .post('/api/users')
                        .send(registerAttemptBody)
                        .expect(400, {
                            error: `Missing '${field}' in request body`
                        });
                });
            });

            it('responds 400 \'Password must be longer than 8 characters\' when short password', () => {
                const userShortPassword = {
                    first_name: 'test first name',
                    last_name: 'test last name',
                    user_name: 'test user name',
                    password: '1234567'
                };

                return supertest(app)
                    .post('/api/users')
                    .send(userShortPassword)
                    .expect(400, {
                        error: 'Password must be longer than 8 characters'
                    });
            });

            it('responds 400 \'Password must be less than 72 characters\' when long password', () => {
                const userLongPassword = {
                    user_name: 'test user name',
                    password: '*'.repeat(73),
                    first_name: 'test first name',
                    last_name: 'test last name'
                };

                return supertest(app)
                    .post('/api/users')
                    .send(userLongPassword)
                    .expect(400, {
                        error: 'Password must be less than 72 characters'
                    });
            });

            it('responds with 400 error when password starts with spaces', () => {
                const userPasswordStartsSpaces = {
                    user_name: 'test user name',
                    password: ' 1Aa!2Bb@',
                    first_name: 'test first name',
                    last_name: 'test last name'
                };

                return supertest(app)
                    .post('/api/users')
                    .send(userPasswordStartsSpaces)
                    .expect(400, {
                        error: 'Password must not start or end with empty spaces'
                    });
            });

            it('responds 400 error when password ends with spaces', () => {
                const userPasswordEndsSpaces = {
                    user_name: 'test user name',
                    password: '1Aa!2Bb@ ',
                    first_name: 'test first name',
                    last_name: 'test last name'
                };

                return supertest(app)
                    .post('/api/users')
                    .send(userPasswordEndsSpaces)
                    .expect(400, {
                        error: 'Password must not start or end with empty spaces'
                    });
            });

            it('responds 400 error when password isn\'t complex enough', () => {
                const userPasswordNotComplex = {
                    user_name: 'test user name',
                    password: '11AAaabb',
                    first_name: 'test first name',
                    last_name: 'test last name'
                };

                return supertest(app)
                    .post('/api/users')
                    .send(userPasswordNotComplex)
                    .expect(400, {
                        error: 'Password must contain 1 upper case, lower case, number and special character'
                    });
            });

            it('responds 400 \'Username already taken\' when user_name isn\'t unique', () => {
                const duplicateUser = {
                    user_name: testUser.user_name,
                    password: '11AAaa!!',
                    first_name: 'test first name',
                    last_name: 'test last name'
                };

                return supertest(app)
                    .post('/api/users')
                    .send(duplicateUser)
                    .expect(400, {
                        error: 'Username already taken'
                    });
            });
        });

        context('Happy path', () => {
            it('responds 201, serialized user, storing bcrypted password', () => {
                const newUser = {
                    user_name: 'test user name',
                    password: '11AAaa!!',
                    first_name: 'test first name',
                    last_name: 'test last name'
                };

                return supertest(app)
                    .post('/api/users')
                    .send(newUser)
                    .expect(201)
                    .expect((res) => {
                        expect(res.body).to.have.property('id');
                        expect(res.body.user_name).to.eql(newUser.user_name);
                        expect(res.body.first_name).to.eql(newUser.first_name);
                        expect(res.body.last_name).to.eql(newUser.last_name);
                        expect(res.body).to.not.have.property('password');
                        expect(res.headers.location).to.eql(`/api/users/${res.body.id}`);
                        const actualDate = new Date(res.body.date_created).toLocaleString();
                        const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' });
                        expect(actualDate).to.eql(expectedDate);
                    })
                    .expect((res) => db
                        .from('geekbox_users')    
                        .select('*')
                        .where({ id: res.body.id })
                        .first()
                        .then((row) => {
                            expect(row.user_name).to.eql(newUser.user_name);
                            expect(row.first_name).to.eql(newUser.first_name);
                            expect(row.last_name).to.eql(newUser.last_name);
                            const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' });
                            const actualDate = new Date(row.date_created).toLocaleString();
                            expect(actualDate).to.eql(expectedDate);

                            return bcrypt.compare(newUser.password, row.password);
                        })
                        .then((compareMatch) => {
                            expect(compareMatch).to.be.true;
                        }));
            });
        });
    });
});