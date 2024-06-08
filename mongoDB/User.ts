import mongoose, { Document, Model, Schema } from 'mongoose';

interface IUser extends Document {
  organizationCode: number;
  organizationName: string;
  password: string;
}

const userSchema = new Schema<IUser>({
  organizationCode: { type: Number, required: true, unique: true },
  organizationName: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;
