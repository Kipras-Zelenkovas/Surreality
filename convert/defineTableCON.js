/**
    This function is used to define a table in the database.
    @param {string} table   - The name of the table
    @param {string} type    - The type of the table
    @param {object} schema  - The schema of the table
    @param {object} schema.field - The field of the table
    @param {string} schema.field.type - The type of the field
    @param {boolean} [schema.field.optional] - The optional of the field OPTIONAL
    @param {string} [schema.field.table] - The table of the field OPTIONAL ( ONLY on record type )
    @param {boolean} [schema.field.readOnly] - The readOnly of the field OPTIONAL
    @param {boolean} [schema.field.indexed] - The indexed of the field OPTIONAL
    @param {string} [schema.field.indexed.name] - The name of the index OPTIONAL
    @param {boolean} [schema.field.indexed.unique] - The unique of the index OPTIONAL
    @param {object} [relation]- The relation of the table OPTIONAL

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
         * If the schema is an array, the field is defined as a any type that is specified as dataType.
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
                            : `${schema[field].type}<${schema[field].table}>`
                    }${schema[field].readOnly === true ? " READONLY" : ""};`;
                } else if (schema[field].type === "array") {
                    let dataType =
                        schema[field].dataType === "record"
                            ? "record<" + schema[field].table + ">"
                            : schema[field].dataType;

                    return `DEFINE FIELD ${field} ON TABLE ${table} TYPE ${
                        schema[field].optional === true ? "option<" : ""
                    }array<${dataType}>${
                        schema[field].optional === true ? ">" : ""
                    };`;
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
         * The indexFields is an array of strings that represent the fields that are indexed.
         * The fields are defined based on the schema provided.
         *
         * 2 main ways of defining index fields:
         * 1. Schema has one property with the indexed of the field. Example: {name: { indexed: true }}
         * 2. Schema has one property with the indexed of the field as an object. Example: {name: { indexed: { name: "name_index", unique: true }}}
         *
         * The indexFields are defined as UNIQUE by default.
         * If the indexed field is not unique, the unique property should be set to false.
         *
         */
        let indexFields = [];
        Object.keys(schema).forEach((field) => {
            if (schema[field].indexed === true) {
                indexFields.push(
                    `DEFINE INDEX ${field}_index ON TABLE ${table} COLUMNS ${field} UNIQUE;`
                );
            } else if (typeof schema[field].indexed === "object") {
                indexFields.push(
                    `DEFINE INDEX ${
                        schema[field].indexed.name
                    } ON TABLE ${table} COLUMNS ${field} ${
                        schema[field].indexed.unique ? "UNIQUE" : ""
                    };`
                );
            } else {
            }
        });

        /*
         * Add timestamp fields to the table if the schema does not have them as object
         */
        fieldsQuery.push(
            `DEFINE FIELD timestamps ON role FLEXIBLE TYPE object DEFAULT {} PERMISSIONS FULL;`
        );
        fieldsQuery.push(
            `DEFINE FIELD timestamps.created_at ON TABLE ${table} TYPE datetime VALUE time::now() READONLY;`
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
            indexedFieldsQuery: indexFields,
        };
    } catch (err) {
        console.error("Failed to define table:", err);
        throw err;
    }
};
