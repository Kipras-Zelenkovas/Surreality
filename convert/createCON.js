import { casting } from "../utils/Typing/casting.js";

const dataToCreate = (data) => {
    try {
        // DTC - data to create
        let DTC = "";
        for (const key in data) {
            const casted = casting(data[key]);
            DTC += `${key}=${casted}, `;
        }

        return DTC;
    } catch (err) {
        console.error("Failed to insert data:", err);
        throw err;
    }
};

/**
 *
 * @param {*} table
 * @param {*} data
 * @param {*} opts
 * @returns
 */
export const createCON = async (table, data, opts) => {
    try {
        const DTC = dataToCreate(data).slice(0, -2);

        const creation_date = new Date();

        const toReturn = Array.isArray(opts.return)
            ? opts.return.join(",")
            : opts.return;

        const query = `CREATE ${
            opts.id != undefined ? `${opts.id}` : table
        } SET ${DTC} RETURN ${toReturn} ${
            opts.timeout != 0 ? `TIMEOUT ${opts.timeout}ms` : ""
        }`;

        return query;
    } catch (err) {
        console.error("Failed to create:", err);
        throw err;
    }
};

/**
 * CREATE INDEXES ON tables
 */
