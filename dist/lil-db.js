(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.LilDb = factory());
})(this, (function () { 'use strict';

	function getDefaultExportFromCjs (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	function getAugmentedNamespace(n) {
	  if (n.__esModule) return n;
	  var f = n.default;
		if (typeof f == "function") {
			var a = function a () {
				if (this instanceof a) {
	        return Reflect.construct(f, arguments, this.constructor);
				}
				return f.apply(this, arguments);
			};
			a.prototype = f.prototype;
	  } else a = {};
	  Object.defineProperty(a, '__esModule', {value: true});
		Object.keys(n).forEach(function (k) {
			var d = Object.getOwnPropertyDescriptor(n, k);
			Object.defineProperty(a, k, d.get ? d : {
				enumerable: true,
				get: function () {
					return n[k];
				}
			});
		});
		return a;
	}

	var _polyfillNode_crypto = {};

	var _polyfillNode_crypto$1 = /*#__PURE__*/Object.freeze({
		__proto__: null,
		default: _polyfillNode_crypto
	});

	var require$$0 = /*@__PURE__*/getAugmentedNamespace(_polyfillNode_crypto$1);

	const crypto = require$$0;

	const ALPHANUMERICS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

	/**
	 * @param {*} length of target string
	 * @returns random alphanumeric string of length
	 */
	function uuid$1(length = 32) {
	    return Array.from(crypto.randomBytes(length))
	        .map(i => ALPHANUMERICS[i % ALPHANUMERICS.length])
	        .join('');
	}

	function deepValue$2(key, doc) {
	    if (typeof doc !== 'object' || !key) return null
	    const kk = Array.isArray(key) ? key : key.split('.');
	    const d = doc[kk[0]];
	    if (kk.length === 1) {
	        return d
	    } else {
	        return deepValue$2(kk.slice(1), d)
	    }
	}

	function deepValueSet(key, doc, value) {
	    if (typeof doc !== 'object') return
	    const kk = Array.isArray(key) ? key : key.split('.');
	    if (kk.length === 1) {
	        doc[kk[0]] = value;
	        return
	    } else {
	        if(doc[kk[0]] === undefined) doc[kk[0]] = {};
	        return deepValueSet(kk.slice(1), doc[kk[0]], value)
	    }
	}


	function deepUpdate$1(from, to) {
	    Object.keys(from).forEach(k => {
	        if (typeof from[k] === 'object') {
	            to[k] = to[k] || {};
	            deepUpdate$1(from[k], to[k]);
	        } else {
	            to[k] = from[k];
	        }
	    });
	}

	function project$1(doc, projection) {
	    const projected = {};
	    Object.keys(projection).forEach(k => {
	        projected[k] = deepValue$2(projection[k], doc);
	    });
	    return projected
	}

	var utils = {
	    uuid: uuid$1,
	    deepValue: deepValue$2,
	    deepValueSet,
	    deepUpdate: deepUpdate$1,
	    project: project$1
	};

	var _polyfillNode_fs = {};

	var _polyfillNode_fs$1 = /*#__PURE__*/Object.freeze({
		__proto__: null,
		default: _polyfillNode_fs
	});

	var require$$1 = /*@__PURE__*/getAugmentedNamespace(_polyfillNode_fs$1);

	const { deepValue: deepValue$1 } = utils;

	function _or(qq, doc) {
	    if (!Array.isArray(qq)) throw new Error('Invalid query. $or must be an array.')
	    for (let i = 0; i < qq.length; i++) {
	        if (_(qq[i], doc) !== null) return true
	    }
	    return false
	}

	function _and(qq, doc) {
	    if (!Array.isArray(qq)) throw new Error('Invalid query. $and must be an array.')
	    for (let i = 0; i < qq.length; i++) {
	        if (_(qq[i], doc) === null) return false
	    }
	    return true
	}

	function _not(qq, doc) {
	    return _(qq, doc) === null
	}

	function _lt(q, doc) {
	    if (typeof q !== 'object' || Array.isArray(q)) throw new Error('Invalid query. $lt must be an object.')
	    const keys = Object.keys(q);
	    return keys.every(k => deepValue$1(k, doc) < q[k])
	}

	function _ne(q, doc) {
	    if (typeof q !== 'object' || Array.isArray(q)) throw new Error('Invalid query. $ne must be an object.')
	    const keys = Object.keys(q);
	    return keys.every(k => {
	        const v1 = deepValue$1(k, doc);
	        const v2 = q[k];
	        return v1 !== v2
	    })
	}

	function _regex(q, doc) {
	    if (typeof q !== 'object' || Array.isArray(q)) throw new Error('Invalid query. $regex must be an object.')
	    const keys = Object.keys(q);
	    return keys.every(k => {
	        const v1 = deepValue$1(k, doc);
	        const v2 = q[k];
	        return v1.match(v2)
	    })
	}

	function _size(q, doc) {
	    if (typeof q !== 'object' || Array.isArray(q)) throw new Error('Invalid query. $size must be an object.')
	    const keys = Object.keys(q);
	    return keys.every(k => {
	        const v1 = deepValue$1(k, doc);
	        const v2 = q[k];
	        return v1.length === v2
	    })
	}

	function _gt(q, doc) {
	    if (typeof q !== 'object' || Array.isArray(q)) throw new Error('Invalid query. $gt must be an object.')
	    const keys = Object.keys(q);
	    return keys.every(k => deepValue$1(k, doc) > q[k])
	}

	function _lte(q, doc) {
	    if (typeof q !== 'object' || Array.isArray(q)) throw new Error('Invalid query. $lte must be an object.')
	    const keys = Object.keys(q);
	    return keys.every(k => deepValue$1(k, doc) <= q[k])
	}

	function _gte(q, doc) {
	    if (typeof q !== 'object' || Array.isArray(q)) throw new Error('Invalid query. $gte must be an object.')
	    const keys = Object.keys(q);
	    return keys.every(k => deepValue$1(k, doc) >= q[k])
	}

	function _null(q, doc) {
	    if (typeof q !== 'string') throw new Error('Invalid query. $null must be an string (key).')
	    const v = deepValue$1(q, doc);
	    return v === null || v === undefined
	}

	function _in(q, doc) {
	    if (typeof q !== 'object' || Array.isArray(q)) throw new Error('Invalid query. $in/$nin must be an object.')
	    const keys = Object.keys(q);
	    if (!Object.values(q).every(v => Array.isArray(v))) throw new Error('Invalid query. Every value of $in/$nin must be an array.')
	    return keys.every(k => q[k].includes(deepValue$1(k, doc)))
	}

	function _nin(q, doc) {
	    return !_in(q, doc)
	}

	const OP = {
	    '$or': _or,
	    '$and': _and,
	    '$not': _not,
	    '$lt': _lt,
	    '$gt': _gt,
	    '$lte': _lte,
	    '$gte': _gte,
	    '$in': _in,
	    '$nin': _nin,
	    '$ne': _ne,
	    '$regex': _regex,
	    '$size': _size,
	    '$null': _null,
	};

	function _(query, doc) {
	    if (typeof query !== 'object' || Array.isArray(query)) throw new Error('Invalid query. Must be an object.')
	    const qq = Object.keys(query);
	    if (qq.length === 0) return doc
	    const match = qq.map(k => {
	        if (k.startsWith('$')) {
	            if(OP[k]) return OP[k](query[k], doc)
	            return query[k] === deepValue$1(k, doc)
	        } else {
	            return query[k] === deepValue$1(k, doc)
	        }
	    }).every(v => v === true);
	    return match ? doc : null;
	}

	var query = _;

	const { uuid, deepUpdate, deepValue, project } = utils;
	const fs = require$$1;
	const _query = query;

	class LilDb {
	  DB = []
	  
	  /**
	   * Constructor for LilDb class.
	   *
	   * @param {string} fileName - initial file to load
	   * @return {LilDb} LilDb instance.
	   */
	  constructor(fileName = null) {
	    if(fileName) this.load(fileName);
	  }

	  /**
	   * A function that loads data from a file into the database.
	   */
	  load(fileName) {
	    this.fileName = fileName;
	    const txt = fs.readFileSync(fileName, 'utf-8');
	    this.DB = JSON.parse(txt);
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
	    const oldIx = this.DB.findIndex(r => r.id === doc.id);
	    if (!override && oldIx >= 0) {
	      throw new Error('Duplicate id')
	    }
	    const newDoc = structuredClone(doc);
	    if (!newDoc.id) {
	      newDoc.id = uuid();
	    }
	    if (override && oldIx >= 0) {
	      this.DB[oldIx] = newDoc;
	    } else {
	      this.DB.push(newDoc);
	    }
	    return structuredClone(newDoc)
	  }

	  /**
	   * Saves the database to the current file name.
	   */
	  save() {
	    if(this.fileName) {
	      this.saveAs(this.fileName, {overwrite: true});
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
	    this.fileName = fileName;
	    if (fs.existsSync(fileName) && !overwrite) {
	      throw new Error('File exists')
	    }
	    fs.writeFileSync(fileName, JSON.stringify(this.DB), 'utf-8');
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
	      const res = this._insertDoc(data);
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
	      const res = this._insertDoc(data, true);
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
	    let arr = Object.values(this.DB).map(doc => _query(query, doc)).filter(r => !!r);
	    if (sortAsc) {
	      arr = arr.sort((a, b) => {
	        const va = deepValue(sortAsc, a);
	        const vb = deepValue(sortAsc, b);
	        if (va < vb) {
	          return -1;
	        }
	        if (va > vb) {
	          return 1;
	        }
	        return 0;
	      });
	    } else if (sortDesc) {
	      arr = arr.sort((a, b) => {
	        const va = deepValue(sortDesc, a);
	        const vb = deepValue(sortDesc, b);
	        if (va < vb) {
	          return 1;
	        }
	        if (va > vb) {
	          return -1;
	        }
	        return 0;
	      });
	    }
	    if (group) {
	      const grouped = {};
	      arr.forEach(r => {
	        const groupVal = deepValue(group, r);
	        grouped[groupVal] = grouped[groupVal] || [];
	        grouped[groupVal].push(projection ? project(r, projection) : structuredClone(r));
	      });
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
	    const toRemove = this.query(query);
	    const toRemoveIds = toRemove.map(r => r.id);
	    this.DB = this.DB.filter(r => !toRemoveIds.includes(r.id));
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
	    const toUpdate = this.query(query);
	    toUpdate.forEach(r => {
	      deepUpdate(update, r);
	    });
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

	var LilDb_1 = LilDb;

	var LilDb$1 = /*@__PURE__*/getDefaultExportFromCjs(LilDb_1);

	return LilDb$1;

}));
