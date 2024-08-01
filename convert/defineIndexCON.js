export const defineIndexCON = (table, indexes, fields, unique) => {
    try {
        if (typeof indexes === "string") {
            return `DEFINE INDEX ${indexes} ON ${table} COLUMNS ${fields.join(
                ", "
            )} ${unique ? "UNIQUE" : ""};`;
        } else if (Array.isArray(indexes)) {
            return indexes.map((index, i) => {
                return `DEFINE INDEX ${index} ON ${table} COLUMNS ${
                    fields[i]
                } ${
                    Array.isArray(unique)
                        ? unique[i] || unique[i] === undefined
                            ? "UNIQUE"
                            : ""
                        : unique
                        ? "UNIQUE"
                        : ""
                };`;
            });
        } else {
            throw new Error("Indexes must be a string or an array of strings");
        }
    } catch (err) {
        console.error("Failed to define index: " + err);
        throw err;
    }
};
