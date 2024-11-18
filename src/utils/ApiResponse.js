class ApiResponse {
    constructor(statusCode,data,message="success"){
        this.statusCode = statusCode,
        this.data = data;
        this.message = message;
        

        // Here we check if the response is a success. Anything below 400 is a win.
        this.statusCode = statusCode<400;
    }
}

export {
    ApiResponse
};