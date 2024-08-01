import { Surreal } from "surrealdb.js";
import { casting } from "./utils/Typing/casting.js";

export class SurrealityManager {
    /**
     *
     * @param {string} url
     * @param {string} nameSpace
     * @param {string} database
     * @param {string} username
     * @param {string} password
     *
     * Default values:
     * url: "http://localhost:8080"
     * nameSpace: "surrealism"
     * database: "surrealism"
     * username: "rrr" -> The default username for the database user
     * password: "rrr" -> The default password for the database user
     *
     *
     * @return {void}
     *
     * @description
     * This class is used to manage the SurrealDB connection and operations.
     */
    constructor(url, nameSpace, database, username, password) {
        this.surreal;
        this.config = {
            url: url != undefined ? url : "http://localhost:8080",
            nameSpace: nameSpace != undefined ? nameSpace : "surrealism",
            database: database != undefined ? database : "surrealism",
            username: username != undefined ? username : "rrr",
            password: password != undefined ? username : "rrr",
        };
    }

    /**
     * @return {void}
     *
     * @description
     * This function is used to connect to SurrealDB using the provided configuration.
     * It will throw an error if the connection fails.
     * SurrealDB will be stored in the class instance for further operations.
     * SurrealDB will be connected to the provided URL, namespace, database, username, and password.
     * SurrealDB will be connected to the default namespace and database if not provided.
     * SurrealDB will be connected to the default username and password if not provided.
     * SurrealDB will be connected to the default URL if not provided.
     */
    async connect() {
        try {
            const db = new Surreal();
            await db.connect(this.config.url, {
                namespace: this.config.nameSpace,
                database: this.config.database,
                auth: {
                    username: this.config.username,
                    password: this.config.password,
                    namespace: this.config.nameSpace,
                    database: this.config.database,
                },
            });

            this.surreal = db;
        } catch (err) {
            console.error("Failed to connect to SurrealDB:", err);
            throw err;
        }
    }

    /**
     *
     * @param {string} type
     * @param {object} opts
     * @param {string} opts.on
     * @param {string | array<string>} opts.name
     *
     * @return {void}
     *
     * @throws {Error}
     *
     * @description
     * This function is used to remove data from SurrealDB based on the type and options provided.
     * Function only work on dedicated database or namespace.
     * Allowed types are: DATABASE, NAMESPACE, USER, ACCESS, EVENT, FIELD, INDEX, ANALYZER, FUNCTION, PARAM, TABLE
     * On is required for USER, ACCESS, EVENT, FIELD, INDEX -> Can be table name or DATABASE or NAMESPACE
     * Name is required for USER, ACCESS, EVENT, FIELD, INDEX, ANALYZER, FUNCTION, PARAM, TABLE -> Can be string or array of strings ( only for FIELD and INDEX and EVENT )
     */
    async remove(type = "", opts = { on: "", name: "" }) {
        try {
            if (type === "") {
                throw new Error(
                    "Type is required to remove data from SurrealDB"
                );
            }

            if (type === "DATABASE" || type === "NAMESPACE") {
                await this.surreal.query(
                    `REMOVE ${type} IF EXISTS ${
                        type === "DATABASE"
                            ? this.config.database
                            : this.config.nameSpace
                    }`
                );
            } else if (type === "USER" || type === "ACCESS") {
                if (opts.on === "" || opts.name === "") {
                    throw new Error(
                        "Name and On are required to remove user or access from SurrealDB"
                    );
                }

                await this.surreal.query(`
                    REMOVE ${type} IF EXISTS ${opts.name} ON ${opts.on}    
                `);
            } else if (
                type === "EVENT" ||
                type === "FIELD" ||
                type === "INDEX"
            ) {
                if (opts.on === "" || opts.name === "") {
                    throw new Error(
                        "Name and On are required to remove field or index from SurrealDB"
                    );
                }

                let queries = [];

                opts.name.forEach((nameL) => {
                    queries.push(
                        `REMOVE ${type} IF EXISTS ${nameL} ON TABLE ${opts.on}`
                    );
                });

                await this.surreal.query(queries.join(";"));
            } else if (
                type === "ANALYZER" ||
                type === "FUNCTION" ||
                type === "PARAM" ||
                type === "TABLE"
            ) {
                if (opts.name === "") {
                    throw new Error(
                        "Name is required to remove table, analyzer, function, or param from SurrealDB"
                    );
                }

                await this.surreal.query(
                    `REMOVE ${type} IF EXISTS ${opts.name}`
                );
            } else {
                throw new Error("Invalid type to remove data from SurrealDB");
            }
        } catch (err) {
            console.log("Failed to remove data from SurrealDB:", err);
            throw err;
        }
    }

    /**
     *
     * @param {string} name
     * @param {any} value
     *
     * @return {void}
     *
     * @throws {Error}
     *
     * @description
     * This function is used to define a param in SurrealDB.
     * Name and value are required to define a param.
     * Value will be casted to the appropriate type before defining.
     * Param will only be defined if it does not exist.
     * Param will be defined in the current namespace and database
     */
    async defineParam(name = "", value = "") {
        try {
            if (name === "" || value === "") {
                throw new Error(
                    "Name and value are required to define param in SurrealDB"
                );
            }

            const castedValue = casting(value);

            await this.surreal.query(
                `DEFINE PARAM IF NOT EXISTS $${name} VALUE ${castedValue}`
            );
        } catch (err) {
            console.error("Failed to define param in SurrealDB:", err);
            throw err;
        }
    }

    /**
     *
     * @param {string} name
     * @param {any} value
     *
     * @return {void}
     *
     * @throws {Error}
     *
     * @description
     * This function is used to update a param in SurrealDB.
     * Name and value are required to update a param.
     * Value will be casted to the appropriate type before updating.
     * Param will only be updated if it exists.
     * Param will be updated in the current namespace and database
     */
    async updateParam(name = "", value = "") {
        try {
            if (
                name === "" ||
                value === "" ||
                value === undefined ||
                name === undefined
            ) {
                throw new Error(
                    "Name and value are required to update param in SurrealDB"
                );
            }

            const castedValue = casting(value);

            await this.surreal.query(
                `DEFINE PARAM $${name} VALUE ${castedValue}`
            );
        } catch (err) {
            console.error("Failed to update param in SurrealDB:", err);
            throw err;
        }
    }

    /**
     *
     * @param {string} name
     *
     * @returns {any}
     *
     * @throws {Error}
     *
     * @description
     * This function is used to get a param from SurrealDB.
     * Name is required to get a param.
     * Param will be returned if it exists.
     * Param will be returned in the current namespace and database
     */
    async getParam(name) {
        try {
            if (name === "") {
                throw new Error("Name is required to get param from SurrealDB");
            }

            const res = await this.surreal.query(`RETURN $${name}`);

            return res;
        } catch (err) {
            console.error("Failed to get param from SurrealDB:", err);
            throw err;
        }
    }

    /**
     * @return {void}
     *
     * @throws {Error}
     *
     * @description
     * This function is used to close the SurrealDB connection.
     * It will throw an error if the connection fails to close.
     */
    async close() {
        try {
            await this.surreal.close();
        } catch (err) {
            console.error("Failed to close SurrealDB connection:", err);
            throw err;
        }
    }

    /**
     * @return {Surreal}
     *
     * @description
     * This function is used to get the SurrealDB instance.
     */
    getSurreal = () => {
        return this.surreal;
    };
}
