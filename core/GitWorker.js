import asyncExec from '#helper/asyncExec.js'

import fileSystemWorker from '#core/FileSystemWorker.js'

const NEWLINE_REGEX = /\r?\n|\r/
const STAR_REGEX = /^\*\s*/g

class GitWorker {
    projectPath = ''

    constructor(path) {
        if (!fileSystemWorker.isFolderExists(path)) {
            throw new Error('No folder under: ' + path)
        }

        this.projectPath = path
    }

    #execInProjectDirectory(command) {
        return asyncExec(`cd ${this.projectPath} && ${command}`, true)
    }

    async getLocalBranches() {
        const branchesRaw = await this.#execInProjectDirectory('git branch')

        return GitWorker.#branchLines(branchesRaw)
    }

    async getAllRemoteBranches() {
        const branchesRaw = await this.#execInProjectDirectory('git branch -r')

        const branchesArray = GitWorker.#branchLines(branchesRaw)

        return branchesArray.map(branchString => {
            const [remote, branch] = branchString.split('/')

            return {remote, branch}
        })
    }

    deleteLocalBranch(branch) {
        return this.#execInProjectDirectory(`git branch -D ${branch}`)
    }

    async deleteAllLocalBranches() {
        const localBranches = await this.getLocalBranches()

        return Promise.all(localBranches.map(branch => this.deleteLocalBranch(branch)))
    }

    fetch() {
        return this.#execInProjectDirectory(`git fetch`)
    }

    checkout(branch) {
        return this.#execInProjectDirectory(`git checkout ${branch}`)
    }

    pull(remote, branch) {
        return this.#execInProjectDirectory(`git pull ${remote} ${branch}`)
    }

    static #branchLines(str) {
        return str
            .trim()
            .split(NEWLINE_REGEX)
            .map(line => {
                return line
                    .trim()
                    .replace(STAR_REGEX, '')
            });
    }

    async isGitDirectory() {
        const commandResult = await this.#execInProjectDirectory('git rev-parse --is-inside-work-tree')

        return Boolean(commandResult.trim().replace(NEWLINE_REGEX, ''))
    }
}

export default GitWorker
