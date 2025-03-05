class StandardResponse {
    static newStandardResponse(status = false, messesge = null, data = null, error = null) {
        return {
            "status": status,
            "messesge": messesge,
            "data": data,
            "error": error
        };
    };
}

export default StandardResponse;