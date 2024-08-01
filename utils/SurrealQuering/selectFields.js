/**
 *
 * @param {Array<string>} fields
 * @param {string | null} relation
 * @returns
 */
export const fieldsToSelect = (fields = [], relation = null) => {
    try {
        if (fields.length === 0) {
            return relation != null ? `${relation}.*` : "*";
        } else {
            if (relation != null) {
                return fields.map((field) => `${relation}.${field}`);
            } else {
                return fields.join(", ");
            }
        }
    } catch (err) {
        console.error("Failed to select fields:", err);
        throw err;
    }
};
