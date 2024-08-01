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
        if (!opt && opt !== 0) {
            throw new Error("No data to cast");
        } else if (typeof opt === "string") {
            const record_opt_check = opt.slice(-21);
            if (record_opt_check[0] === ":") {
                return CASTING_TYPES.RECORD + `'${opt}'`;
            } else if (opt[0] === "$") {
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
