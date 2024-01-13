//node js Api Error we have inherits ApiError from Error class which is built in Node js | read more Node js Api Error doc
class ApiError extends Error{
    constructor(
        statusCode,
        message="Something went wrong",
        errors=[],//errors: An array of additional error details. It has a default empty array [].
        stack="" //stack: The stack trace associated with the error. It has a default value of an empty string "".

        

    ){
        super(message)

         // Custom properties specific to ApiError
        this.statusCode=statusCode,
        this.data=null  // Additional data field, usually set to null || read more in doc
        this.message=message
        this.success=false, // Indicating that the operation was not successful,we are handling Error thats why we make it false
        this.errors=errors

        // Stack trace handling
        if (stack){
            this.stack=stack
        }else{
            // If no custom stack is provided, capture the stack trace
            Error.captureStackTrace(this,this.constructor) // syntax is same
        }

    }

}

export {ApiError}