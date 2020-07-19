import express from 'express'
import * as editorController from '../controllers/editor'

const router = express.Router()

/**
 * GET requests
*/
router.get('/', editorController.getAll)
router.get('/:id', editorController.getOne)

/**
 * POST requests
*/
router.post('/', editorController.add)
router.post('/login', editorController.login)

/**
 * PUT requests
*/
router.put('/:id', editorController.update)
router.put('/:id/deactivate', editorController.deactivate)
router.put('/:id/reset', editorController.resetPassword)
router.put('/:id/logout', editorController.logout)

/**
 * DELETE requests
*/

export default router
