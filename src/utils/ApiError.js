//node js Api Error we have inherits ApiError from Error class which is built in Node js | read more Node js Api Error doc
class ApiError extends Error{
    constructor(
        statusCode,
        message="Something went wrong",
        errors=[],
        stack=""
    ){

        super(message)
        this.statusCode=statusCode,
        this.data=null // usually we make data field null || read more in doc
        this.message=message
        this.success=false, // we are handling Error thats why we make it false
        this.errors=errors

        if (stack){
            this.stack=stack
        }else{
            Error.captureStackTrace(this,this.constructor) // syntax is same
        }

    }

}

export {ApiError}