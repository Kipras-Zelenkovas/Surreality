import { whereToSelect } from "../utils/SurrealQuering/condition.js";
import { DataTypes } from "../utils/Typing/DataTypes.js";

/**
 *
 * @param {string} id
 * @param {object} opts
 * @param {string} opts.return
 * @param {object} opts.where
 * @param {boolean} opts.force
 *
 * @returns {object}
 *
 * @throws {Error}
 *
 * @description Deletes a record from the database.
 *
 * @default
 * opts.return = "NONE"
 * opts.where = {}
 * opts.force = false
 */
export const deleteCON = (id, opts) => {
    try {
        const condition =
            Object.keys(opts.where).length > 0
                ? `WHERE ${whereToSelect(opts.where)}`
                : "";

        let query = "";

        if (opts.force) {
            query = `DELETE ${id} ${condition} RETURN ${opts.return};`;
        } else {
            const date = new Date().toISOString();

            query = `UPDATE ${id} MERGE {timestamps: {deletedAt: <datetime>'${date}'}} ${condition} RETURN ${opts.return};`;
        }

        return query;
    } catch (err) {
        console.error("Failed to delete: ", err);
        throw err;
    }
};
