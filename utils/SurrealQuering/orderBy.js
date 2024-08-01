/**
 *   Converts the orderBy object to a string to be used in the SQL query
 *   @param {{field: "ASC" | "DESC"}} orderBy - The orderBy object
 *
 *   @returns {String} - The orderBy string
 */
export const orderByToSelect = (orderBy = {}) => {
    try {
        if (Object.keys(orderBy).length === 0) {
            return "";
        }

        const keys = Object.keys(orderBy);
        const conditions = keys.map((key) => {
            return `${key} ${orderBy[key]}`;
        });
        return "ORDER BY " + conditions.join(", ");
    } catch (err) {
        console.error("Failed to select orderBy:", err);
        throw err;
    }
};
