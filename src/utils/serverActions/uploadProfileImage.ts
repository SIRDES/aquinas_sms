"use server";
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import { getCurrentServerUser } from "@/utils/services/serverUserAuth";
import { USER_PERMISSIONS } from "@/utils/common";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Initialize R2 S3 client using environment variables
const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
  },
});

/**
 * Upload a profile image to Cloudflare R2 and store the public URL on the student document.
 *
 * @param payload Object containing the student ID and the image File.
 * @returns Result object with success flag and image URL (if successful).
 */
export const uploadProfileImage = async (payload: { studentId: string; file: File }) => {
  // Ensure the caller has permission to update a student profile
  await getCurrentServerUser(USER_PERMISSIONS.STUDENT_UPDATE);

  const { studentId, file } = payload;

  if (!file) {
    return { success: false, message: "No file provided" } as const;
  }

  // Convert the File to a Buffer for the S3 client
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Build a unique key for the object in the bucket
  const timestamp = Date.now();
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const objectKey = `students/${studentId}/${timestamp}_${sanitizedFileName}`;

  // Upload to R2 (ACL removed as R2 does not support canned ACLs)
  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: objectKey,
        Body: buffer,
        ContentType: file.type,
      }),
    );
  } catch (err) {
    console.error("R2 upload error:", err);
    return { success: false, message: "Failed to upload image" } as const;
  }

  // Construct the public URL using your custom domain variable
  const imageUrl = `${process.env.R2_PUBLIC_URL}/${objectKey}`;

  // Update the student document with the new image URL
  try {
    await connectDB();
    await Student.findByIdAndUpdate(studentId, { profileImage: imageUrl });
    return { success: true, url: imageUrl } as const;
  } catch (err) {
    console.error("Mongo update error:", err);
    // The image is already uploaded; we still return success but note the DB update failed
    return { success: false, message: "Image uploaded but failed to save URL", url: imageUrl } as const;
  }
};