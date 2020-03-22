const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Resources Endpoints', () => {
    let db;

    const {
        testUsers,
        testCategories,
        testResources,
        testComments
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

    describe('GET /api/resources', () => {
        context('Given no resources', () => {
            it('responds with 200 and an empty list', () => supertest(app)
                .get('/api/resources')
                .expect(200, []));
        });

        context('Given there are resources in the database', () => {
            beforeEach('insert resources', () => helpers.seedResourceTables(
                db,
                testUsers,
                testCategories,
                testResources,
                testComments,
            ));

            it('responds with 200 and all of the resources', () => {
                const expectedresources = testresources.map((resource) => helpers.makeExpectedResource(
                    testUsers,
                    resource
                ));
                return supertest(app)
                    .get('/api/resources')
                    .expect(200, expectedresources);
            });
        });

        context('Given an XSS attack resource', () => {
            const testUser = helpers.makeUsersArray()[1];
            const {
                maliciousResource,
                expectedResource
            } = helpers.makeMaliciousResource(testUser);

            beforeEach('insert malicious resource', () => helpers.seedMaliciousResource(
                db,
                testUser,
                maliciousResource,
            ));

            it('removes XSS attack description', () => supertest(app)
                .get('/api/resources')
                .expect(200)
                .expect((res) => {
                    expect(res.body[0].title).to.eql(expectedResource.title);
                }));
        });
    });

    describe('GET /api/resources/:resource_id', () => {
        context('Given no resources', () => {
            beforeEach(() => helpers.seedUsers(db, testUsers));
            it('responds with 404', () => {
                const resourceId = 123456;
                return supertest(app)
                    .get(`/api/resources/${resourceId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404, {
                        error: {
                            message: 'Resource doesn\'t exist'
                        }
                    });
            });
        });

        context('Given there are resources in the database', () => {
            beforeEach('insert resources', () => helpers.seedResourceTables(
                db,
                testUsers,
                testCategories,
                testResources,
                testComments
            ));

            it('responds with 200 and the specified resource', () => {
                const resourceId = 2;
                const expectedResource = helpers.makeExpectedResource(
                    testUsers,
                    testCategories,
                    testResources[resourceId - 1],
                    testComments
                );

                return supertest(app)
                    .get(`/api/resources/${resourceId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, expectedResource);
            });
        });

        context('Given an XSS attack resource', () => {
            const testUser = helpers.makeUsersArray()[1];
            const {
                maliciousResource,
                expectedResource
            } = helpers.makeMaliciousResource(testUser);

            beforeEach('insert malicious resource', () => helpers.seedMaliciousResource(
                db,
                testUser,
                maliciousResource,
            ));

            it('removes XSS attack title', () => supertest(app)
                .get(`/api/resources/${maliciousResource.id}`)
                .set('Authorization', helpers.makeAuthHeader(testUser))
                .expect(200)
                .expect((res) => {
                    expect(res.body.title).to.eql(expectedResource.title);
                }));
        });
    });

    describe('POST /resources', () => {
        it('creates resource, responding with 201 and the new resource', function() {
            this.retries(3);
            const testUser = helpers.makeUsersArray()[0];
            const newResource = {
                title: 'Test resource'
            };
            return supertest(app)
                .post('/api/resources')
                .set('Authorization', helpers.makeAuthHeader(testUser))
                .send(newResource)
                .expect(201)
                .expect((res) => {
                    expect(res.body.title).to.eql(newResource.title);
                    expect(res.body).to.have.property('id');
                    expect(res.headers.location).to.eql(`/resources/${res.body.id}`);
                    const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' });
                    const actualDate = new Date(res.body.date_created).toLocaleString();
                    expect(actualDate).to.eql(expectedDate);
                })
                .then((postRes) => supertest(app)
                    .get(`/api/resources/${postRes.body.id}`)
                    .expect(postRes.body));
        });
    });

    describe('DELETE /resources/:resource_id', () => {
        context('Given no resources', () => {
            it('responds with 404', () => {
                const resourceId = 123456;
                return supertest(app)
                    .delete(`/api/resources/${resourceId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[1]))
                    .expect(404, {
                        error: {
                            message: 'resource doesn\'t exist'
                        }
                    });
            });
        });

        context('Given there are resources in the database', () => {
            beforeEach('insert resources', () => helpers.seedResourceTables(
                db,
                testUsers,
                testCategories,
                testResources,
                testComments,
            ));

            it('responds with 200 and removes resource', () => {
                const idToRemove = 2;
                let expectedResources = testResources.filter((resource) => resource.id !== idToRemove);
                expectedResources = expectedResources.map(resource => helpers.makeExpectedResource(testUsers, resource));

                return supertest(app)
                    .delete(`/api/resources/${idToRemove}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[1]))
                    .expect(200)
                    .then((res) => supertest(app)
                        .get('/api/resources')
                        .expect(expectedResources));
            });
        });
    });

    describe('PATCH /api/resources/:resource_id', () => {
        context('Given no resources', () => {
            it('responds with 404', () => {
                beforeEach('insert resources', () => helpers.seedResourceTables(
                    db,
                    testUsers,
                    testCategories,
                    testResources,
                    testComments,
                ));

                const resourceId = 123456;

                return supertest(app)
                    .patch(`/api/resources/${resourceId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[1]))
                    .expect(404, {
                        error: {
                            message: 'Resource doesn\'t exist'
                    }
                });
            });
        });

        context('Given there are resources in the database', () => {
            beforeEach('insert resources', () => helpers.seedResourceTables(
                db,
                testUsers,
                testCategories,
                testResources,
                testComments,
            ));

            it('responds with 200 and updates the resource', () => {
                const idToUpdate = 2;
                const updateResource = {
                    title: 'updated resource title'
                };
                let expectedResource = {
                    ...testResources[idToUpdate - 1],
                    ...updateResource
                };
                expectedResource = helpers.makeExpectedResource(testUsers, expectedResource);

                return supertest(app)
                    .patch(`/api/resources/${idToUpdate}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[1]))
                    .send(updateResource)
                    .expect(200)
                    .then((res) => supertest(app)
                        .get(`/api/resources/${idToUpdate}`)
                        .expect(expectedResource));
            });

            it('responds with 400 when no required fields supplied', () => {
                const idToUpdate = 2;
                return supertest(app)
                    .patch(`/api/resources/${idToUpdate}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[1]))
                    .send({ irrelevantField: 'foo' })
                    .expect(400, {
                        error: {
                            message: 'Request body must contain title'
                        }
                    });
            });
        });
    });
});