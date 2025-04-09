const StandardResponse = (status = false, message = null, data = null, errors = null) => {
    return {
        status,
        message,
        data,
        errors
    };
};

export default StandardResponse;
