class ArgumentsWorker {
    #args

    /**
     * @param {String[]} args
     * @param {Object} argumentsConfig
     */
    constructor(args, argumentsConfig) {
        this.#args = ArgumentsWorker.#getProceededArguments(args, argumentsConfig)
    }

    /**
     * @param argumentName
     * @return {String|Boolean}
     */
    getArgumentValue(argumentName) {
        return this.#args[argumentName]
    }

    getArgumentsValues() {
        return this.#args
    }

    /**
     * @param {String[]} args
     * @param {Object} argumentsConfig
     * @return {Object}
     */
    static #getProceededArguments(args, argumentsConfig) {
        const proceededArguments = {}

        Object.values(argumentsConfig).forEach((argumentConfig) => {
            proceededArguments[argumentConfig.name] = ArgumentsWorker.#getProceededArgument(args, argumentConfig)
        })

        return proceededArguments
    }

    /**
     * @param {String[]} args
     * @param {Object} argumentConfig
     * @return {String|Boolean}
     */
    static #getProceededArgument(args, argumentConfig) {
        const argumentIndex = args.findIndex(arg => arg.includes(argumentConfig.argument))

        if (argumentConfig.required === true && argumentIndex === -1) {
            throw new Error(`Argument ${argumentConfig.argument} is required`)
        }

        if (argumentConfig.hasValue === true) {
            const argumentValue = args[argumentIndex]
                .replace(argumentConfig.argument + '=', '')
                .trim()

            if (argumentValue.length === 0) {
                throw new Error(`Argument ${argumentConfig.argument} must have value`)
            }

            return argumentValue
        } else {
            return argumentIndex !== -1
        }
    }
}

export default ArgumentsWorker
