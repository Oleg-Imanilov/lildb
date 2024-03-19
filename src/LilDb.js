import { deepUpdate, deepValue } from './utils.js'
import fs from 'fs';
import _query from './query.js'
import PrivateLilDb from './PrivateLilDb.js';


class LilDb extends PrivateLilDb {

  constructor() {
    super()
  }

  /**
   * 
   * @param {*} fileName - file name to save the db
   * @param {*} options autoSave: seconds, log: function ; defaults {autoSave = false, log = null}
   * @returns new instance of LilDb
   */
  static connect(fileName, { autoSave = false, log = null } = {}) {
    const db = new LilDb()
    db._connect(fileName, { autoSave, log })
    return db
  }


  /**
   * set callback function for logging
   * @param {*} logFunction 
   */
  setLog(logFunction) {
    this.log = logFunction
  }

  /**
   * @returns save the db to the file
   */
  save() {
    if (!this.fileName) throw new Error('No file name')
    if(this.needToSave) {
        this.saveAs(this.fileName)
    }
  }

  /**
   * @param {*} fileName 
   * @param {*} options overwrite: boolean ; defaults {overwrite = true}
   */
  saveAs(fileName, { overwrite = true } = {}) {
    if (fs.existsSync(fileName) && !overwrite) {
      throw new Error('File exists')
    }
    this.fileName = fileName
    fs.writeFileSync(this.fileName, this.DB.map(r => JSON.stringify(r)).join('\n'), 'utf8')
    this.lastSaved = Date.now()
    this.needToSave = false
  }

  /**
   * @param {*} data - single doc or array of docs
   * @returns 
   */
  insert(data) {
    if (Array.isArray(data)) {
      return data.map(r => this._insertDoc(r, false))
    } else if (typeof data === 'object') {
      const res = this._insertDoc(data)
      return [res]
    } else {
      throw new Error('Invalid data type')
    }
  }

  upsert(data) {
    if (Array.isArray(data)) {
      return data.map(r => this._insertDoc(r, true))
    } else if (typeof data === 'object') {
      const res = this._insertDoc(data, true)
      return [res]
    } else {
      throw new Error('Invalid data type')
    }
  }

  query(query, { projection = false } = {}) {
    const arr = Object.values(this.DB).map(doc => _query(query, doc)).filter(r => !!r)
    if (projection) {
      return arr.map(r => {
        const d = {}
        Object.keys(projection).forEach(k => {
          d[projection[k]] = deepValue(k,r)
        })
        return d
      })
    } else {
      return arr.map(structuredClone)
    }
  }

  remove(query) {
    const toRemove = this.query(query)
    const toRemoveIds = toRemove.map(r => r._id)
    this.DB = this.DB.filter(r => !toRemoveIds.includes(r._id))
    if(toRemove.length > 0) {
        this.needToSave = true
    }
    return toRemove.map(structuredClone)
  }

  update(query, update) {
    const toUpdate = this.query(query)
    toUpdate.forEach(r => {
      deepUpdate(update, r)
    })
    if(toUpdate.length > 0) {
        this.needToSave = true
    }
    return toUpdate.map(doc => this._insertDoc(doc, true))
  }

  count() {
    return this.DB.length
  }

}

export default LilDb


