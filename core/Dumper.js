import * as fs from 'fs'
import * as path from 'path'

import FindNRemove from 'find-n-remove'

import argumentsEnum from '#enum/arguments.js'
import ELEMENT_TYPES from '#enum/elementTypes.js'

import GitWorker from '#core/GitWorker.js'

import fileSystemWorker from '#core/FileSystemWorker.js'
import Logger from '#core/Logger.js'
const logger = new Logger({logInto: path.join(process.cwd(), 'logs', 'logs.txt')})

class Dumper {
    options = {
        [argumentsEnum.DUMP_FROM_PATH.name]: '',
        [argumentsEnum.DUMP_TO_PATH.name]: '',
        [argumentsEnum.DELETE_NODE_MODULES.name]: false,
        [argumentsEnum.FORCE_UPDATE.name]: false // By default, will ignore project if in destination a newer version exists
    }

    to_dump_list = []

    stats = {
        dumped: {
            success: {
                total: 0,
                list: []
            },
            errored: {
                total: 0,
                list: []
            }
        },
        git_updated_projects: {
            success: {
                total: 0,
                list: []
            },
            errored: {
                total: 0,
                list: []
            }
        },
    }

    constructor(options) {
        this.options = options
    }

    async init() {
        this.#validateArguments()
        await this.#setToDumpPathList()
    }

    doDump() {
        return Promise.all(this.to_dump_list.map(toDump => this.#dumpElement(toDump)))
    }

    async #dumpElement(toDump) {
        logger.log(`Dumping: ${JSON.stringify(toDump)}`)

        const destinationPath = path.join(this.options[argumentsEnum.DUMP_TO_PATH.name], path.basename(toDump.path))

        logger.log(`Will dump into: ${destinationPath}`)

        if (toDump.type === ELEMENT_TYPES.FILE) {
            logger.log(`Dumping File: ${destinationPath}`)

            this.#tryDump(toDump.path, destinationPath)

            return Promise.resolve()
        }

        if (this.options[argumentsEnum.DELETE_NODE_MODULES.name] === true) {
            logger.log(`Will delete node_modules from ${toDump.path}`)

            const findAndRemove = new FindNRemove({
                to_delete_name: 'node_modules',
                is_recursive: false,
                to_delete_path: toDump.path
            })

            findAndRemove.proceed()

            logger.log(`node_modules deleted from ${toDump.path}`)
        }

        if (!toDump.hasGit || this.options[argumentsEnum.DO_GIT_DUMP.name] === false) {
            logger.log(`Dumping Folder without git: ${destinationPath}`)

            this.#tryDump(toDump.path, destinationPath)

            return Promise.resolve()
        }

        const originatingSourcePath = path.join(destinationPath, 'dumperOriginatingSource')

        logger.log(`Dumping Folder with git: ${originatingSourcePath}`)

        this.#tryDump(toDump.path, originatingSourcePath)

        try {
            const originatingGitWorker = new GitWorker(originatingSourcePath)
            const projectGitRemoteBranches = await originatingGitWorker.getAllRemoteBranches()

            logger.log(`Will dump such branches: ${JSON.stringify(projectGitRemoteBranches)}`)

            for (const {remote, branch} of projectGitRemoteBranches) {
                logger.log(`Dumping branch: ${branch}`)

                const projectBranchFolderPath = path.join(destinationPath, branch)
                fileSystemWorker.copy(originatingSourcePath, projectBranchFolderPath, true)

                logger.log(`Created folder for branch: ${projectBranchFolderPath}`)

                const branchGitWorker = new GitWorker(projectBranchFolderPath)

                await branchGitWorker.checkout(branch)
                await branchGitWorker.pull(remote, branch)

                logger.log(`Pulled branch: ${branch}`)
            }

            this.stats.git_updated_projects.success.total++
            this.stats.git_updated_projects.success.list.push(toDump.path)

            logger.log(`Successfully dumped git for: ${toDump.path}`)
        } catch (e) {
            this.stats.git_updated_projects.errored.total++
            this.stats.git_updated_projects.errored.list.push(toDump.path)

            logger.log(`Errored dumping git for: ${toDump.path}. Error: ${e}`)
        }

        return Promise.resolve()
    }

    #tryDump(source, destination) {
        try {
            fileSystemWorker.copy(source, destination, true)

            this.stats.dumped.success.total++
            this.stats.dumped.success.list.push(source)

            logger.log(`Successfully dumped: ${source}`)
        } catch (e) {
            this.stats.dumped.errored.total++
            this.stats.dumped.errored.list.push(source)

            logger.log(`Error while dumping: ${source}. Error: ${e}`)
        }
    }

