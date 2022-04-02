import {resolve} from 'path'

import argumentsConfig from '#config/arguments.js'
import argumentsEnum from '#enum/arguments.js'

import ArgumentsWorker from '#core/ArgumentsWorker.js'
import Dumper from '#core/Dumper.js'

const argumentsWorker = new ArgumentsWorker(process.argv, argumentsConfig)
const dumperOptions = {
    ...argumentsWorker.getArgumentsValues(),
    [argumentsEnum.DUMP_FROM_PATH.name]: resolve(argumentsWorker.getArgumentValue(argumentsEnum.DUMP_FROM_PATH.name)),
    [argumentsEnum.DUMP_TO_PATH.name]: resolve(argumentsWorker.getArgumentValue(argumentsEnum.DUMP_TO_PATH.name))
}
const dumper = new Dumper(dumperOptions)

dumper
    .init()
    .then(() => {
        console.log(dumper.to_dump_list)
        dumper.doDump().then(() => {
            console.log('Dumped')
        })
    })

// node main.js --dump-from=../ --dump-to=C:\Users\Bohdan\OneDrive\Desktop\dump_test\destination
