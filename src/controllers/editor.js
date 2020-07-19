import db from '../models'
import { isMongoId } from 'validator'
import {
  validateData,
  validateLoginData,
  hashPassword,
  decodePassword,
  generateToken
} from '../helpers/editor'

const Editor = db.model('Editor')

/**
 * GET | get all active editors
*/
export async function getAll(req, res) {
  const deactivated = req.query.d
  // db fetch parameter
  const is_active = deactivated === 'true' ? false : true
  let editors = []
  try {
    editors = await Editor.find({ is_active }).sort({ role: 1, created_at: 1 })
  } catch (err) {
    return res.status(500).json({
      data: {},
      meta: {
        code: 500,
        error: { code: err.code, message: err.message }
      }
    })
  }
  // return the result
  if (editors.length === 0) {
    return res.status(404).json({
      data: {},
      meta: {
        code: 404,
        error: { code: 'NOT_FOUND', message: 'There is no any editor' }
      }
    })
  }
  return res.status(200).json({
    data: editors.map((e) => e.toPublic()),
    meta: {
      code: 200,
      error: {}
    }
  })
}

/**
 * GET | get one by id
*/
export async function getOne(req, res) {
  const id = req.params.id
  // ObjectID validation
  if (!isMongoId(id)) {
    return res.status(400).json({
      data: {},
      meta: {
        code: 400,
        error: { code: 'BAD_REQUEST', message: 'ID validation error' }
      }
    })
  }
  let editor = {}
  try {
    editor = await Editor.findOne({ _id: id, is_active: true })
  } catch (err) {
    return res.status(500).json({
      data: {},
      meta: {
        code: 500,
        error: { code: err.code, message: err.message }
      }
    })
  }
  // return the result
  if (!editor) {
    return res.status(404).json({
      data: {},
      meta: {
        code: 404,
        error: { code: 'NOT_FOUND', message: 'There is no any editor' }
      }
    })
  }
  return res.status(200).json({
    data: editor.toPublic(),
    meta: {
      code: 200,
      error: {}
    }
  })
}

/**
 * POST | Add new editor
*/
export async function add(req, res) {
  let result = null
  let editor = {}
  const data = req.body
  try {
    // request body data validation
    result = await validateData('add', data)
    if (!result.status) {
      return res.status(400).json({
        data: {},
        meta: { code: 400, error: result.error }
      })
    }
    // hash user password
    result = hashPassword(data.password)
    if (!result.status) {
      return res.status(400).json({
        data: {},
        meta: { code: 400, error: result.error }
      })
    }
    // set returned hash password
    const hashedPassword = result.data

    // add new editor
    editor = await Editor.create({
      email: data.email,
      firstname: data.firstname,
      lastname: data.lastname,
      role: data.role,
      password: hashedPassword
    })
  } catch (err) {
    return res.status(500).json({
      data: {},
      meta: {
        code: 500,
        error: { code: err.code, message: err.message }
      }
    })
  }
  // return created editor
  return res.status(201).json({
    data: editor.toPublic(),
    meta: { code: 201, error: {} }
  })
}

/**
 * POST | login editor
*/
export async function login(req, res) {
  let result = null
  let editor = {}
  const d = req.body
  try {
    // request body data validation
    result = await validateLoginData(d)
    if (!result.status) {
      return res.status(400).json({
        data: {},
        meta: { code: 400, error: result.error }
      })
    }
    // hash user password
    result = await decodePassword(d.email, d.password)
    if (!result.status) {
      return res.status(400).json({
        data: {},
        meta: { code: 400, error: result.error }
      })
    }
    // generate token
    result = generateToken(d.email)
    if (!result.status) {
      return res.status(400).json({
        data: {},
        meta: { code: 400, error: result.error }
      })
    }
    // set generated token
    const token = result.data
    // update the editor token
    editor = await Editor.findOneAndUpdate({
      email: d.email,
      is_active: true
    }, {
      $set: {
        token
      }
    }, { new: true })
  } catch (err) {
    return res.status(500).json({
      data: {},
      meta: {
        code: 500,
        error: { code: err.code, message: err.message }
      }
    })
  }
  // return response
  if (!editor) {
    return res.status(401).json({
      data: {},
      meta: {
        code: 401,
        error: { code: 'NOT_AUTHORIZED', message: 'Not authorized' }
      }
    })
  }
  return res.status(200).json({
    data: editor.toPublic(),
    meta: { code: 200, error: {} }
  })
}

