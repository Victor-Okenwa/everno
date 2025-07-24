import mongoose, {
  type HydratedDocument,
  Schema,
  type SchemaDefinition,
  type Types,
  type Model,
} from "mongoose";

// Define the schema structure explicitly
interface UserSchemaDefinition {
  name: string;
  email: string;
  password?: string;
  theme: string;
  role?: string; // Optional role
  isVerified: boolean;
  links: {name: string}[];
  createdAt: Date;
  updatedAt: Date;
}

// Define the User interface for the transformed document
export interface User extends UserSchemaDefinition {
  id?: string; // Optional id for transformed output
  _id?: Types.ObjectId; // Optional _id for transform
  __v?: number; // Optional __v for transform
  password?: string; // Optional password for transform
}

// Define the User document type
export type UserDocument = HydratedDocument<User>;

// Define the schema with explicit typing
const userSchema: Schema<User> = new Schema<User>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    theme: {
      type: String,
      default: "system",
    },
    links: {
      type: [
        {
          name: { type: String, required: true },
        },
      ],
      default: [],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  } as SchemaDefinition<User>,
  {
    toJSON: {
      transform: (
        _,
        ret: User & { _id?: Types.ObjectId; __v?: number; password?: string },
      ) => {
        if (ret._id) {
          ret.id = ret._id.toString();
          delete ret._id;
        }
        if (ret.__v !== undefined) {
          delete ret.__v;
        }
        if (ret.password) {
          delete ret.password;
        }
      },
    },
    toObject: {
      transform: (
        _,
        ret: User & { _id?: Types.ObjectId; __v?: number; password?: string },
      ) => {
        if (ret._id) {
          ret.id = ret._id.toString();
          delete ret._id;
        }
        if (ret.__v !== undefined) {
          delete ret.__v;
        }
        if (ret.password) {
          delete ret.password;
        }
      },
    },
    timestamps: true,
  },
);

// Ensure the model is created only once using a factory function
const createUserModel = (): Model<User> => {
  // Check if the model already exists to avoid redefinition
  if (mongoose.models.User) {
    return mongoose.models.User as Model<User>;
  }
  return mongoose.model<User>("User", userSchema);
};

// Export the model
export const UserModel = createUserModel();
export default UserModel;
