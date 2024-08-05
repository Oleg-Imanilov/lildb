const { uuid, deepUpdate, deepValue, project } = require('./utils')
const fs = require('fs');
const _query = require('./query')

class LilDb {
  DB = []
  
  /**
   * Constructor for LilDb class.
   *
   * @param {string} fileName - initial file to load
   * @return {LilDb} LilDb instance.
   */
  constructor(fileName = null) {
    if(fileName) this.load(fileName)
  }

  /**
   * A function that loads data from a file into the database.
   */
  load(fileName) {
    this.fileName = fileName
    const txt = fs.readFileSync(fileName, 'utf-8')
    this.DB = JSON.parse(txt)
    return true
  }

  /**
   * Inserts a document into the database, optionally overriding any existing document with the same id.
   * > !!! Do not use this function directly. Use the `insert` method instead.
   *
   * @param {Object} doc - The document to insert.
   * @param {boolean} [override=false] - Whether to override any existing document with the same id.
   * @throws {Error} If the document has a duplicate id and override is false.
   * @return {Object} The inserted document.
   */
  _insertDoc(doc, override = false) {
    const oldIx = this.DB.findIndex(r => r.id === doc.id)
    if (!override && oldIx >= 0) {
      throw new Error('Duplicate id')
    }
    const newDoc = structuredClone(doc)
    if (!newDoc.id) {
      newDoc.id = uuid()
    }
    if (override && oldIx >= 0) {
      this.DB[oldIx] = newDoc
    } else {
      this.DB.push(newDoc)
    }
    return structuredClone(newDoc)
  }

  /**
   * Saves the database to the current file name.
   */
  save() {
    if(this.fileName) {
      this.saveAs(this.fileName, {overwrite: true})
    } else {
      throw new Error('No file name')
    }
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
    this.fileName = fileName
    if (fs.existsSync(fileName) && !overwrite) {
      throw new Error('File exists')
    }
    fs.writeFileSync(fileName, JSON.stringify(this.DB), 'utf-8')
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
    const toRemoveIds = toRemove.map(r => r.id)
    this.DB = this.DB.filter(r => !toRemoveIds.includes(r.id))
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

module.exports = LilDb



