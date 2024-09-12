class ApiResponse {
    statusCode: number;
    data: any;
    message: string;
    success: boolean;

    constructor(
        statusCode: number,
        data: any = null,  // Allow any type of data
        message: string = "Success",
        success: boolean = true
    ) {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = success;
    }
}

export default ApiResponse;
