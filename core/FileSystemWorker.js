import * as fs from 'fs'
import fse from 'fs-extra'
import * as path from 'path'

class FileSystemWorker {
    /**
     * Checks if folder exists.
     * If not throws error
     *
     * @param {String} folderPath
     */
    isFolderExists(folderPath) {
        folderPath = path.resolve(folderPath)

        return fs.existsSync(folderPath) && fs.lstatSync(folderPath).isDirectory()
    }

    /**
     * @param {String} folderPath
     * @return {Number}
     */
    getFolderLastModifiedDate(folderPath) {
        return fs.statSync(folderPath).mtimeMs
    }

    /**
     * @param {String} from
     * @param {String} to
     * @param {Boolean} force - whenever to override folder in destination
     */
    copy(from, to, force = false) {
        if (fs.lstatSync(from).isDirectory()) {
            if (!this.isFolderExists(from)) {
                throw new Error(`No folder under ${from}`)
            }

            if (this.isFolderExists(to)) {
                if (!force) {
                    throw new Error(`Folder ${to} already exists`)
                }

                fs.rmSync(to, {force: true, recursive: true})
            }
        }

        fse.copySync(from, to)
    }
}

export default new FileSystemWorker()