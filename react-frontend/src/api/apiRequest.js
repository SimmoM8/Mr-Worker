export const apiRequest = async (table, action, data = {}, conditions = {}, options = {}) => {
    const callerStack = new Error().stack.split("\n")[2]?.trim() || "unknown location";
    try {
        const response = await fetch('/api/api.php', {
            method: 'POST',
            body: JSON.stringify({
                table,
                action,
                data,
                conditions,
                ...options
            }),
            headers: { 'Content-Type': 'application/json' }
        });

        const result = await response.json();
        if (!result.success) {
            console.error(`API Error: ${result.message} (called from ${callerStack})`);
        }
        return result;
    } catch (error) {
        console.error("API Request Failed:", error);
        return { success: false, message: "Network error." };
    }
};