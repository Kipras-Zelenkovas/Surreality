const CASTING_TYPES = {
    BOOL: "<bool>",
    INT: "<int>",
    FLOAT: "<float>",
    STRING: "<string>",
    NUMBER: "<number>",
    DECIMAL: "<decimal>",
    DATETIME: "<datetime>",
    DURATION: "<duration>",
    ARRAY: "<array>",
    RECORD: "<record>",
    UUID: "<uuid>",
};

/**
 *
 * @param {any} opt
 *
 * @returns {string | array | object}
 */
export const casting = (opt) => {
    try {
        if (opt.data != undefined && opt.as != undefined) {
            if (opt.as === "bool") {
                return CASTING_TYPES.BOOL + `'${opt.data}'`;
            } else if (opt.as === "int") {
                return CASTING_TYPES.INT + `'${opt.data}'`;
            } else if (opt.as === "float") {
                return CASTING_TYPES.FLOAT + `'${opt.data}'`;
            } else if (opt.as === "string") {
                return CASTING_TYPES.STRING + `'${opt.data}'`;
            } else if (opt.as === "number") {
                return CASTING_TYPES.NUMBER + `'${opt.data}'`;
            } else if (opt.as === "decimal") {
                return CASTING_TYPES.DECIMAL + `'${opt.data}'`;
            } else if (opt.as === "datetime") {
                return CASTING_TYPES.DATETIME + `'${opt.data}'`;
            } else if (opt.as === "duration") {
                return CASTING_TYPES.DURATION + `'${opt.data}'`;
            } else if (opt.as === "array") {
                const castedArr = opt.data.map((item) => {
                    return casting(item);
                });

                return `[${castedArr.join(", ")}]`;
            } else if (opt.as === "record") {
                return CASTING_TYPES.RECORD + `'${opt.data}'`;
            } else if (opt.as === "object") {
                const keys = Object.keys(opt.data);

                const castedObj = keys.map((key) => {
                    return `${key}: ${casting(opt.data[key])}`;
                });

                return `{${castedObj.join(", ")}}`;
            }
        }

        if (opt === null || opt === undefined || opt === "") {
            return `NONE`;
        } else if (!opt && opt !== 0 && opt !== undefined) {
            throw new Error("No data to cast");
        } else if (typeof opt === "string") {
            // checks if the string is a record
            const record_opt_check = opt.slice(-21);
            // checks if string is a database parameter
            const param_opt_check = opt.split("$").length - 1;

            if (record_opt_check[0] === ":") {
                return CASTING_TYPES.RECORD + `'${opt}'`;
            } else if (opt[0] === "$" && param_opt_check === 1) {
                return `${opt}`;
            } else if (opt === "NONE") {
                return `NONE`;
            } else if (
                opt.includes("T") &&
                opt.includes("Z") &&
                opt.includes("-")
            ) {
                return CASTING_TYPES.DATETIME + `'${opt}'`;
            } else {
                return CASTING_TYPES.STRING + `'${opt}'`;
            }
        } else if (typeof opt === "number") {
            const new_opt = opt.toString();
            if (new_opt.includes(".")) {
                return CASTING_TYPES.FLOAT + `'${new_opt}'`;
            } else {
                return CASTING_TYPES.INT + `'${new_opt}'`;
            }
        } else if (typeof opt === "boolean") {
            return CASTING_TYPES.BOOL + `'${opt}'`;
        } else if (Array.isArray(opt)) {
            const castedArr = opt.map((item) => {
                return casting(item);
            });

            return `[${castedArr.join(", ")}]`;
        } else if (typeof opt === "object") {
            const keys = Object.keys(opt);

            const castedObj = keys.map((key) => {
                return `${key}: ${casting(opt[key])}`;
            });

            return `{${castedObj.join(", ")}}`;
        }
    } catch (err) {
        console.error("Failed to cast:", err);
        throw err;
    }
};
