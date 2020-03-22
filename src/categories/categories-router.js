const express = require('express');
const path = require('path');
const {CategoriesService} = require('./categories-service');
const requireAuth = require('../middleware/jwt-auth');

const categoriesRouter = express.Router();
const jsonBodyParser = express.json();

categoriesRouter
    .route('/')
    .get((req, res, next) => {
        CategoriesService.getAllCategories(req.app.get('db'))
            .then((categories) => {
                res.json(CategoriesService.serializeCategories(categories));
            })
            .catch(next);
    })
    .post(requireAuth, jsonBodyParser, (req, res) => {
        const { title } = req.body;

        if (!title) {
            return res.status(400).json({
                error: 'Missing title in request body'
            });
        }
        const newCategory = { title };
        newCategory.user_id = req.user.id;

        return CategoriesService.insertCategory(req.app.get('db'), newCategory)
            .then((category) => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${category.id}`))
                    .json({ category })
            });
    });

categoriesRouter
    .route('/:category_id')
    .all(checkCategoryExists)
    .get((req, res) => {
        res.json(CategoriesService.serializeCategory(res.category));
    })
    .delete(requireAuth, (req, res, next) => {
        CategoriesService.deleteCategory(
            req.app.get('db'),
            req.params.category_id,
            req.user.id
        )
            .then((numAffectedRows) => {
                if (numAffectedRows === 0) {
                    return res.status(400).json({
                        error: {
                            message: 'Not authorized to delete this category'
                        }
                    });
                }
                return res.status(200).json({ message: 'Successfully deleted' });
            })
            .catch(next);
    })
    .patch(requireAuth, jsonBodyParser, (req, res, next) => {
        const { title } = req.body;
        const categoryToUpdate = { title };
        const numberOfValues = Object.values(categoryToUpdate).filter(Boolean).length;
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: 'Request body must contain title'
                }
            });
        }

        if (req.user.id !== res.category['user:id']) {
            return res.status(400).json({
                error: {
                    message: 'Not authorized to edit this category'
                }
            });
        }

        CategoriesService.updateCategory(
            req.app.get('db'),
            req.params.category_id,
            req.user.id,
            categoryToUpdate
        )
            .then((numRowsAffected) => {
                res.json({ message: 'Successfully updated' }).status(200);
            })
            .catch(next);
    });

async function checkCategoryExists(req, res, next) {
    try {
        const category = await CategoriesService.getById(
            req.app.get('db'),
            req.params.category_id
        );

        if (!category) {
            return res.status(404).json({
                error: {
                    message: 'Category doesn\'t exist'
                }
            });
        }

        res.category = category;
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = categoriesRouter;