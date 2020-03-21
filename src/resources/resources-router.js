const express = require('express');
const path = require('path');
const ResourcesService = require('./resources-services');
const { requireAuth } = require('../middleware/jwt-auth');
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
    .post(requireAuth, jsonBodyParser, (req, res) => {
        for (const field of ['title', 'url', 'description']) {
            if (!req.body[field]) {
                return res.status(400).json({
                    error: {
                        message: `Missing '${field}' in request body`
                    }
                })
            }
        }

        const { title, url, description } = req.body;

        if (!isWebUri(url)) {
            return res.status(400).json({
                error: {
                    message: `'url' must be a valid URL`
                }
            })
        }

        const newResource = { title, url, description };

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

