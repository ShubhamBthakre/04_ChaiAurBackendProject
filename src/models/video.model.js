import mongoose,{Schema} from "mongoose";
//mongoose-aggregate-paginate-v2 is a plugin for Mongoose, an ODM (Object Data Modeling) library for MongoDB and Node.js. This plugin extends Mongoose's aggregation framework with pagination support, making it easier to paginate through large sets of data when using MongoDB aggregation pipelines.
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"



const videoSchema=new Schema({
    videoFile:{
        type:String,// cloudary url
        required:true
    },
    thumbnail:{
        type:String,// cloudary url
        required:true
    },
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    duration:{
        type:Number, //we will get duration from cloudinary when we upload vedio on cloudinary
        required:true

    },
    views:{
        type:Number,
        required:true,
        default:0,

    },
    isPublished:{
        type:Boolean,
        default:true
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }

},{timestamps:true})

//this is syntax to inject plugin
videoSchema.plugin(mongooseAggregatePaginate)


export const Video=mongoose.model("Video",videoSchema)