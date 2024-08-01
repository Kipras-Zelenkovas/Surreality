import { casting } from "../Typing/casting.js";

/**
 *  Converts the where object to a string to be used in the SQL query
 *
 *  @param {Object} where - The where object
 *  @param {{value: any, operator: string} | String | Number | Object | Array | Boolean} where.field - The field to select
 *  @param {String} relation - The relation of the table
 *
 *  @returns {String} - The where string
 */
export const whereToSelect = (where = {}, relation = "") => {
    try {
        if (Object.keys(where).length === 0) {
            return "";
        }

        const keys = Object.keys(where);
        const conditions = keys.map((key) => {
            if (typeof where[key] !== "object") {
                const val = casting(where[key]);
                return `${relation != "" ? relation + "." : ""}${key} = ${val}`;
            } else {
                const val = casting(where[key].value);
                return `${relation != "" ? relation + "." : ""}${key} ${
                    where[key].operator != undefined ? where[key].operator : "="
                } ${val}`;
            }
        });
        return conditions.join(
            `${where.operator ? ` ${where.operator} ` : " AND "}`
        );
    } catch (err) {
        console.error("Failed to select where:", err);
        throw err;
    }
};
