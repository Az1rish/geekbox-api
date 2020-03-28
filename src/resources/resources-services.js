const xss = require('xss');
const Treeize = require('treeize');
const config = require('../config');

const ResourcesService = {
    insertResource(db, newResource) {
        return db
            .insert(newResource)
            .into('geekbox_resources')
            .returning('*')
            .then(([resource]) => resource)
            .then((resource) => ResourcesService.getById(db, resource.id));
    },
    getAllResources(db) {
        return db
            .from('geekbox_resources AS gres')
            .select(
                'gres.id',
                'gres.title',
                'gres.url',
                'gres.description',
                'gres.date_created',
                ...userFields,
                ...categoryFields,
                db.raw(
                    'count(DISTINCT comm) AS numOfComments'
                ),
                db.raw(
                    'AVG(comm.rating) AS avgCommentRating'
                )
            )
            .leftJoin(
                'geekbox_comments AS comm',
                'gres.id',
                'comm.resource_id'
            )
            .leftJoin(
                'geekbox_categories AS gc',
                'gres.category_id',
                'gc.id'
            )
            .leftJoin(
                'geekbox_users AS usr',
                'gres.user_id',
                'usr.id'
            )
            .groupBy('gres.id', 'gc.id', 'usr.id')
            .orderBy('gres.date_created', 'desc');
    },

    getResourcesByUser(db, user_id) {
        return ResourcesService.getAllResources(db)
            .where('usr.id', user_id);
    },

    getResourcesByCategory(db, category_id) {
        return ResourcesService.getAllResources(db)
            .where('category_id', category_id);
    },

    deleteResource(db, resource_id, user_id) {
        return db('geekbox_resources AS gres')
            .where({
                'gres.id': resource_id,
                'gres.user_id': user_id
            })
            .del();
    },

    updateResource(db, resource_id, user_id, newResourceFields) {
        return db('geekbox_resources AS gres')
            .where({
                'gres.id': resource_id,
                'gres.user_id': user_id
            })
            .update(newResourceFields);
    },

    getById(db, id) {
        return ResourcesService.getAllResources(db)
            .where('gres.id', id)
            .first();
    },

    getCommentsForResource(db, resource_id) {
        return db
            .from('geekbox_comments AS comm')
            .select(
                'comm.id',
                'comm.comment',
                'comm.date_created',
                'comm.rating',
                ...userFields,
                ...resourceFields
            )
            .where('comm.resource_id', resource_id)
            .leftJoin(
                'geekbox_users AS usr',
                'comm.user_id',
                'usr.id'
            )         
            .leftJoin(
                'geekbox_resources AS gres',
                'comm.resource_id',
                'gres.id'
            )
            .groupBy('comm.id', 'usr.id', 'gres.id');
    },

    serializeResources(resources) {
        return resources.map(this.serializeResource);
    },

    serializeResource(resource) {
        const resourceTree = new Treeize();

        const resourceData = resourceTree.grow([resource]).getData()[0];
        return {
            id: resourceData.id,
            title: xss(resourceData.title),
            url: xss(resourceData.url),
            description: xss(resourceData.description),
            date_created: resourceData.date_created,
            user: resourceData.user || {},
            category: resourceData.category || {},
            numOfComments: Number(resourceData.numofcomments) || 0,
            avgCommentRating: Math.round(resourceData.avgcommentrating) || 0
        };
    },

    serializeResourceComments(comments) {
        return comments.map(this.serializeResourceComment);
    },

    serializeResourceComment(comment) {
        const commentTree = new Treeize();
        const commentData = commentTree.grow([comment]).getData()[0];

        return {
            id: commentData.id,
            comment: xss(commentData.comment),
            date_created: commentData.date_created,
            rating: commentData.rating,
            resource: commentData.resource || {},
            user: commentData.user || {}
        };
    }
};

const userFields = [
    'usr.id AS user:id',
    'usr.user_name AS user:user_name',
    'usr.first_name AS user:first_name',
    'usr.last_name AS user:last_name',
    'usr.date_created AS user:date_created',
    'usr.date_modified AS user:date_modified'
];

const resourceFields = [
    'gres.id AS resource:id',
    'gres.title AS resource:title',
    'gres.url AS resource:url',
    'gres.description AS resource:description',
    'gres.date_created AS resource:date_created'
];

const categoryFields = [
    'gc.id AS category:id',
    'gc.title AS category:title',
    'gc.date_created AS category:date_created'
];

module.exports = ResourcesService;