import fs from 'fs'
import { uuid } from './utils.js'

class PrivateLilDb {
    DB = []
    fileName = null
    autoSave = false
    lastSaved = null
    log = null
    needToSave = true

    constructor() {
    }

    save() {
        // override this method
    }

    _connect(fileName, { autoSave = 10, log = null } = {}) {
        this.fileName = fileName
        this.log = log
        if (!fs.existsSync(this.fileName)) {
            this.save()
        }

        const txt = fs.readFileSync(this.fileName, 'utf-8')
        const lines = txt ? txt.split('\n') : []
        lines.forEach(line => {
            if (line.length === 0) return
            const doc = JSON.parse(line)
            this._insertDoc(doc, true)
        })
        if (this.log) this.log({ action: 'loaded', time: Date.now() })
        if (autoSave) {
            this.autoSave = setInterval(() => {
                this.save()
                if (this.log) this.log({ action: 'saved', time: this.lastSaved })
            }, autoSave * 1000)

            process.on('exit', (code) => {
                this.save()
            });
        }
    }

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
     */
    end() {
        if (this.autoSave) {
            clearInterval(this.autoSave)
            this.save()
        }
    }

}


export default PrivateLilDb


