import { whereToSelect } from "../utils/SurrealQuering/condition.js";
import { includeToSelect } from "../utils/SurrealQuering/includes.js";
import { fieldsToSelect } from "../utils/SurrealQuering/selectFields.js";

/**
 * @param {string} table
 * @param {object} opts
 * @param {Array<string>} [opts.fields]
 * @param {Array<string>} [opts.exclude]
 * @param {{field?: {value: any, operator?: string}, operator?: string}} [opts.where]
 * @param {Array<{relation: string, fields: Array, where: {field: {value: any, operator: string | string}}}>} opts.include
 * @param {Array<string>} [opts.with]
 * @param {boolean} [opts.force]
 * @returns
 */
export const findOneCON = (table, opts = {}) => {
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
                  }timestamps.deleted_at IS NONE`);

        const withIndexes =
            opts.with.length > 0
                ? `WITH INDEX ${opts.with.join(", ")}`
                : "WITH NOINDEX";

        return `SELECT ${mainFields}${excludeFields} FROM ONLY ${table} ${withIndexes} ${
            condition != "" ? `WHERE ${condition}` : ""
        } LIMIT 1`;
    } catch (err) {
        console.error("Failed to find one record:", err);
        return false;
    }
};
