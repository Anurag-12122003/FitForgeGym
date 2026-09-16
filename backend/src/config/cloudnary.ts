import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import streamifier from 'streamifier';

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error(
    'Missing Cloudinary environment variables. Please check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.'
  );
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

// Memory storage
const storage = multer.memoryStorage();

export const upload = multer({
  storage,

  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },

  fileFilter: (_req, file, cb) => {
    if (
      file.mimetype.startsWith('image/') ||
      file.mimetype.startsWith('video/')
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed.'));
    }
  },
});

export const uploadToCloudinary = (
  buffer: Buffer,
  folder: string,
  mimetype: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const resourceType = mimetype.startsWith('video/')
      ? 'video'
      : 'image';

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `fitforge/${folder}`,
        resource_type: resourceType,
      },

      (error, result) => {
        if (error || !result) {
          return reject(error || new Error('Upload failed'));
        }

        resolve(result.secure_url);
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};
