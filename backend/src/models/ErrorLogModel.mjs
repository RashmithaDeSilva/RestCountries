class ErrorLogModel {

    constructor (location, message, stack, requestData) {
        this.location = location;
        this.message = message;
        this.stack = stack;
        this.requestData = requestData;
    }
}

export default ErrorLogModel;