    #doDumpIfHasNewerVersion(sourcePath) {
        if (this.options[argumentsEnum.FORCE_UPDATE.name] === true) {
            return true
        }

        const targetPath = path.join(this.options[argumentsEnum.DUMP_TO_PATH.name], path.basename(sourcePath))

        return !Dumper.#hasNewerVersionInDestination(sourcePath, targetPath)
    }

    /**
     * Sets the list of what to dump
     *
     * @private
     */
    async #setToDumpPathList() {
        const sourcePath = this.options[argumentsEnum.DUMP_FROM_PATH.name]

        if (fs.lstatSync(sourcePath).isFile() && this.#doDumpIfHasNewerVersion(sourcePath)) {
            this.to_dump_list.push({
                hasGit: false,
                type: ELEMENT_TYPES.FILE,
                path: sourcePath
            })

            return
        }

        const toCopyList = fs.readdirSync(sourcePath)

        for (const toCopy of toCopyList) {
            const toCopyPath = path.join(sourcePath, toCopy)

            if (this.#doDumpIfHasNewerVersion(toCopyPath)) {
                if (fs.lstatSync(toCopyPath).isFile()) {
                    this.to_dump_list.push({
                        hasGit: false,
                        type: ELEMENT_TYPES.FILE,
                        path: toCopyPath
                    })
                } else if (fs.lstatSync(toCopyPath).isDirectory()) {
                    const gitWorker = new GitWorker(toCopyPath)
                    const hasGit = await gitWorker.isGitDirectory()

                    this.to_dump_list.push({
                        hasGit,
                        type: ELEMENT_TYPES.FOLDER,
                        path: toCopyPath
                    })
                }
            }
        }
    }

    /**
     * Checks if targetPath last updated greater than source one
     *
     * @private
     * @param {String} sourcePath
     * @param {String} targetPath
     * @return {Boolean}
     */
    static #hasNewerVersionInDestination(sourcePath, targetPath) {
        if (!fs.existsSync(targetPath)) {
            return false
        }

        return fileSystemWorker.getFolderLastModifiedDate(targetPath) > fileSystemWorker.getFolderLastModifiedDate(sourcePath)
    }

    #validateArguments() {
        if (!fs.existsSync(this.options[argumentsEnum.DUMP_FROM_PATH.name])) {
            throw new Error('No such element ' + this.options[argumentsEnum.DUMP_FROM_PATH.name])
        }

        if (
            fs.lstatSync(this.options[argumentsEnum.DUMP_FROM_PATH.name]).isDirectory()
            &&
            !fs.existsSync(this.options[argumentsEnum.DUMP_TO_PATH.name])
            ||
            !fs.lstatSync(this.options[argumentsEnum.DUMP_TO_PATH.name]).isDirectory()
        ) {
            logger.log(`No such folder: ${this.options[argumentsEnum.DUMP_TO_PATH.name]}, creating new one`)

            fs.mkdirSync(this.options[argumentsEnum.DUMP_TO_PATH.name])
        }

        logger.log(`Will dump from: ${this.options[argumentsEnum.DUMP_FROM_PATH.name]}`)
        logger.log(`Will dump to: ${this.options[argumentsEnum.DUMP_TO_PATH.name]}`)
        logger.log(`Is node_modules delete: ${this.options[argumentsEnum.DELETE_NODE_MODULES.name]}`)
        logger.log(`Is force update:${this.options[argumentsEnum.FORCE_UPDATE.name]}`)
    }
}

export default Dumper
