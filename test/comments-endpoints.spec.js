const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe.only('Comments Endpoints', function() {
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
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy());

    before('cleanup', () => helpers.cleanTables(db));

    afterEach('cleanup', () => helpers.cleanTables(db));

    describe(`POST /api/comments`, () => {
        beforeEach('insert resources', () => {
            helpers.seedResourceTables(
                db,
                testUsers,
                testCategories,
                testResources,
                testComments,
            )
        })

        it.only(`creates a comment, responding with 201 and the new comment`, function() {
            this.retries(3);
            const testResource = testResources[0];
            const testUser = testUsers[0];
            const newComment = {
                comment: 'Test new comment',
                rating: 3,
                resource_id: testResource.id,
            }
console.log('Auth', helpers.makeAuthHeader(testUser));
            return supertest(app)
                .post('/api/comments')
                .set('Authorization', helpers.makeAuthHeader(testUser))
                .send(newComment)
                .expect(201)
                .expect(res => {
                    expect(res.body).to.have.property('id')
                    expect(res.body.comment).to.eql(newComment.rating)
                    expect(res.body.rating).to.eql(newComment.rating)
                    expect(res.body.resource_id).to.eql(newComment.resource_id)
                    expect(res.body.user.id).to.eql(testUser.id)
                    expect(res.headers.location).to.eql(`/api/comments/${res.body.id}`)
                    const expectedDate = new Date().toLocaleString();
                    const actualDate = new Date(res.body.date_created).toLocaleString();
                    expect(actualDate).to.eql(expectedDate);
                })
                .expect(res => 
                    db
                        .from('geekbox_comments')
                        .select('*')
                        .where({ id: res.body.id })
                        .first()
                        .then(row => {
                            expect(row.comment).to.eql(newComment.comment)
                            expect(row.rating).to.eql(newComment.rating)
                            expect(row.resource_id).to.eql(newComment.resource_id)
                            expect(row.user_id).to.eql(testUser.id)
                            const expectedDate = new Date().toLocaleString()
                            const actualDate = new Date(row.date_created).toLocaleString()
                            expect(actualDate).to.eql(expectedDate)
                        })
                )
        })

        const requiredFields = ['comment', 'rating', 'resource_id'];

        requiredFields.forEach(field => {
            const testResource = testResources[0];
            const testUser = testUsers[0];
            const newComment = {
                comment: 'Test new comment',
                rating: 3,
                resource_id: testResource.id,
            }

            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                delete newComment[field];

                return supertest(app)
                    .post('/api/comments')
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .send(newComment)
                    .expect(400, {
                        error: `Missing '${field}' in request body`,
                    })
            })
        })
    })
})