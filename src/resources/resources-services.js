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
                    'count(DISTINCT comm) AS number_of_comments'
                ),
                db.raw(
                    'AVG(comm.rating) AS average_comment_rating'
                )
            )
            .leftJoin(
                
            )
    }
}

const userFields = [
    'usr.id AS user:id',
    'usr.user_name AS user:user_name',
    'usr.first_name AS user:first_name',
    'usr.last_name AS user:last_name',
    'usr.date_created AS user:date_created',
    'usr.date_modified AS user:date_modified'
];

const categoryFields = [
    'gc.id AS category:id',
    'gc.title AS category:title',
    'gc.date_created AS category:date_created',
    'gc.date_modified AS category:date_modified'
];