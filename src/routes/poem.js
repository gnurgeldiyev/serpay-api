import express from 'express'
import * as poemController from '../controllers/poem'

const router = express.Router()

/**
 * GET requests
*/
router.get('/', poemController.getAll)
router.get('/:id', poemController.getOne)

/**
 * POST requests
*/
router.post('/', poemController.add)

/**
 * PUT requests
*/
router.put('/:id', poemController.update)
router.put('/:id/approve', poemController.approve)

/**
 * DELETE requests
*/
router.delete('/:id', poemController.remove)

module.exports = router
