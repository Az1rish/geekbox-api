const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Categories Endpoints', () => {
    let db;

    const {
        testUsers,
        testCategories
    } = helpers.makeResourceFixtures();

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL
        });
        app.set('db', db);
    });

    after('disconnect from db', () => db.destroy());

    before('cleanup', () => helpers.cleanTables(db));

    afterEach('cleanup', () => helpers.cleanTables(db));

    describe('GET /api/categories', () => {
        context('Given no categories', () => {
            it('responds with 200 and an empty list', () => supertest(app)
                .get('/api/categories')
                .expect(200, []));
        });

        context('Given there are categories in the database', () => {
            beforeEach('insert categories', () => helpers.seedResourceTables(
                db,
                testUsers,
                testCategories,
            ));

            it('responds with 200 and all of the categories', () => {
                const expectedCategories = testCategories.map((category) => helpers.makeExpectedResource(
                    testUsers,
                    category,
                ));
                return supertest(app)
                    .get('/api/categories')
                    .expect(200, expectedCategories);
            });
        });

        context('Given an XSS attack category', () => {
            const testUser = helpers.makeUsersArray()[1];
            const {
                maliciousCategory,
                expectedCategory
            } = helpers.makeMaliciousCategory(testUser);

            beforeEach('insert malicious category', () => helpers.seedMaliciousCategory(
                db,
                testUser,
                maliciousCategory,
            ));

            it('removes XSS attack description', () => supertest(app)
                .get('/api/categories')
                .expect(200)
                .expect((res) => {
                    expect(res.body[0].title).to.eql(expectedCategory.title);
                }));
        });
    });

    describe('GET /api/categories/:category_id', () => {
        context('Given no categories', () => {
            beforeEach(() => helpers.seedUsers(db, testUsers));
            it('responds with 404', () => {
                const categoryId = 123456;
                return supertest(app)
                    .get(`/api/categories/${categoryId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404, {
                        error: 'Category doesn\'t exist'
                    });
            });
        });

        context('Given there are categories in the database', () => {
            beforeEach('insert categories', () => helpers.seedResourceTables(
                db,
                testUsers,
                testCategories
            ));

            it('responds with 200 and the specified category', () => {
                const categoryId = 2;
                const expectedCategory = helpers.makeExpectedCategory(
                    testUsers,
                    testCategories[categoryId - 1],
                );

                return supertest(app)
                    .get(`/api/categories/${categoryId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, expectedCategory);
            });
        });

        context('Given an XSS attack category', () => {
            const testUser = helpers.makeUsersArray()[1];
            const {
                maliciousCategory,
                expectedCategory
            } = helpers.makeMaliciousCategory(testUser);

            beforeEach('insert malicious category', () => helpers.seedMaliciousCategory(
                db,
                testUser,
                maliciousCategory,
            ));

            it('removes XSS attack title', () => supertest(app)
                .get(`/api/categories/${maliciousCategory.id}`)
                .set('Authorization', helpers.makeAuthHeader(testUser))
                .expect(200)
                .expect((res) => {
                    expect(res.body.title).to.eql(expectedCategory.title);
                }));
        });
    });

    describe('POST /categories', () => {
        it('creates category, responding with 201 and the new category', () => {
            this.retries(3);
            const testUser = helpers.makeUsersArray()[0];
            const newCategory = {
                title: 'Test Category'
            };
            return supertest(app)
                .post('/api/categories')
                .set('Authorization', helpers.makeAuthHeader(testUser))
                .send(newCategory)
                .expect(201)
                .expect((res) => {
                    expect(res.body.title).to.eql(newCategory.title);
                    expect(res.body).to.have.property('id');
                    expect(res.headers.location).to.eql(`/categories/${res.body.id}`);
                    const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' });
                    const actualDate = new Date(res.body.date_created).toLocaleString();
                    expect(actualDate).to.eql(expectedDate);
                })
                .then((postRes) => supertest(app)
                    .get(`/api/categories/${postRes.body.id}`)
                    .expect(postRes.body));
        });
    });

    describe('DELETE /categories/:category_id', () => {
        context('Given no categories', () => {
            it('responds with 404', () => {
                const categoryId = 123456;
                return supertest(app)
                    .delete(`/categories/${categoryId}`)
                    .expect(404, {
                        error: {
                            message: 'Photo doesn\'t exist'
                        }
                    });
            });
        });

        context('Given there are categories in the database', () => {
            const testUsers = helpers.makeUsersArray();
            const testCategories = helpers.makeCategoriesArray(testUsers);

            beforeEach('insert categories', () => db
                .into('geekbox_categories')
                .insert(testCategories));

            it('responds with 200 and removes category', () => {
                const idToRemove = 2;
                const expectedCategories = testCategories.filter((category) => category.id !== idToRemove);

                return supertest(app)
                    .delete(`/api/categories/${idToRemove}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[1]))
                    .expect(200)
                    .then((res) => supertest(app)
                        .get('/api/categories')
                        .expect(expectedCategories));
            });
        });
    });

    describe('PATCH /api/categories/:category_id', () => {
        context('Given no categories', () => {
            it('responds with 404', () => {
                const testUsers = helpers.makeUsersArray();
                const categoryId = 123456;

                beforeEach('insert users', () => db
                    .into('geekbox_users')
                    .insert(testUsers));

                return supertest(app)
                    .patch(`/api/categories/${categoryId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[1]))
                    .expect(404, {
                        error: {
                            message: 'Category doesn\'t exist'
                        }
                    });
            });
        });

        context('Given there are categories in the database', () => {
            const testCategories = helpers.makeCategoriesArray(testUsers);

            beforeEach('insert categories', () => db
                .into('geekbox_users')
                .insert(testCategories));

            it('responds with 204 and updates the category', () => {
                const idToUpdate = 2;
                const updateCategory = {
                    title: 'updated category title'
                };
                const expectedCategory = {
                    ...testCategories[idToUpdate - 1],
                    ...updateCategory
                };
                return supertest(app)
                    .patch(`/api/categories/${idToUpdate}`)
                    .send(updateCategory)
                    .expect(204)
                    .then((res) => supertest(app)
                        .get(`/api/categories/${idToUpdate}`)
                        .expect(expectedCategory));
            });

            it('responds with 400 when no required fields supplied', () => {
                const idToUpdate = 2;
                return supertest(app)
                    .patch(`/api/categories/${idToUpdate}`)
                    .send({ irrelevantField: 'foo' })
                    .expect(400, {
                        error: {
                            message: 'Request body must contain \'title\''
                        }
                    });
            });
        });
    });
});