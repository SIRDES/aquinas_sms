
"use server";

import { v2 as cloudinary } from 'cloudinary';

type CloudinaryType = {
    asset_id: string;
    public_id: string;
    version: number;
    version_id: string;
    signature: string;
    width: number;
    height: number;
    format: string;
    resource_type: string;
    created_at: string;
    tags: any[];
    bytes: number;
    type: string;
    etag: string;
    placeholder: boolean;
    url: string;
    secure_url: string;
    folder: string;
    access_mode: string;
    original_filename: string;
};

async function uploadFile({
    file,
    folder,
}: {
    file: File;
    folder: string;
}): Promise<string> {
    console.log("Inside first File upload>>>>>>>>>>>>>>>>>>>")
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    try {
        console.log("Inside first File upload>>>>>>>>>>>>>>>>>>>")
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        console.log("Before File upload>>>>>>>>>>>>>>>>>>>")
        const response = await new Promise((resolve, reject) => {
            console.log("Before inside promise File upload>>>>>>>>>>>>>>>>>>>")
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
                    public_id: `admission/${new Date().getFullYear()}/${folder}/${Date.now()}_${file.name?.replace(/\s+/g, '')}`,
                },
                function (error, result) {
                    console.log("Inside promise File upload error>>>>>>>>>>>>>>>>>>>")
                    if (error) return reject(error);
                    console.log("Inside promise File upload result>>>>>>>>>>>>>>>>>>>")

                    resolve(result as unknown as CloudinaryType);
                }
            );

            uploadStream.end(buffer);
        });

        return (response as CloudinaryType).secure_url;
    } catch (error: any) {
        console.log("upload error", error);
        // throw new Error(error.message || "Upload failed");
        return error.message || "Upload failed";
    }
}

export const deleteFile = async (url: string) => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    try {
        const baseMatch = url.match(/^https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/v\d+\//);
        console.log("baseMatch", baseMatch);
        const base = baseMatch ? baseMatch[0] : '';
        const publicId = url.replace(base, '').slice(0, -4);
        console.log("publicId", publicId);
        const res = await cloudinary.uploader.destroy(publicId);
        return res.result;
    } catch (error: any) {
        console.error("delete error", error);
        return
    }
};

export default uploadFile;
