import { whereToSelect } from "./condition.js";
import { fieldsToSelect } from "./selectFields.js";

/**
    Converts the include object to a string to be used in the SQL query
    Example:
    include = [
        {
            relation: "table2",
            fields: ["id", "name"],
            where: {
                fields: {
                    id: 1,
                    name: "John",
                },
                operator: "OR",
            },
            include: [
                {
                    relation: "table3",
                    fields: ["id", "name"],
                    where: {
                        fields: {
                            id: 1,
                            name: "John",
                        },
                        operator: "OR",
                    },
                    include: [],
                },
            ],
        },
    ]
    @param {Object} include - The include object
    @param {Array} parents - The parent relations
    @returns {String} - The include string
*/
const includeRawQ = (include = [], parents = []) => {
    try {
        return include.map((inc) => {
            const parent = parents.join(".");
            const relation =
                parent.length > 0 ? `${parent}.${inc.relation}` : inc.relation;
            const mainFields = inc?.fields
                ? fieldsToSelect(inc.fields, relation)
                : [`${relation}.*`];
            const condition = whereToSelect(
                inc.where,
                parents.length > 0 ? relation : inc.relation
            );
            const include = includeRawQ(inc.include, [
                ...parents,
                inc.relation,
            ]);

            return {
                fields: mainFields,
                where: condition,
                include: include,
            };
        });
    } catch (err) {
        console.error("Failed to select include:", err);
        throw err;
    }
};

/**
 *
 * @param {Array<object>} include
 * @returns
 */
export const includeToSelect = (include = []) => {
    try {
        const rawInclude = includeRawQ(include);
        const combinedFields = new Set();
        const combinedWhere = [];

        const processQuery = (inc) => {
            if (inc.fields) {
                inc.fields.forEach((field) => combinedFields.add(" " + field));
            }

            if (inc.where) {
                combinedWhere.push(inc.where);
            }

            if (inc.include) {
                inc.include.forEach((includeQuery) =>
                    processQuery(includeQuery)
                );
            }
        };

        rawInclude.forEach((inc) => processQuery(inc));

        const uniqueFields = Array.from(combinedFields);

        const condition = combinedWhere
            .reduce((prev, curr) => {
                prev +=
                    curr.includes("OR") || curr.includes("AND")
                        ? `(${curr}) AND `
                        : curr + " AND ";

                return prev;
            }, "")
            .slice(0, -5);

        return {
            fields: uniqueFields,
            where: condition,
        };
    } catch (err) {
        console.error("Failed to select include fields:", err);
        throw err;
    }
};
