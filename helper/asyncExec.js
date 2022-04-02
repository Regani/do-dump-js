import { exec } from 'child_process'

export default (command, ignoreErr = false) => {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error && !ignoreErr) {
                reject(error.message)
            }
            if (stderr && !ignoreErr) {
                reject(stderr)
            }

            resolve(stdout)
        })
    })
}
