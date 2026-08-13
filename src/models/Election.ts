import mongoose, { Model, Types } from "mongoose";

export type IElection = mongoose.Document & {
    _id: string;
    name: string;
    endDate: Date;
    isDeleted: boolean;
    isSuspended: boolean;
};

const electionSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        endDate: { type: Date, required: true },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        isSuspended: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const Election: Model<IElection> =
    mongoose.models.Election || mongoose.model<IElection>("Election", electionSchema);

export default Election;
