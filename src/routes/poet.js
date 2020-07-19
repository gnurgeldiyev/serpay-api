import express from 'express'
import multer from 'multer'
import uuid from 'uuid'
import fs from 'fs'
import path from 'path'
import * as poetController from '../controllers/poet'

const router = express.Router()

/**
 * file upload
*/
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, './static')
  },
  filename(req, file, cb) {
    const ext = file.mimetype.split('/')[1]
    cb(null, `${uuid.v4()}.${ext}`)
  }
})
const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(null, false)
  }
}
const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 50
  },
  fileFilter
})

/**
 * GET requests
*/
router.get('/', poetController.getAll)
router.get('/:url', poetController.getOne)

/**
 * POST requestsrouter.post('/', poemController.add)
*/
router.post('/', poetController.add)
router.post('/upload',
  upload.single('file'),
  (req, res) => {
    return res.status(201).json({ file: req.file })
  }
)

/**
 * PUT requests
*/
router.put('/:id', poetController.update)
router.put('/:id/delete', poetController.remove)
router.delete('/upload/:filename', (req, res) => {
  const file = path.join(`${__dirname}./../../static/${req.params.filename}`)
  fs.unlink(file, (err) => {
    if (err) {
      console.log(err)
    }
    return res.sendStatus(204)
  })
})

/**
 * DELETE requests
*/

export default router
