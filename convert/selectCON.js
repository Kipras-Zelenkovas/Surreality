import { whereToSelect } from "../utils/SurrealQuering/condition.js";
import { includeToSelect } from "../utils/SurrealQuering/includes.js";
import { orderByToSelect } from "../utils/SurrealQuering/orderBy.js";
import { fieldsToSelect } from "../utils/SurrealQuering/selectFields.js";

/**
 * Converts the selectAll options to an array of strings to be used in the SQL query
 *
 * @param {string} table - The table to select from
 * @param {Object} opts - The selectAll options
 * @param {Array<string>} opts.fields - The fields to select
 * @param {Array<string>} opts.exclude - The fields to exclude
 * @param {{field: {value: any, operator: string} | string}} opts.where
 * @param {Array<{relation: string, fields: Array, where: {field: {value: any, operator: string | string}}}>} opts.include
 * @param {object} opts.orderBy
 * @param {array<string>} opts.with
 * @param {number} opts.limit
 * @param {number} opts.offset
 * @param {Array} opts.groupBy - The fields to group by
 *
 * @returns {String} - The selectAll query string
 */
export const selectAllCON = (table, opts = {}) => {
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

        const orderBy = orderByToSelect(opts.orderBy);
        const withIndexes = opts.with
            ? `WITH INDEX ${opts.with.join(", ")}`
            : "WITH NOINDEX";

        // REFACTOR group by clause
        // const groupBy = groupByToSelect(opts.groupBy);

        const limit = opts.limit ? `LIMIT ${opts.limit}` : "";
        const offset = opts.offset ? `START ${opts.offset}` : "";

        return `SELECT ${mainFields}${excludeFields} FROM ${table} ${withIndexes} ${
            condition != "" ? `WHERE ${condition}` : ""
        } ${orderBy} ${limit} ${offset}`;
    } catch (err) {
        console.error("Failed to select all:", err);
        throw err;
    }
};

/**
 * SEARCH WITH INDEXES in table
 */
