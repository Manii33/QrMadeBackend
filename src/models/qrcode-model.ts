import mongoose, {Schema} from "mongoose";

export interface IQRCode extends mongoose.Document {
  title : string,
  originalUrl : string,
  shortCode : string ,
  scanCount : number ,
  isActive : boolean,
  userId: mongoose.Types.ObjectId;
} 


const qrCodeSchema: Schema<IQRCode> = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
 
    originalUrl: {
      type: String,
      required: true,
    },

    shortCode: {
      type: String,
      required: true,
      unique: true,
    },

    scanCount: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const QRCode = mongoose.model<IQRCode>("QRCode", qrCodeSchema);