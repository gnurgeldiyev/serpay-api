import db from '../models'
import {
  isLength,
  isEmpty,
  matches,
  isURL
} from 'validator'

const Poet = db.model('Poet')

/**
 * t: type of validation | add, update
 * d: request body data
*/
export async function validateData(t, d) {
  try {
    if (
      (!d.fullname || isEmpty(d.fullname))
      || (d.birth_date && !matches(d.birth_date, /([0-9]|\.)/g))
      || (d.death_date && !matches(d.birth_date, /([0-9]|\.)/g))
      || (d.bio && !isLength(d.bio, { max: 300 }))
      || (d.wiki_link && !isURL(d.wiki_link))
      || (d.avatar && !isLength(d.avatar, { max: 100 }))
    ) {
      return {
        status: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Data validation error'
        }
      }
    }
    // fullname check, fullname field must be unique
    let poet = await Poet.findOne({
      fullname: d.fullname,
      is_deleted: false
    })
    if (t === 'update') {
      if (poet && poet.fullname === d.fullname) {
        return {
          status: true,
          data: {}
        }
      }
    }
    if (!poet) {
      return {
        status: true,
        data: {}
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
  return {
    status: false,
    error: {
      code: 'EXISTING_POET',
      message: 'Poet exists'
    }
  }
}
