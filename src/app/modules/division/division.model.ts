import { model, Schema } from "mongoose";
import { IDivision } from "./division.interface";

const divisionSchema = new Schema<IDivision>(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, unique: true },
    thumbnail: { type: String },
    description: { type: String },
  },
  {
    timestamps: true,
  }
);

// divisionSchema.pre("save", async function (next){

//   if(this.isModified("name")){

//   }


//   next()
// })





export const Division = model<IDivision>("Division", divisionSchema);

/**
 * ✅ What happens in MongoDB

Model name: User

Collection name created in MongoDB: users

👉 Mongoose:

converts to lowercase

pluralizes the model name
*/















