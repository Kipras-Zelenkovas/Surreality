import { defineTableCON } from "./convert/defineTableCON.js";
import { DataTypes } from "./utils/Typing/DataTypes.js";
import { selectAllCON } from "./convert/selectCON.js";
import { createCON } from "./convert/createCON.js";
import { findByPkCON } from "./convert/findByPkCON.js";
import { updateCON } from "./convert/updateCON.js";
import { deleteCON } from "./convert/deleteCON.js";
import { restoreCON } from "./convert/restoreCON.js";
import { defineIndexCON } from "./convert/defineIndexCON.js";
import { findOneCON } from "./convert/findOneCON.js";

export class Surreality {
    constructor(surreal, table) {
        this.surreal = surreal;
        this.table = table;
    }

    /**
     * @param {"SCHEMAFULL" | "SCHEMALESS"} type
     * @param {object} schema
     * @param {object} schema.field
     * @param {string} schema.field.type
     * @param {boolean} [schema.field.optional] - OPTIONAL
     * @param {string} [schema.field.table] OPTIONAL - The table the field is related to ( for RECORD type )
     * @param {boolean} [schema.field.readOnly] OPTIONAL - Whether the field is readOnly
     * @param {boolean | object} [schema.field.indexed] OPTIONAL - Whether the field is indexed
     * @param {string} [schema.field.indexed.name] OPTIONAL - The name of the index
     * @param {boolean} [schema.field.indexed.unique] OPTIONAL - Whether the index is unique
     * @param {object} [relation] - The relation object {in: "table", out: "table"} OPTIONAL
     *
     * @returns {void}
     *
     * @throws {Error}
     *
     * @description Defines a table with the given schema
     *
     * @default
     * relation = {}
     *
     */
    async defineTable(type, schema, relation = {}) {
        try {
            const queries = await defineTableCON(
                this.table,
                type,
                schema,
                relation
            );

            try {
                await this.surreal.query(queries.tableQuery);
            } catch (err) {
                if (err.message.includes("already exists")) {
                    console.log("Table already exists");
                } else {
                    console.error("Failed to define table:", err);
                    throw err;
                }
            }

            try {
                await this.surreal.query(queries.fieldsQuery.join(""));
            } catch (err) {
                console.error("Failed to define fields:", err);
                throw err;
            }

            try {
                if (queries.indexedFieldsQuery.length > 0) {
                    await this.surreal.query(
                        queries.indexedFieldsQuery.join("")
                    );
                }
            } catch (err) {
                console.error("Failed to define indexed fields:", err);
                throw err;
            }
        } catch (err) {
            console.error("Failed to define table:", err);
        }
    }

    /**
     *
     * @param {string | Array<string>} index
     * @param {Array<string>} fields
     * @param {boolean | Array<boolean>} unique
     *
     * @returns {void}
     *
     * @throws {Error}
     *
     * @description Defines an index on the table
     */
    async defineIndex(index = "", fields = [], unique = true) {
        try {
            if (index === "" || fields.length === 0) {
                throw new Error("Index and fields are required");
            }

            const query = defineIndexCON(this.table, index, fields, unique);

            if (Array.isArray(query)) {
                query.forEach(async (q) => {
                    await this.surreal.query(q);
                });
            } else {
                await this.surreal.query(query);
            }
        } catch (err) {
            console.error("Failed to define index:", err);
            throw err;
        }
    }

