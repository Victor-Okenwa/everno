import mongoose, { type Model, Schema, type Document } from "mongoose";

interface OtpSchemaDefinition {
  email: string;
  otp: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface OtpDocument extends Document, OtpSchemaDefinition {}

const OtpSchema = new Schema<OtpDocument>({
  email: { type: String, required: true, index: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Optional: Add an index to remove expired OTPs automatically
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const createOtpModel = (): Model<OtpDocument> => {
  // Check if the model already exists to avoid redefinition
  if (mongoose.models.Otp) {
    return mongoose.models.Otp as Model<OtpDocument>;
  }
  return mongoose.model<OtpDocument>("Otp", OtpSchema);
};

const OtpModel = createOtpModel();
export default OtpModel;
