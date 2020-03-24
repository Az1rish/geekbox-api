const express = require('express');
const path = require('path');
const ResourcesService = require('./resources-services');
const requireAuth = require('../middleware/jwt-auth');
const { isWebUri } = require('valid-url');

const resourcesRouter = express.Router();
const jsonBodyParser = express.json();

resourcesRouter
    .route('/')
    .get((req, res, next) => {
        ResourcesService.getAllResources(req.app.get('db'))
            .then((resources) => {
                res.json(ResourcesService.serializeResources(resources));
            })
            .catch(next);
    })
    .post(requireAuth, jsonBodyParser, (req, res, next) => {
        for (const field of ['title', 'url', 'description', 'category_id', 'user_id']) {
            if (!req.body[field]) {
                return res.status(400).json({
                    error: {
                        message: `Missing '${field}' in request body`
                    }
                })
            }
        }

        const { title, url, description, category_id, user_id } = req.body;

        if (!isWebUri(url)) {
            return res.status(400).json({
                error: {
                    message: `'url' must be a valid URL`
                }
            })
        }

        const newResource = { title, url, description, category_id, user_id };

        ResourcesService.insertResource(
            req.app.get('db'),
            newResource
        )
            .then(resource => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${resource.id}`))
                    .json(ResourcesService.serializeResource(resource))
            })
            .catch(next)
    })

resourcesRouter
    .route('/:resource_id')
    .all((req, res, next) => {
        ResourcesService.getById(
            req.app.get('db'),
            req.params.resource_id
        )
            .then(resource => {
                if (!resource) {
                    return res.status(404).json({
                        error: {
                            message: `Resource doesn't exist`
                        }
                    })
                }
                res.resource = resource;
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(ResourcesService.serializeResource(res.resource))
    })
    .delete(requireAuth, (req, res, next) => {
        ResourcesService.deleteResource(
            req.app.get('db'),
            req.params.resource_id,
            req.user.id
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })
    .patch(requireAuth, jsonBodyParser, (req, res, next) => {
        const { title, url, description } = req.body
        const resourceToUpdate = { title, url, description }

        const numberOfValues = Object.values(resourceToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain either 'title', 'url', or 'description'`
                }
            })
        }

        ResourcesService.updateResource(
            req.app.get('db'),
            req.params.resource_id,
            req.user.id,
            resourceToUpdate
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = resourcesRouter;