import { whereToSelect } from "../utils/SurrealQuering/condition.js";
import { DataTypes } from "../utils/Typing/DataTypes.js";

export const restoreCON = (id, opts) => {
    try {
        const condition =
            Object.keys(opts.where).length > 0
                ? `WHERE ${whereToSelect(opts.where)}`
                : "";

        const query = `UPDATE ${id} MERGE {timestamps: {deletedAt: ${DataTypes.NONE}}} ${condition} RETURN ${opts.return};`;

        return query;
    } catch (err) {
        console.error("Failed to delete: ", err);
        throw err;
    }
};
