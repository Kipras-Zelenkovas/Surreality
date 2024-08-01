import { whereToSelect } from "../utils/SurrealQuering/condition.js";
import { casting } from "../utils/Typing/casting.js";

/**
 * @param {object} data
 *
 * @returns {object}
 *
 * @description This function will convert and cast data to the correct type for the database.
 */
const fieldsToUpdateOBJ = (data) => {
    Object.keys(data).forEach((key) => {
        if (data[key] === undefined) {
            delete data[key];
        } else {
            data[key] = casting(data[key]);
        }
    });

    return data;
};

/**
 * @param {object} data
 *
 * @returns {array}
 *
 * @description This function will convert and cast data to the correct type for the database.
 *
 */
const fieldsToUpdateArr = (data) => {
    const FTU = Object.keys(data).map((key) => {
        return `${key} = ${casting(data[key])}`;
    });

    return FTU;
};

/**
 *
 * @param {string | "MERGE" | "CONTENT" | "SET"} id
 * @param {object} data
 * @param {object} opts
 * @param {string} opts.type
 * @param {object} opts.where
 * @param {string|array} opts.return
 *
 * @returns {string}
 */
export const updateCON = (id, data, opts = {}) => {
    try {
        let query = "";

        if (opts.type === "MERGE") {
            const FTU = fieldsToUpdateOBJ(data);
            const condition =
                Object.keys(opts.where).length != 0
                    ? `WHERE ${whereToSelect(opts.where)}`
                    : "";

            query = `UPDATE ${id} ${opts.type} {${Object.keys(FTU).map(
                (key) => {
                    return `${key}: ${FTU[key]}`;
                }
            )}} ${condition} RETURN ${
                typeof opts.return === "string"
                    ? opts.return
                    : opts.return.join(", ")
            };`;
        } else if (opts.type === "CONTENT") {
            const FTU = fieldsToUpdateOBJ(data);

            query = `UPDATE ${id} ${opts.type} {${Object.keys(FTU).map(
                (key) => {
                    return `${key}: ${FTU[key]}`;
                }
            )}} RETURN ${
                typeof opts.return === "string"
                    ? opts.return
                    : opts.return.join(", ")
            };`;
        } else if (opts.type === "SET") {
            const FTU = fieldsToUpdateArr(data).join(", ");
            const condition =
                Object.keys(opts.where).length != 0
                    ? `WHERE ${whereToSelect(opts.where)}`
                    : "";

            query = `UPDATE ${id} ${opts.type} ${FTU} ${condition} RETURN ${
                typeof opts.return === "string"
                    ? opts.return
                    : opts.return.join(", ")
            };`;
        } else {
            throw new Error("Invalid type of update");
        }

        return query;
    } catch (err) {
        console.error("Failed to update:", err);
        throw err;
    }
};
