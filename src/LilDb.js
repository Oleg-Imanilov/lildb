import { deepUpdate, deepValue, project, deepCompareFunc } from './utils.js'
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
    if (this.needToSave) {
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

  query(query, { group = false, projection = false, sortAsc = false, sortDesc = false } = {}) {
    let arr = Object.values(this.DB).map(doc => _query(query, doc)).filter(r => !!r)
    if (sortAsc) {
      arr = arr.sort((a, b) => {
        const va = deepValue(sortAsc, a)
        const vb = deepValue(sortAsc, b)
        if (va < vb) {
          return -1;
        }
        if (va > vb) {
          return 1;
        }
        return 0;
      })
    } else if (sortDesc) {
      arr = arr.sort((a, b) => {
        const va = deepValue(sortDesc, a)
        const vb = deepValue(sortDesc, b)
        if (va < vb) {
          return 1;
        }
        if (va > vb) {
          return -1;
        }
        return 0;
      })
    }
    if (group) {
      const grouped = {}
      arr.forEach(r => {
        const groupVal = deepValue(group, r)
        grouped[groupVal] = grouped[groupVal] || []
        grouped[groupVal].push(projection ? project(r, projection) : structuredClone(r))
      })
      return grouped
    } else {
      return arr.map(r => projection ? project(r, projection) : structuredClone(r))
    }
  }

  remove(query) {
    const toRemove = this.query(query)
    const toRemoveIds = toRemove.map(r => r._id)
    this.DB = this.DB.filter(r => !toRemoveIds.includes(r._id))
    if (toRemove.length > 0) {
      this.needToSave = true
    }
    return toRemove.map(d => structuredClone(d))
  }

  update(query, update) {
    const toUpdate = this.query(query)
    toUpdate.forEach(r => {
      deepUpdate(update, r)
    })
    if (toUpdate.length > 0) {
      this.needToSave = true
    }
    return toUpdate.map(doc => this._insertDoc(doc, true))
  }

  count() {
    return this.DB.length
  }

}

export default LilDb