    /**
     * @param {object} opts - Options for the query.
     * @param {Array<string>} [opts.fields] - Fields to select from the main table.
     * @param {Array<string>} [opts.exclude] - Fields to exclude from the select.
     * @param {{fields?: {value: any, operator?: string}, operator?: string}} [opts.where] - Conditions for the where clause.
     * @param {Array<{relation: string, fields?: Array<string>, where?: {fields?: object, operator?: string}}>} [opts.include] - Include related data from other tables.
     * @param {object} [opts.orderBy] - Fields and directions to order the results by.
     * @param {Array<string>} [opts.with] - Select with indexes.
     * @param {number} [opts.limit] - Limit on the number of results.
     * @param {number} [opts.offset] - Offset for pagination.
     * @param {Array} [opts.groupBy] - Fields to group the results by.
     * @param {boolean} [opts.force] - Force the query to run select process with deleted records.
     *
     * @returns {object} - The result of the query
     *
     * @throws {Error}
     *
     * @description Selects all records from the table
     *
     * @default
     * opts.fields = []
     * opts.exclude = []
     * opts.where = {}
     * opts.include = []
     * opts.orderBy = {}
     * opts.with = []
     * opts.limit = undefined
     * opts.offset = undefined
     * opts.groupBy = []
     * opts.force = false
     */
    async selectAll(
        opts = {
            fields: [],
            exclude: [],
            where: {},
            include: [],
            orderBy: {},
            with: [],
            limit: undefined,
            offset: undefined,
            force: false,
        }
    ) {
        try {
            if (opts === undefined || Object.keys(opts).length === 0) {
                return await this.surreal.query(
                    `SELECT * FROM ${this.table} ${
                        opts?.force === true
                            ? ""
                            : `WHERE timestamps.deleted_at IS ${DataTypes.NONE}`
                    }`
                );
            } else {
                const checkedOpts = {
                    fields: opts.fields != undefined ? opts.fields : [],
                    exclude: opts.exclude != undefined ? opts.exclude : [],
                    where: opts.where != undefined ? opts.where : {},
                    include: opts.include != undefined ? opts.include : [],
                    orderBy: opts.orderBy != undefined ? opts.orderBy : {},
                    with: opts.with != undefined ? opts.with : [],
                    limit: opts.limit != undefined ? opts.limit : undefined,
                    offset: opts.offset != undefined ? opts.offset : undefined,
                    groupBy: opts.groupBy != undefined ? opts.groupBy : [],
                    force: opts.force != undefined ? opts.force : false,
                };

                const query = selectAllCON(this.table, checkedOpts);

                const res = await this.surreal.query(query);

                return res;
            }
        } catch (err) {
            console.error("Failed to select all:", err);
            throw err;
        }
    }

    async findOne(
        opts = {
            fields: [],
            exclude: [],
            where: {},
            include: [],
            with: [],
            force: false,
        }
    ) {
        try {
            const checkedOpts = {
                fields: opts.fields != undefined ? opts.fields : [],
                exclude: opts.exclude != undefined ? opts.exclude : [],
                where: opts.where != undefined ? opts.where : {},
                include: opts.include != undefined ? opts.include : [],
                with: opts.with != undefined ? opts.with : [],
                force: opts.force != undefined ? opts.force : false,
            };

            const query = findOneCON(this.table, checkedOpts);

            const res = await this.surreal.query(query);

            return res;
        } catch (err) {
            console.error("Failed to find one:", err);
            throw err;
        }
    }

    /**
     *
     * @param {Object} opts - The selectAll options
     * @param {any} opts.id - The id of the record
     * @param {Array} [opts.fields]
     * @param {Array<string>} [opts.exclude]
     * @param {{field: {value: any, operator: string} | string}} [opts.where]
     * @param {Array<{relation: string, fields: Array, where: {field: {value: any, operator: string | string}}}>} [opts.include]
     * @param {boolean} [opts.force] - Force the query to run select process with deleted records.
     *
     * @returns {object | void} - The result of the query
     *
     * @throws {Error}
     *
     * @description Finds a record by its primary key
     *
     * @default
     * opts.fields = []
     * opts.exclude = []
     * opts.where = {}
     * opts.include = []
     * opts.force = false
     *
     */
    async findByPk(
        opts = {
            id: undefined,
            fields: [],
            exclude: [],
            where: {},
            include: [],
            force: false,
        }
    ) {
        try {
            const checkedOpts = {
                id: opts.id != undefined ? opts.id : undefined,
                fields: opts.fields != undefined ? opts.fields : [],
                exclude: opts.exclude != undefined ? opts.exclude : [],
                where: opts.where != undefined ? opts.where : {},
                include: opts.include != undefined ? opts.include : [],
                force: opts.force != undefined ? opts.force : false,
            };

            const query = findByPkCON(checkedOpts);

            const res = await this.surreal.query(query);

            return res;
        } catch (err) {
            console.error("Failed to find by primary key:", err);
            throw err;
        }
    }

