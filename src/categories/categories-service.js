const xss = require('xss');
const Treeize = require('treeize');
const config = require('../config');

const CategoriesService = {
    insertCategory(db, newCategory) {
        return db
            .insert(newCategory)
            .into('geekbox_categories')
            .returning('*')
            .then(([category]) => category)
            .then((category) => CategoriesService.getById(db, category.id));
    },
    getAllCategories(db) {
        return db
            .from('geekbox_categories AS gc')
            .select(
                'gc.id',
                'gc.title',
                'gc.date_created',
                ...userFields
            )
            .leftJoin(
                'geekbox_users AS usr',
                'gc.user_id',
                'usr.id'
            )
            .leftJoin(
                'geekbox_resources AS gres',
                'gc.id',
                'gres.category_id'
            )
            .groupBy('gc.id', 'usr.id')
            .orderBy('gc.date_created', 'desc');
    },
    deleteCategory(db, category_id, user_id) {
        return db('geekbox_categories AS gc')
            .where({
                'gc.id': category_id,
                'gc.user_id': user_id
            })
            .del();
    },
    updateCategory(db, category_id, user_id, newCategoryFields) {
        return db('geekbox_categories AS gc')
            .where({
                'gc.id': category_id,
                'gc.user_id': user_id
            })
            .update(newCategoryFields);
    },
    getById(db, id) {
        return CategoriesService.getAllCategories(db)
            .where('gc.id', id)
            .first();
    },
    getResourcesForCategory(db, category_id) {
        return db
            .from('geekbox_resources AS gres')
            .select(
                'gres.id',
                'gres.title',
                'gres.url',
                'gres.description',
                'gres.date_created',
                ...userFields
            )
            .where('gres.category_id', category_id)
            .leftJoin(
                'geekbox_users AS usr',
                'gres.user_id',
                'usr.id'
            )
            .groupBy('gres.id', 'usr.id');
    },
    serializeCategories(categories) {
        return categories.map(this.serializeCategory);
    },
    serializeCategory(category) {
        const categoryTree = new Treeize();

        const categoryData = categoryTree.grow([category]).getData()[0];

        return {
            id: categoryData.id,
            title: xss(categoryData.title),
            date_created: categoryData.date_created,
            user: categoryData.user || {}
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

module.exports = {CategoriesService};