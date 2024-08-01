const groupByToSelect = (groupBy = []) => {
    try {
        if (groupBy.length === 0) {
            return "";
        } else {
            return `GROUP BY ${groupBy.join(", ")}`;
        }
    } catch (err) {
        console.error("Failed to select groupBy:", err);
        throw err;
    }
};
