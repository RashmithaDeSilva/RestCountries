class Response {
    constructor () {
    }

    static StandardResponse(status = false, messesge = null, data = null, errors = null) {
        return {
            "status": status,
            "messesge": messesge,
            "data": data,
            "errors": errors
        };
    };
}

export default Response;