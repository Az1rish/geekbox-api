const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function makeUsersArray() {
    return [
        {
            id: 1,
            first_name: 'test-user-1',
            last_name: 'test-user-1-last',
            user_name: 'Test User 1',
            password: 'password',
            date_created: '2029-01-22T16:28:32.615Z'
        },
        {
            id: 2,
            first_name: 'test-user-2',
            last_name: 'test-user-2-last',
            user_name: 'Test User 2',
            password: 'password',
            date_created: '2029-01-22T16:28:32.615Z'
        },
        {
            id: 3,
            first_name: 'test-user-3',
            last_name: 'test-user-3-last',
            user_name: 'Test User 3',
            password: 'password',
            date_created: '2029-01-22T16:28:32.615Z'
        },
        {
            id: 4,
            first_name: 'test-user-4',
            last_name: 'test-user-4-last',
            user_name: 'Test User 4',
            password: 'password',
            date_created: '2029-01-22T16:28:32.615Z'
        }
    ];
}

function makeCategoriesArray(users) {
    return [
        {
            id: 1,
            title: 'First test category',
            date_created: '2029-01-22T16:28:32.615Z',
            user_id: users[0].id
        },
        {
            id: 2,
            title: 'Second test category',
            date_created: '2029-01-22T16:28:32.615Z',
            user_id: users[1].id
        },
        {
            id: 3,
            title: 'Third test category',
            date_created: '2029-01-22T16:28:32.615Z',
            user_id: users[2].id
        },
        {
            id: 4,
            title: 'Fourth test category',
            date_created: '2029-01-22T16:28:32.615Z',
            user_id: users[3].id
        }
    ];
}

function makeResourcesArray(users, categories) {
    return [
        {
            id: 1,
            title: 'Resource 1',
            url: 'http://www.google.com',
            description: 'Test resource description 1',
            date_created: '2029-01-22T16:28:32.615Z',
            category_id: categories[0].id,
            user_id: users[0].id
        },
        {
            id: 2,
            title: 'Resource 2',
            url: 'http://www.google.com',
            description: 'Test resource description 2',
            date_created: '2029-01-22T16:28:32.615Z',
            category_id: categories[1].id,
            user_id: users[1].id
        },
        {
            id: 3,
            title: 'Resource 3',
            url: 'http://www.google.com',
            description: 'Test resource description 3',
            date_created: '2029-01-22T16:28:32.615Z',
            category_id: categories[2].id,
            user_id: users[2].id
        },
        {
            id: 4,
            title: 'Resource 4',
            url: 'http://www.google.com',
            description: 'Test resource description 4',
            date_created: '2029-01-22T16:28:32.615Z',
            category_id: categories[3].id,
            user_id: users[3].id
        }
    ];
}

function makeCommentsArray(users, resources) {
    return [
        {
            id: 1,
            comment: 'Test comment 1',
            date_created: '2029-01-22T16:28:32.615Z',
            rating: 1,
            resource_id: resources[0].id,
            user_id: users[0].id
        },
        {
            id: 2,
            comment: 'Test comment 2',
            date_created: '2029-01-22T16:28:32.615Z',
            rating: 2,
            resource_id: resources[0].id,
            user_id: users[1].id
        },
        {
            id: 3,
            comment: 'Test comment 3',
            date_created: '2029-01-22T16:28:32.615Z',
            rating: 3,
            resource_id: resources[0].id,
            user_id: users[2].id
        },
        {
            id: 4,
            comment: 'Test comment 4',
            date_created: '2029-01-22T16:28:32.615Z',
            rating: 4,
            resource_id: resources[0].id,
            user_id: users[3].id
        },
        {
            id: 5,
            comment: 'Test comment 5',
            date_created: '2029-01-22T16:28:32.615Z',
            rating: 5,
            resource_id: resources[resources.length - 1].id,
            user_id: users[0].id
        },
        {
            id: 6,
            comment: 'Test comment 6',
            date_created: '2029-01-22T16:28:32.615Z',
            rating: 1,
            resource_id: resources[resources.length - 1].id,
            user_id: users[2].id
        },
        {
            id: 7,
            comment: 'Test comment 7',
            date_created: '2029-01-22T16:28:32.615Z',
            rating: 4,
            resource_id: resources[3].id,
            user_id: users[0].id
        }
    ];
}

function calculateAverageCommentRating(comments) {
    if (!comments.length) return 0;

    const sum = comments.map((comment) => comment.rating).reduce((a, b) => a + b);

    return Math.round(sum / comments.length);
}

