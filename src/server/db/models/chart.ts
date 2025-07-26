import mongoose, {
  type Model,
  Schema,
  type Document,
  type Types,
  Mongoose,
} from "mongoose";
import type { Chart } from "../zod-schemas/chart";

interface ChartDocument extends Omit<Chart, "_id">, Document {}

const ChartColumnSchema = new Schema(
  {
    name: { type: String, required: true },
    color: { type: String, required: true },
    type: { type: String, enum: ["string", "number"], default: "string" },
  },
  { _id: false },
);

const chartSchema = new Schema<ChartDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 100,
      index: true,
    },
    description: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 500,
    },
    type: {
      type: String,
      required: true,
      enum: ["bar", "area", "line", "pie", "donut", "histogram"],
      index: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    group: {
      type: String,
      required: true,
      index: true,
    },
    chartData: {
      columns: [ChartColumnSchema],
      data: [{ type: Schema.Types.Mixed }], // Flexible schema for dynamic data
    },
    isPublic: {
      type: Boolean,
      default: false,
      index: true,
    },
    tags: [{ type: String }],
    metadata: {
      totalRows: Number,
      totalColumns: Number,
      dataSize: Number,
      lastModified: Date,
    },
  },
  {
    toJSON: {
      transform: (_, ret: { id: string; _id?: Types.ObjectId; __v?: number }) => {
        if (ret._id) {
          ret.id = ret._id.toString();
          delete ret._id;
        }
        if (ret.__v !== undefined) {
          delete ret.__v;
        }
      },
    },
    toObject: {
      transform: (
        _,
        ret: { id: string; _id?: Types.ObjectId; __v?: number },
      ) => {
        if (ret._id) {
          ret.id = ret._id.toString();
          delete ret._id;
        }
        if (ret.__v !== undefined) {
          delete ret.__v;
        }
      },
    },
    timestamps: true,
    // collection: "charts",
  },
);

const createChartModel = (): Model<ChartDocument> => {
  // Check if the model already exists to avoid redefinition
  if (mongoose.models.Chart) {
    return mongoose.models.Chart as Model<ChartDocument>;
  }
  return mongoose.model<ChartDocument>("Chart", chartSchema);
};

const ChartModel = createChartModel();
export default ChartModel;
