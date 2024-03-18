import { fileExists, uuid } from './utils.js'

class PrivateLilDb {
  DB = []
  fileName = null
  autoSave = false
  lastSaved = null
  log = null
  needToSave = true

  constructor() {
  }
  
  async save() { 
    throw new Error('Not implemented')
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
      this._insertDoc(doc, true)
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

  _insertDoc(doc, override = false) {
    const oldIx = this.DB.findIndex(r => r._id === doc._id)
    if(!override && oldIx >= 0) {
        throw new Error('Duplicate _id')
    } 
    const newDoc = structuredClone(doc)
    if (!newDoc._id) {
      newDoc._id = uuid()
    }
    if (override && oldIx) {
        this.DB[oldIx] = newDoc
    } else {
        this.DB.push(newDoc)
    }
    this.needToSave = true
    return structuredClone(newDoc)
  }

}


export default PrivateLilDb


