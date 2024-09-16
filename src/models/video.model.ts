import mongoose ,{Schema ,Document ,model} from "mongoose";

interface VideoModelTypes extends Document {
    videoFile : string,
    thumbnail : string,
    title : string,
    description : string,
    duration : number,
    views: number,
    isPublished: boolean,
    owner: Schema.Types.ObjectId,
}

const VideoModelSchema = new Schema<VideoModelTypes>({
    videoFile:{
        type: String,
        required: true,
    },
    thumbnail:{
        type: String,
        required: true,
    },
    title:{
        type: String,
        required: true,
    },
    description:{
        type: String,
        required: true,
    },
    duration:{
        type: Number,
        default: 0,
    },
    views:{
        type:Number,
        default:0
    },
    isPublished:{
        type: Boolean,
        required: true,
        default: false,
    },
    owner:{
        type: Schema.Types.ObjectId,
        ref: "User",
    }
},{timestamps: true});

export const Videos = model<VideoModelTypes>("Video", VideoModelSchema);