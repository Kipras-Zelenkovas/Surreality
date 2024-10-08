import { whereToSelect } from "../utils/SurrealQuering/condition.js";
import { includeToSelect } from "../utils/SurrealQuering/includes.js";
import { orderByToSelect } from "../utils/SurrealQuering/orderBy.js";
import { fieldsToSelect } from "../utils/SurrealQuering/selectFields.js";

/**
 * Converts the selectAll options to an array of strings to be used in the SQL query
 *
 * @param {string} table - The table to select from
 * @param {Object} opts - The selectAll options
 * @param {any} opts.id - The id of the record
 * @param {Array} [opts.fields]
 * @param {{field: {value: any, operator: string} | string}} [opts.where]
 * @param {Array<string>} [opts.exclude]
 * @param {Array<{relation: string, fields: Array, where: {field: {value: any, operator: string | string}}}>} [opts.include]
 * @param {boolean} [opts.force]
 *
 * @returns {String} - The selectAll query string
 */
export const findByPkCON = (opts = {}) => {
    try {
        const include = includeToSelect(opts.include);

        const mainFields =
            fieldsToSelect(opts.fields) +
            (include.fields.length > 0 ? `, ${include.fields}` : "");
        const excludeFields =
            opts.exclude.length > 0 ? ` OMIT ${opts.exclude.join(", ")}` : "";

        const mainCondition = whereToSelect(opts.where);
        const condition =
            mainCondition +
            (include.where != ""
                ? ` ${mainCondition != "" ? " AND " : ""} ${include.where}`
                : "") +
            (opts.force === true
                ? ""
                : `${
                      mainCondition != "" || include.where != "" ? " AND " : ""
                  } timestamps.deleted_at IS NONE`);

        return `SELECT ${mainFields}${excludeFields} FROM ONLY ${opts.id} ${
            condition != "" ? `WHERE ${condition}` : ""
        } LIMIT 1`;
    } catch (err) {
        console.error("Failed to select by primary key:", err);
        throw err;
    }
};

/**
 * SEARCH WITH INDEXES IN TABLE
 */