    /**
     * @param {{fields: any} | {fields: {data: any, as: string}}} data - The data to insert
     * @param {object} opts - The options for the insert
     * @param {any} [opts.id] - The id of the record
     * @param {number} [opts.timeout] - The timeout for the query
     * @param {Array<string>} [opts.return] - The fields to return or "NONE"
     *
     * @returns {object | void} - The result of the query
     *
     * @throws {Error}
     *
     * @description Creates a new record with the given data
     *
     * @default
     * opts.return = "NONE"
     * opts.id = undefined
     * opts.timeout = 0
     *
     */
    async create(
        data,
        opts = { return: DataTypes.NONE, id: undefined, timeout: 0 }
    ) {
        try {
            const checkedOpts = {
                return: opts.return != undefined ? opts.return : DataTypes.NONE,
                id: opts.id != undefined ? opts.id : undefined,
                timeout: opts.timeout != undefined ? opts.timeout : 0,
            };

            const query = await createCON(this.table, data, checkedOpts);

            console.log(query);
            // const res = await this.surreal.query(query);

            return res;
        } catch (err) {
            console.error("Failed to create:", err);
            throw err;
        }
    }

    /**
     *
     * @param {string} id
     * @param {{fields: any} | {fields: {data: any, as: string}}} data
     * @param {object} opts
     * @param {string | "MERGE" | "CONTENT" | "SET"} opts.type
     * @param {object} opts.where
     * @param {string | Array} opts.return
     *
     * @returns {object | void}
     *
     * @throws {Error}
     *
     * @description Updates the record with the given id with the given data
     *
     * @default
     * opts.type = "MERGE"
     * opts.where = {}
     * opts.return = "NONE"
     * opts.force = false
     */
    async update(
        id = "",
        data = {},
        opts = {
            type: "MERGE",
            where: {},
            return: DataTypes.NONE,
            force: false,
        }
    ) {
        try {
            if (Object.keys(data).length === 0) {
                throw new Error("No data to update");
            }

            const checkedId = id === "" ? this.table : id;

            const checkedOpts = {
                type: opts.type != undefined ? opts.type : "MERGE",
                where: opts.where != undefined ? opts.where : {},
                return: opts.return != undefined ? opts.return : DataTypes.NONE,
                false: opts.force != undefined ? opts.force : false,
            };

            const query = updateCON(checkedId, data, checkedOpts);

            const res = await this.surreal.query(query);

            return res;
        } catch (err) {
            console.error("Failed to update:", err);
            throw err;
        }
    }

    /**
     *
     * @param {string} id
     * @param {object} opts
     * @param {string} opts.return
     * @param {object} opts.where
     * @param {boolean} opts.force
     *
     * @returns {object | void}
     *
     * @throws {Error}
     *
     * @description Deletes the record with the given id
     *
     * @default
     * opts.return = "NONE"
     * opts.where = {}
     * opts.force = false
     */
    async delete(
        id = this.table,
        opts = { return: "NONE", where: {}, force: false }
    ) {
        try {
            const checedId = id === "" ? this.table : id;

            const checedOpts = {
                return: opts.return != undefined ? opts.return : DataTypes.NONE,
                where: opts.where != undefined ? opts.where : {},
                force: opts.force != undefined ? opts.force : false,
            };

            const query = deleteCON(checedId, checedOpts);

            const res = await this.surreal.query(query);

            return res;
        } catch (err) {
            console.error("Failed to delete:", err);
            throw err;
        }
    }

    async restore(id = this.table, opts = { return: "NONE", where: {} }) {
        try {
            const checedId = id === "" ? this.table : id;

            const checedOpts = {
                return: opts.return != undefined ? opts.return : DataTypes.NONE,
                where: opts.where != undefined ? opts.where : {},
            };

            const query = restoreCON(checedId, checedOpts);

            const res = await this.surreal.query(query);

            return res;
        } catch (err) {
            console.error("Failed to restore:", err);
            throw err;
        }
    }

    async remove(type = "INDEX", name = []) {
        try {
            if (name === "") {
                throw new Error("Index name is required");
            }

            const checkedType = type === "" ? "INDEX" : type;

            const queries = name.map((n) => {
                return `REMOVE ${checkedType} IF EXISTS ${n} ON TABLE ${this.table}`;
            });

            await this.surreal.query(queries.join(";"));
        } catch (err) {
            console.error("Failed to remove index:", err);
            throw err;
        }
    }
}
