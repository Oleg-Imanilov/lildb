import { uuid, deepUpdate, deepValue, project } from './utils.js'
import fs from 'fs';
import _query from './query.js'

class LilDb {
  DB = []
  fileName = null
  log = null
  needToSave = true

  /**
   * Constructor for LilDb class.
   *
   * @param {Object} options - An object containing optional parameters:
   *  - {string} fileName - The name of the file to connect to.
   *  - {function} log - The logging function.
   *  - {number} autoSave - The interval (in seconds) at which the database should be saved.
   * @return {LilDb} LilDb instance.
   */
  constructor({ fileName = null, log = null, autoSave = false } = {}) {
    this.log = log
    if (fileName) {
      this.connect(fileName)
    }
    if (autoSave > 0) {
      this.startAutoSave(autoSave)
    }
  }

  /**
   *  Set the log function
   * @param {*} logFunction 
   */
  setLog(logFunction) {
    this.log = logFunction
  }

  /**
   * Logs an informational message if a logging function is set.
   *
   * @param {...*} args - The arguments to be passed to the logging function.
   */
  info(...args) {
    if (this.log) this.log('INFO:', ...args)
  }
  /**
   * Logs an error message if a logging function is set.
   *
   * @param {...*} args - The arguments to be passed to the logging function.
   */
  error(...args) {
    if (this.log) this.log('ERROR:', ...args)
  }
  /**
   * Logs a warning message if a logging function is set.
   *
   * @param {...*} args - The arguments to be passed to the logging function.
   */
  warn(...args) {
    if (this.log) this.log('WARN:', ...args)
  }

  /**
   * A function that loads data from a file into the database.
   */
  load() {
    if (!this.fileName) {
      this.warn('No file name defined')
      return false
    }
    const txt = fs.readFileSync(this.fileName, 'utf-8')
    const lines = txt ? txt.split('\n') : []
    lines.forEach(line => {
      if (line.length === 0) return
      const doc = JSON.parse(line)
      this._insertDoc(doc, true)
    })
    return true
  }

  /**
   * Connects to a file and loads its content if it exists.
   * If the file doesn't exist, it saves an empty database.
   * If autoSave is set to a positive number, it starts the auto-save process.
   *
   * @param {string} fileName - The name of the file to connect to.
   * @param {boolean} [autoSave=false] - Whether to enable auto-save.
   * @return {void} This function does not return anything.
   */
  connect(fileName, autoSave = false) {
    this.fileName = fileName
    if (!fs.existsSync(this.fileName)) {
      this.save()
    } else {
      if (this.load()) {
        this.info({ action: 'loaded', time: Date.now() })
      }
    }

    if (autoSave > 0) {
      this.startAutoSave(autoSave)
      process.on('exit', (code) => {
        this.stopAutoSave()
        this.save()
      });
    }
  }

  /**
   * Starts the auto-save process with the specified autoSaveTime interval.
   *
   * @param {number} autoSaveTime - The interval (in seconds) at which the database should be saved.
   * @return {void} This function does not return anything.
   */
  startAutoSave(autoSaveTime) {
    this.autoSave = autoSaveTime
    this.stopAutoSave()
    this.save()
    if (this.autoSave && this.autoSave > 0) {
      this.autoSaveInterval = setInterval(() => {
        if(this.save()) {
          this.info('DB saved at', Date.now())          
        }
      }, this.autoSave * 1000)
    }
  }

  /**
   * Stops the auto-save process if it is currently running.
   *
   * @return {void} This function does not return anything.
   */
  stopAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval)
      this.save()
    }
  }

  /**
   * Inserts a document into the database, optionally overriding any existing document with the same _id.
   * > !!! Do not use this function directly. Use the `insert` method instead.
   *
   * @param {Object} doc - The document to insert.
   * @param {boolean} [override=false] - Whether to override any existing document with the same _id.
   * @throws {Error} If the document has a duplicate _id and override is false.
   * @return {Object} The inserted document.
   */
  _insertDoc(doc, override = false) {
    const oldIx = this.DB.findIndex(r => r._id === doc._id)
    if (!override && oldIx >= 0) {
      throw new Error('Duplicate _id')
    }
    const newDoc = structuredClone(doc)
    if (!newDoc._id) {
      newDoc._id = uuid()
    }
    if (override && oldIx >= 0) {
      this.DB[oldIx] = newDoc
    } else {
      this.DB.push(newDoc)
    }
    this.needToSave = true
    return structuredClone(newDoc)
  }


  /**
   * stop autoSave and save the db
   *
   * @return {void} This function does not return anything.
   */
  end() {
    this.stopAutoSave()
    this.save()
  }


  /**
   * Saves the database if it needs to be saved.
   *
   * @return {boolean} Whether the database was saved.
   */
  save() {
    if (!this.fileName) throw new Error('No file name')
    if (this.needToSave) {
      this.saveAs(this.fileName)
      return true
    }
    return false
  }


  /**
   * Saves the database to the provided file name.
   *
   * @param {string} fileName - The name of the file to save to.
   * @param {Object} options - An object containing optional parameters:
   *   - {boolean} overwrite - Whether to overwrite the file if it already exists. Default is true.
   * @throws {Error} If the file already exists and overwrite is false.
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
   * Inserts a document into the database.
   *
   * @param {Object|Array<Object>} data - The document to insert.
   * @returns {Object|Array<Object>} The inserted document(s).
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


  /**
   * Inserts or updates a document in the database.
   *
   * @param {Object|Array<Object>} data - The document to insert or update.
   * @returns {Object|Array<Object>} The inserted or updated document(s).
   */
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

  /**
   * Queries the database.
   *
   * @param {Object} query - The query to use.
   * @param {Object} options - An object containing optional parameters:
   *   - {boolean} group - Whether to group the results. Default is false.
   *   - {Object} projection - The projection to apply. Default is false.
   *   - {Object} sortAsc - The field to sort the results in ascending order. Default is false.
   *   - {Object} sortDesc - The field to sort the results in descending order. Default is false.
   * @returns {Object|Array<Object>} The query results.
   */
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



  /**
   * Removes a document from the database.
   * @param {Object} query - The query to use.
   * @returns {Object|Array<Object>} The removed document(s).
   */
  remove(query) {
    const toRemove = this.query(query)
    const toRemoveIds = toRemove.map(r => r._id)
    this.DB = this.DB.filter(r => !toRemoveIds.includes(r._id))
    if (toRemove.length > 0) {
      this.needToSave = true
    }
    return toRemove.map(d => structuredClone(d))
  }


  /**
   * Updates documents in the database based on the provided query and update.
   *
   * @param {Object} query - The query to use for filtering the documents.
   * @param {Object} update - The update to apply to the matching documents.
   * @return {Array} An array of the updated documents.
   */
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


  /**
   * Returns the number of documents in the database.
   *
   * @return {number} The number of documents.
   */
  count() {
    return this.DB.length
  }

}

export default LilDb


