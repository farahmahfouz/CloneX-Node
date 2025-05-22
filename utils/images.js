const multer = require('multer');
const AppError = require('../utils/AppError');
const ImageKit = require('imagekit');

// Configure ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.IMAGE_KIT_PUBLIC_KEY,
  privateKey: process.env.IMAGE_KIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGE_KIT_URL_ENDPOINT,
});

// Multer storage configuration to keep files in memory
const multerStorage = multer.memoryStorage();

// Filter to only allow image files
const multerFilterImage = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image, please upload only images.', 400), false);
  }
};

// Multer upload configuration
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilterImage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 5 MB limit
  },
});

// Middleware to upload images using Multer
exports.uploadImages = (fields) => {
  return upload.fields([
    ...fields.map((field) => ({ name: field.name, maxCount: field.count })),
  ]);
};

// Middleware to handle and upload images to ImageKit
exports.handleImages = (fieldname) => {
  return async (req, res, next) => {

    const files = req.files?.[fieldname];

    if (!files) return next();

    try {
      // Upload images to ImageKit
      const uploadedImages = await Promise.all(
        files.map(async (file) => {
          const result = await imagekit.upload({
            file: file.buffer, // file buffer from multer
            fileName: `api-${Date.now()}-${Math.random()
              .toString(36)
              .substr(2, 9)}.jpeg`, // unique filename
            folder: '/uploads', // optional: specify folder in ImageKit
          });
          return result;
        })
      );

      // Store URLs of uploaded images in request body
      req.body[fieldname] = uploadedImages.map((file) => file.url);
      next();
    } catch (error) {
      console.error('🔥 ImageKit Upload Error:', error);
      return next(new AppError('Error uploading images to ImageKit', 500));
    }
  };
};

exports.handleMultipleImages = (fieldnames) => {
  return async (req, res, next) => {
    try {
      // Process each field type
      for (const fieldname of fieldnames) {
        const files = req.files?.[fieldname];
        if (files && files.length > 0) {
          // Upload images to ImageKit for this field
          const uploadedImages = await Promise.all(
            files.map(async (file) => {
              const result = await imagekit.upload({
                file: file.buffer,
                fileName: `${fieldname}-${Date.now()}-${Math.random()
                  .toString(36)
                  .substr(2, 9)}.jpeg`,
                folder: `/uploads/${fieldname}`,
              });
              return result;
            })
          );

          // Store URL(s) in request body
          if (fieldname === 'image' || fieldname === 'coverImage') {
            // Single image fields - store first URL only
            req.body[fieldname] = uploadedImages[0].url;
          } else {
            // Multiple image fields - store array of URLs
            req.body[fieldname] = uploadedImages.map((file) => file.url);
          }
        }
      }
      
      next();
    } catch (error) {
      console.error('🔥 ImageKit Upload Error:', error);
      return next(new AppError('Error uploading images to ImageKit', 500));
    }
  };
};