/**
 * PUT | update editor by id
*/
export async function update(req, res) {
  const id = req.params.id
  let d = req.body
  let result = null
  let editor = {}
  // ObjectID validation
  if (!isMongoId(id)) {
    return res.status(400).json({
      data: {},
      meta: {
        code: 400,
        error: { code: 'BAD_REQUEST', message: 'ID validation error' }
      }
    })
  }
  try {
    // set id for the validation
    result = await validateData('update', {...d, id})
    if (!result.status) {
      return res.status(400).json({
        data: {},
        meta: { code: 400, error: result.error }
      })
    }
    // update the editor
    editor = await Editor.findOneAndUpdate({ _id: id, is_active: true }, {
      $set: {
        firstname: d.firstname,
        lastname: d.lastname,
        email: d.email,
        role: d.role
      }
    }, { new: true })
  } catch (err) {
    return res.status(500).json({
      data: {},
      meta: {
        code: 500,
        error: { code: err.code, message: err.message }
      }
    })
  }
  // return the result
  if (!editor) {
    return res.status(404).json({
      data: {},
      meta: {
        code: 404,
        error: { code: 'NOT_FOUND', message: 'Editor not found' }
      }
    })
  }
  return res.status(200).json({
    data: editor.toPublic(),
    meta: { code: 200, error: {} }
  })
}

/**
 * PUT | deactivate editor by id
*/
export async function deactivate(req, res) {
  const id = req.params.id
  const deactivated = req.query.d
  const is_active = deactivated === 'true' ? false : true
  let editor = {}
  // ObjectID validation
  if (!isMongoId(id)) {
    return res.status(400).json({
      data: {},
      meta: {
        code: 400,
        error: { code: 'BAD_REQUEST', message: 'ID validation error' }
      }
    })
  }
  try {
    editor = await Editor.findByIdAndUpdate(id, {
      $set: { is_active }
    }, { new: true })
  } catch (err) {
    return res.status(500).json({
      data: {},
      meta: {
        code: 500,
        error: { code: err.code, message: err.message }
      }
    })
  }
  // return the result
  if (!editor) {
    return res.status(404).json({
      data: {},
      meta: {
        code: 404,
        error: { code: 'NOT_FOUND', message: 'Editor not found' }
      }
    })
  }
  return res.status(200).json({
    data: editor.toPublic(),
    meta: { code: 200, error: {} }
  })
}

/**
 * PUT | reset editor password by id
*/
export async function resetPassword(req, res) {
  const id = req.params.id
  const data = req.body
  let result = null
  let editor = {}
  // password validation
  if (!data.password || data.password.length < 8) {
    return res.status(400).json({
      data: {},
      meta: {
        code: 400,
        error: { code: 'BAD_REQUEST', message: 'Data validation error' }
      }
    })
  }
  // ObjectID validation
  if (!isMongoId(id)) {
    return res.status(400).json({
      data: {},
      meta: {
        code: 400,
        error: { code: 'BAD_REQUEST', message: 'ID validation error' }
      }
    })
  }
  // hash user password
  result = hashPassword(data.password)
  if (!result.status) {
    return res.status(400).json({
      data: {},
      meta: { code: 400, error: result.error }
    })
  }
  // set returned hash password
  const hashedPassword = result.data
  try {
    editor = await Editor.findOneAndUpdate({ _id: id, is_active: true }, {
      $set: {
        password: hashedPassword
      }
    }, { new: true })
  } catch (err) {
    return res.status(500).json({
      data: {},
      meta: {
        code: 500,
        error: { code: err.code, message: err.message }
      }
    })
  }
  // return the result
  if (!editor) {
    return res.status(404).json({
      data: {},
      meta: {
        code: 404,
        error: { code: 'NOT_FOUND', message: 'Editor not found' }
      }
    })
  }
  return res.status(200).json({
    data: editor.toPublic(),
    meta: { code: 200, error: {} }
  })
}

/**
 * PUT | logout editor by id
*/
export async function logout(req, res) {
  const id = req.params.id
  let editor = {}
  // ObjectID validation
  if (!isMongoId(id)) {
    return res.status(400).json({
      data: {},
      meta: {
        code: 400,
        error: { code: 'BAD_REQUEST', message: 'ID validation error' }
      }
    })
  }
  try {
    editor = await Editor.findOneAndUpdate({ _id: id, is_active: true }, {
      $set: {
        token: null
      }
    }, { new: true })
  } catch (err) {
    return res.status(500).json({
      data: {},
      meta: {
        code: 500,
        error: { code: err.code, message: err.message }
      }
    })
  }
  // return the result
  if (!editor) {
    return res.status(404).json({
      data: {},
      meta: {
        code: 404,
        error: { code: 'NOT_FOUND', message: 'Editor not found' }
      }
    })
  }
  return res.status(200).json({
    data: {},
    meta: { code: 200, error: {} }
  })
}
