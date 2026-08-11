import mongoose from "mongoose";


const reviewSchema = new mongoose.Schema(
{
    tokenId:{
        type:Number,
        required:true
    },

    student:{
        type:String,
        required:true
    },

    rating:{
        type:Number,
        required:true
    },

    comment:{
        type:String,
        required:true
    }

},
{
    timestamps:true
});


export default mongoose.model(
    "Review",
    reviewSchema
);