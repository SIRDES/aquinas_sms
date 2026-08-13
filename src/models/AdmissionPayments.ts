import mongoose, { Model, Types } from "mongoose";

export type IAdmissionPayment = mongoose.Document & {
    _id: string;
    responseMessage?: string;
    paystackPaymentReference?: string;
    status: string;
    beceIndexNumber: string;
    hashedBeceIndexNumber: string;
    admissionId: Types.ObjectId;
    placedStudentId: Types.ObjectId;
    parentPhoneNumber: string;
    msisdn: string;
    network: string;
    isDeleted: boolean;
    isSuspended: boolean;
};

const admissionPaymentSchema = new mongoose.Schema(
    {
        paystackPaymentReference: { type: String, default: null },
        responseMessage: { type: String, default: null },
        beceIndexNumber: { type: String, required: true },
        hashedBeceIndexNumber: { type: String, required: true },
        placedStudentId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "PlacedStudent" },
        status: { type: String, require: true },
        admissionId: { type: Types.ObjectId, required: true, ref: "Admission" },
        parentPhoneNumber: { type: String, required: true },
        msisdn: { type: String, required: true },
        network: { type: String, required: true },
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

const AdmissionPayment: Model<IAdmissionPayment> =
    mongoose.models.AdmissionPayment ||
    mongoose.model<IAdmissionPayment>(
        "AdmissionPayment",
        admissionPaymentSchema
    );

export default AdmissionPayment;
