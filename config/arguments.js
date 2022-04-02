import ARGUMENTS from '#enum/arguments.js'

export default {
    [ARGUMENTS.DUMP_FROM_PATH.name]: {
        ...ARGUMENTS.DUMP_FROM_PATH,
        hasValue: true,
        required: true
    },
    [ARGUMENTS.DUMP_TO_PATH.name]: {
        ...ARGUMENTS.DUMP_TO_PATH,
        hasValue: true,
        required: true
    },
    [ARGUMENTS.DELETE_NODE_MODULES.name]: {
        ...ARGUMENTS.DELETE_NODE_MODULES,
        hasValue: false
    },
    [ARGUMENTS.FORCE_UPDATE.name]: {
        ...ARGUMENTS.FORCE_UPDATE,
        hasValue: false
    },
    [ARGUMENTS.DO_GIT_DUMP.name]: {
        ...ARGUMENTS.DO_GIT_DUMP,
        hasValue: false
    }
}