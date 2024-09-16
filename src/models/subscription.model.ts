import {Schema ,Document  ,model} from "mongoose";


interface SubscriptionTypes extends Document {
    subscriber: Schema.Types.ObjectId;
    channel: Schema.Types.ObjectId;
}

const SubscriptionSchema = new Schema<SubscriptionTypes> ({
        subscriber:{
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        channel:{
            type: Schema.Types.ObjectId,
            ref: "User",
        }

    } ,
    {timestamps:true});



export const Subscription = model<SubscriptionTypes>("Subscription",SubscriptionSchema);