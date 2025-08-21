// import multer from 'multer';
// import { v2 as cloudinary } from 'cloudinary';
// import { CloudinaryStorage } from 'multer-storage-cloudinary';
// import dotenv from 'dotenv';

// dotenv.config();

// // ✅ Cloudinary Config
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key:    process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // ✅ General-purpose storage generator
// const createStorage = (folder, allowedFormats = ['jpg', 'jpeg', 'png', 'webp', 'mp4']) =>
//   new CloudinaryStorage({
//     cloudinary,
//     params: async (req, file) => ({
//       folder,
//       public_id: file.originalname.split('.')[0],
//       resource_type: file.mimetype.startsWith('video/') ? 'video' : 'image',
//       format: allowedFormats.includes(file.mimetype.split('/')[1]) ? file.mimetype.split('/')[1] : undefined,
//     }),
//   });

// // ✅ File Filters
// const imageFilter = (req, file, cb) => {
//   const isImage = file.mimetype.startsWith('image/');
//   cb(null, isImage);
// };

// const videoFilter = (req, file, cb) => {
//   const isVideo = file.mimetype.startsWith('video/');
//   cb(null, isVideo);
// };

// const mediaFilter = (req, file, cb) => {
//   const valid = file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/');
//   cb(null, valid);
// };

// // ✅ Exported Upload Middlewares
// export const imageUpload = multer({
//   storage: createStorage('uploads/images'),
//   fileFilter: imageFilter,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
// });

// export const videoUpload = multer({
//   storage: createStorage('uploads/videos', ['mp4', 'mov', 'avi']),
//   fileFilter: videoFilter,
//   limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
// });

// export const mediaUpload = multer({
//   storage: createStorage('uploads/media'),
//   fileFilter: mediaFilter,
//   limits: { fileSize: 100 * 1024 * 1024 },
// });

// // ✅ Machine Upload (cover, gallery, demo video)
// export const machineUpload = multer({
//   storage: createStorage('uploads/machines'),
//   fileFilter: mediaFilter,
//   limits: { fileSize: 100 * 1024 * 1024 },
// });
