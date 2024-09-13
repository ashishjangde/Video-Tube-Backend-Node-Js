class ApiError extends Error {
    statusCode: number;
    errors: any[];
    stackTrace: string;
    data: null;
    success: boolean;

    constructor(
        statusCode: number,
        message: string = "Something went wrong, try again later",
        errors: any[] = [],
        stackTrace: string = ""
    ) {
        super(message);
        this.data = null;
        this.success = false;
        this.statusCode = statusCode;
        this.errors = errors;
        this.stackTrace = stackTrace;


        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export default ApiError;

