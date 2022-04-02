import {join, resolve} from 'path'
import {createWriteStream} from 'fs'

class Logger {
    #options = {
        logInto: join(resolve(process.cwd()), 'logs.txt')
    }
    #logStream

    constructor(options) {
        this.#options = {
            ...this.#options,
            options
        }

        this.#logStream = createWriteStream(this.#options.logInto, {flags: 'a'})
    }

    /**
     * @param {String} message
     */
    log(message) {
        console.log(message)
        this.#logStream.write(Logger.#formatLogMessage('Log', message))
    }

    /**
     * @param {String} type
     * @param {String} message
     * @return {String}
     */
    static #formatLogMessage(type, message) {
        message = `[${type}] [${new Date()}]: ${message}\n`

        return message
    }
}

export default Logger
