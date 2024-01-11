//these are rapper function for async and await

//const asyncHandler=()=>{}  normal async function
//const asyncHandler=(func)=>{()=>{}}  //we are taking function as paramter and passing it to the next function like High Order function
//const asyncHandler=(func)=>()={} //remove extra curly bracket
//const asyncHandler=()=>async()={} //make it async

//Approach-1
// const asyncHandler = (fn) => async (req, res, next) => {
//   try {
//     await fn(req, res, next);
//   } catch (error) {
//     res.status(error.code || 500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

//Approach-2
const asyncHandler=(requestHandler)=>{return (req,res,next)=>{
    Promise.resolve(requestHandler(req,res,next)).catch((err)=>next(err))
}}

export { asyncHandler };
