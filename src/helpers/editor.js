import jwt from 'jsonwebtoken'
import { isEmail, isLength, isEmpty } from 'validator'
import db from '../models'
import { PASSWORD_SALT, TOKEN_SALT } from '../config'

const Editor = db.model('Editor')

/**
 * t: validation type | add, update
 * d: request body data
*/
export async function validateData(t, d) {
  try {
    if (t === 'add') {
      if (
        (!d.firstname || isEmpty(d.firstname))
        || (!d.lastname || isEmpty(d.lastname))
        || (!d.email || isEmpty(d.email))
        || !isEmail(d.email)
        || (!d.password || isEmpty(d.password))
        || !isLength(d.password, { min: 8 })
        || (!d.role || isEmpty(d.role))
        || !((d.role === 'editor') || (d.role === 'admin'))
      ) {
        return {
          status: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'Data validation error'
          }
        }
      }
      // email check, email field must be unique
      let editor = await Editor.findOne({ email: d.email })
      if (!editor) {
        return {
          status: true,
          data: {}
        }
      }
      return {
        status: false,
        error: {
          code: 'EXISTING_EMAIL',
          message: 'Email exists'
        }
      }
    } else if (t === 'update') {
      if (
        (!d.firstname || isEmpty(d.firstname))
        || (!d.lastname || isEmpty(d.lastname))
        || (!d.email || isEmpty(d.email))
        || !isEmail(d.email)
        || (!d.role || isEmpty(d.role))
        || !((d.role === 'editor') || (d.role === 'admin'))
      ) {
        return {
          status: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'Data validation error'
          }
        }
      }
      // email check, email field must be unique
      let editor = await Editor.findById(d.id)
      if (editor && editor.email === d.email) {
        return {
          status: true,
          data: {}
        }
      }
      editor = await Editor.findOne({ email: d.email })
      if (!editor) {
        return {
          status: true,
          data: {}
        }
      }
      return {
        status: false,
        error: {
          code: 'EXISTING_EMAIL',
          message: 'Email exists'
        }
      }
    } 
    return {
      status: false,
      error: {
        code: 'TYPE_MISSING',
        message: 'Validation type missing'
      }
    }
  } catch (err) {
    return {
      status: false,
      error: {
        code: err.code,
        message: err.message
      }
    }
  }
}

/**
 * d: request body data
*/
export async function validateLoginData(d) {
  if (
    ((!d.email || isEmpty(d.email))
    || !isEmail(d.email)
    || (!d.password || isEmpty(d.password))
    || !isLength(d.password, { min: 8 }))
  ) {
    return {
      status: false,
      error: {
        code: 'BAD_REQUEST',
        message: 'Data validation error'
      }
    }
  }
  return Editor
    .findOne({
      email: d.email,
      is_active: true
    })
    .then((editor) => {
      if (!editor) {
        return {
          status: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'Validation error: Not Found'
          }
        }
      }
      return {
        status: true,
        data: {}
      }
    })
    .catch((err) => {
      return {
        status: false,
        error: {
          code: err.code,
          message: err.message
        }
      }
    })
}

/**
 * p: raw password string | hashes password (HMAC SHA256)
*/
export async function hashPassword(p) {
  try {
    const hashed = jwt.sign({ password: p }, PASSWORD_SALT)
    return {
      status: true,
      data: hashed
    }
  } catch (err) {
    return {
      status: false,
      error: {
        code: err.code,
        message: err.message
      }
    }
  }
}

/**
 * e: editor email
 * p: hashed password | hashes password (HMAC SHA256)
*/
export async function decodePassword(e, p) {
  try {
    const editor = await Editor.findOne({ email: e })
    const decoded = jwt.verify(editor.password, PASSWORD_SALT)
    if (decoded.password === p) {
      return {
        status: true,
        data: {}
      }
    }
    return {
      status: false,
      error: {
        code: 'NOT_AUTHORIZED',
        message: 'Not authorized'
      }
    }
  } catch (err) {
    return {
      status: false,
      error: {
        code: err.code,
        message: err.message
      }
    }
  }
}

/**
 * e: editor email for token generate
 */
export async function generateToken(e) {
  try {
    const rawToken = e.split('@')[0] + '•' + e.split('@')[1]
    const token = jwt.sign({ token: rawToken }, TOKEN_SALT)
    return {
      status: true,
      data: token
    }
  } catch (err) {
    return {
      status: false,
      error: {
        code: err.code,
        message: err.message
      }
    }
  }
}
