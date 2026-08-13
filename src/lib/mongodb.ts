// import mongoose from "mongoose";
// const { MONGODB_URI } = process.env;
// let connection: typeof mongoose.connection;
// export const connectDB = async () => {
//   if (connection?.readyState === 1) {
//     console.log("Connected to MongoDB");
//     return Promise.resolve(true);
//   }
//   try {
//     const mongooseInstance = await mongoose.connect(MONGODB_URI as string);
//     connection = mongooseInstance.connection;
//     if (connection?.readyState === 1) {
//       console.log("Connected to MongoDB");
//       return Promise.resolve(true);
//     }
//   } catch (error) {
//     console.error(error);
//     return Promise.reject(error);
//   }
// };


import mongoose from "mongoose";
const { MONGODB_URI } = process.env;

let connection: typeof mongoose.connection;

export const connectDB = async () => {
  if (connection?.readyState === 1) {
    console.log("Connected to MongoDB");
    return Promise.resolve(true);
  }
  try {
    // ✅ Force Mongoose to auto-create indexes
    mongoose.set("autoIndex", true);

    const mongooseInstance = await mongoose.connect(MONGODB_URI as string);
    connection = mongooseInstance.connection;

    if (connection?.readyState === 1) {
      console.log("Connected to MongoDB");
      return Promise.resolve(true);
    }
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
};