function makeExpectedCategory(users, category) {
    const user = users.find((user) => user.id === (category.user_id || category[user:id]);

    return {
        id: category.id,
        title: category.title,
        date_created: category.date_created,
        user: {
            id: user.id,
            user_name: user.user_name,
            first_name: user.first_name,
            last_name: user.last_name,
            date_created: user.date_created
        }
    };
}

function makeExpectedResource(users, resource, comments = []) {
    const user = users.find((user) => user.id === resource.user_id);

    const resourceComments = comments.filter((comment) => comment.resource_id === resource.id);

    const numOfComments = resourceComments.length;
    const avgCommentRating = calculateAverageCommentRating(resourceComments);

    return {
        id: resource.id,
        title: resource.title,
        url: resource.url,
        description: resource.description,
        date_created: resource.date_created,
        numOfComments,
        avgCommentRating,
        user: {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            user_name: user.user_name,
            date_created: user.date_created
        }
    };
}

function makeExpectedResourceComments(users, resourceId, comments) {
    const expectedComments = comments.filter((comment) => comment.resource_id === resourceId);

    return expectedComments.map((comment) => {
        const commentUser = users.find((user) => user.id === comment.user_id);
        return {
            id: comment.id,
            comment: comment.comment,
            date_created: comment.date_created,
            rating: comment.rating,
            user: {
                id: commentUser.id,
                first_name: commentUser.first_name,
                last_name: commentUser.last_name,
                user_name: commentUser.user_name,
                date_created: commentUser.date_created
            }
        };
    });
}

function makeMaliciousResource(user) {
    const maliciousResource = {
        id: 911,
        title: 'Naughty naughty very naughty <script>alert("xss");</script>',
        url: 'http://placehold.it/500x500',
        description: 'Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.',
        date_created: new Date().toISOString(),
        user_id: user.id
    };
    const expectedResource = {
        ...makeExpectedResource([user], maliciousResource),
        title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
        description: 'Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.'
    };
    return {
        maliciousResource,
        expectedResource
    };
}

function makeMaliciousCategory(user) {
    const maliciousCategory = {
        id: 911,
        title: 'Naughty naughty very naughty <script>alert("xss");</script>Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.',
        date_created: new Date().toISOString(),
        user_id: user.id
    };
    const expectedCategory = {
        ...makeExpectedCategory([user], maliciousCategory),
        title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.'
    };
    return {
        maliciousCategory,
        expectedCategory
    };
}

function makeResourceFixtures() {
    const testUsers = makeUsersArray();
    const testCategories = makeCategoriesArray(testUsers);
    const testResources = makeResourcesArray(testUsers, testCategories);
    const testComments = makeCommentsArray(testUsers, testResources);
    return { testUsers, testCategories, testResources, testComments};
}

function cleanTables(db) {
    return db.raw(
        `TRUNCATE
            geekbox_users,
            geekbox_categories,
            geekbox_resources,
            geekbox_comments
            RESTART IDENTITY CASCADE`
    );
}

function seedUsers(db, users) {
    const preppedUsers = users.map((user) => ({
        ...user,
        password: bcrypt.hashSync(user.password, 1)
    }));
    return db.into('geekbox_users').insert(preppedUsers).then(() =>
    // update auto sequence to stay in sync
        db.raw(
            'SELECT setval(\'geekbox_users_id_seq\', ?)',
            [users[users.length - 1].id],
        ));
}

function seedResourceTables(db, users, categories, resources, comments = []) {
    return db.transaction(async (trx) => {
        await seedUsers(trx, users);
        await trx.into('geekbox_categories').insert(categories);
        await trx.raw('SELECT setval(\'geekbox_categories_id_seq\', ?)', [categories[categories.length - 1].id],
        );
        await trx.into('geekbox_resources').insert(resources);
        await trx.raw('SELECT setval(\'geekbox_resources_id_seq\', ?)', [resources[resources.length - 1].id],
        );
        if (comments.length) {
            await trx.into('geekbox_comments').insert(comments);
            await trx.raw('SELECT setval(\'geekbox_comments_id_seq\', ?)', [comments[comments.length - 1].id],
            );
        }
    });
}

function seedMaliciousResource(db, user, resource) {
    return seedUsers(db, [user])
        .then(() => db
            .into('geekbox_resources')
            .insert([resource]));
}

function seedMaliciousCategory(db, user, category) {
    return seedUsers(db, [user])
        .then(() => db
            .into('geekbox_categories')
            .insert([category]));
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {  
    const token = jwt.sign({ user_id: user.id },
        secret, {
            subject: user.user_name,
            algorithm: 'HS256'
        });

    return `Bearer ${token}`;
}

module.exports = {
    makeUsersArray,
    makeCategoriesArray,
    makeResourcesArray,
    makeCommentsArray,
    makeExpectedCategory,
    makeExpectedResource,
    makeExpectedResourceComments,
    makeResourceFixtures,

    seedMaliciousCategory,
    makeMaliciousCategory,
    makeMaliciousResource,
    makeAuthHeader,
    cleanTables,
    seedMaliciousResource,
    seedResourceTables,
    seedUsers,
    calculateAverageCommentRating
};