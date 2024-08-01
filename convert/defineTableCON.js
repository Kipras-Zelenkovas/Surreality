/**
    This function is used to define a table in the database.
    @param {string} table   - The name of the table
    @param {string} type    - The type of the table
    @param {object} schema  - The schema of the table
    @param {object} schema.field - The field of the table
    @param {string} schema.field.type - The type of the field
    @param {boolean} schema.field.optional - The optional of the field OPTIONAL
    @param {object} relation- The relation of the table OPTIONAL
    @returns {object}       - The table query and the fields query
*/

export const defineTableCON = async (table, type, schema, relation = {}) => {
    try {
        const relationQuery =
            Object.keys(relation).length > 0
                ? ` TYPE RELATION FROM ${relation.in} TO ${relation.out}`
                : "";

        const tableQuery = `DEFINE TABLE IF NOT EXISTS ${table} ${type} ${relationQuery};`;

        /*
         * The fieldsQuery is an array of strings that represent the fields of the table.
         * The fields are defined based on the schema provided.
         * If the schema is an object, the field is defined as a flexible type ALWAYS.
         * If the schema is an array, the field is defined as a any TYPE ALWAYS.
         *
         * 2 main ways of defininf fields:
         * 1. Schema has one property with the type of the field. Example: {name: DataTypes.STRING}
         * 2. Schema has multiple properties with the type of the field.
         * Example: {name: { type: DataTypes.STRING, optional: true, readOnly: true }}
         * Example on relations: {user: { type: DataTypes.RECORD, table: "users" }}
         *
         */
        let fieldsQuery = Object.keys(schema).map((field) => {
            if (typeof schema[field] !== "object") {
                return schema[field] === "object"
                    ? `DEFINE FIELD ${field} ON TABLE ${table} FLEXIBLE TYPE ${schema[field]};`
                    : `DEFINE FIELD ${field} ON TABLE ${table} TYPE ${schema[field]};`;
            } else {
                if (schema[field].type === "record") {
                    return `DEFINE FIELD ${field} ON TABLE ${table} TYPE ${
                        schema[field].optional === true
                            ? "option<record<" + schema[field].table + ">>"
                            : schema[field].type
                    }${schema[field].readOnly === true ? " READONLY" : ""};`;
                } else {
                    return `DEFINE FIELD ${field} ON TABLE ${table}${
                        schema[field].type === "object" ? " FLEXIBLE" : ""
                    } TYPE ${
                        schema[field].optional === true
                            ? "option<" + schema[field].type + ">"
                            : schema[field].type
                    }${schema[field].readOnly === true ? " READONLY" : ""};`;
                }
            }
        });

        /*
         * Add timestamp fields to the table if the schema does not have them as object
         */
        fieldsQuery.push(
            `DEFINE FIELD timestamps ON TABLE ${table} FLEXIBLE TYPE option<object>;`
        );
        fieldsQuery.push(
            `DEFINE FIELD timestamps.created_at ON TABLE ${table} TYPE option<datetime> VALUE time::now() READONLY;`
        );
        fieldsQuery.push(
            `DEFINE FIELD timestamps.updated_at ON TABLE ${table} TYPE datetime VALUE time::now();`
        );
        fieldsQuery.push(
            `DEFINE FIELD timestamps.deleted_at ON TABLE ${table} TYPE option<datetime>;`
        );

        return {
            tableQuery: tableQuery,
            fieldsQuery: fieldsQuery,
        };
    } catch (err) {
        console.error("Failed to define table:", err);
        throw err;
    }
};
