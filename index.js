import { deepValue, fileExists, uuid } from './utils.js'
import { promises as fs } from 'fs';
import _query from './query.js'

class _LilDb {
  DB = []
  fileName = null
  autoSave = false
  lastSaved = null
  log = null

  constructor() {
  }
  
  async _connect(fileName, { autoSave = 10, log = null } = {}) {
    this.fileName = fileName
    this.log = log
    const exists = await fileExists(this.fileName)
    if (!exists) {
      await this.save()
    }
    await processFileLineByLine(filePath, (line) => {
      const doc = JSON.parse(line)
      this._insertDoc(doc, { override: true }) 
    }, () => {
      if (this.log) this.log({ action: 'loaded', time: Date.now() })
    })
    if (autoSave) {
      this.autoSave = setInterval(() => {
        this.save().then(() => {
          if (this.log) this.log({ action: 'saved', time: this.lastSaved })
        }).catch(e => {
          if (this.log) this.log({ action: 'error', time: Date.now(), error: e.message })
        })
      }, autoSave * 1000)
    }
  }

  async _insertDoc(doc, { override = false } = {}) {
    const newDoc = { ...doc }
    if (!newDoc._id) {
      newDoc._id = uuid()
    }
    if (override || (!override && !this.DB[newDoc._id])) {
      this.DB[newDoc._id] = newDoc
    } else {
      throw new Error('Duplicate _id')
    }
    return newDoc
  }

}


class LilDb extends _LilDb {
  DB = []
  fileName = null
  autoSave = false
  lastSaved = null
  log = null

  constructor() {
    super()
  }

  static async connect(fileName, { autoSave = 10, log = null } = {}) {
    const db = new LilDb()
    await db._connect(fileName, { autoSave, log })
    return db
  }

  async end() {
    if (this.autoSave) {
      clearInterval(this.autoSave)
      await this.save()      
    }
  }

  setLog(logFunction) {
    this.log = logFunction
  }

  async save() {
    if (!this.fileName) throw new Error('No file name')
    return await this.saveAs(this.fileName)
  }

  async saveAs(fileName, { overwrite = true } = {}) {
    const exists = await fileExists(fileName)
    if (exists && !overwrite) {
      throw new Error('File exists')
    }
    this.fileName = fileName
    await fs.writeFile(this.fileName, this.DB.map(r => JSON.stringify(r)).join('\n'), 'utf8')
    this.lastSaved = Date.now()
  }

  insert(data) {
    if (Array.isArray(data)) {
      return data.map(r => this._insertDoc(r))
    } else if (typeof data === 'object') {
      const res = this._insertDoc(data)
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
    toRemove.forEach(r => {
      delete this.DB[r._id]
    })
    return toRemove.map(structuredClone)
  }

  update(query, update) {
    const toUpdate = this.query(query)
    toUpdate.forEach(r => {
      deepUpdate(update, r)
    })
    return toUpdate
  }

}

export default LilDb


