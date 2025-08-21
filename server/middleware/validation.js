// validators/index.js
import { body, validationResult } from 'express-validator';

// Helper to handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array(),
    });
  }
  next();
};

// --- CATEGORY VALIDATORS ---
const baseCategoryValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be 1-100 characters'),

  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be max 500 characters'),

  body('image')
    .optional()
    .custom((value) => {
      if (!value || typeof value !== 'object') return false;
      const { url, public_id } = value;
      return (
        typeof url === 'string' &&
        /^https?:\/\//.test(url) &&
        typeof public_id === 'string' &&
        public_id.length > 0
      );
    })
    .withMessage('Image must be an object with a valid url and public_id'),
];

export const validateCreateCategory = [...baseCategoryValidation, handleValidationErrors];
export const validateUpdateCategory = [...baseCategoryValidation, handleValidationErrors];

// --- SUBCATEGORY VALIDATORS ---
const baseSubcategoryValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Subcategory name is required')
    .isLength({ max: 100 })
    .withMessage('Subcategory name must be max 100 characters'),

  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be max 500 characters'),

  body('image')
    .optional()
    .custom((value) => {
      if (!value || typeof value !== 'object') return false;
      const { url, public_id } = value;
      return (
        typeof url === 'string' &&
        /^https?:\/\//.test(url) &&
        typeof public_id === 'string' &&
        public_id.length > 0
      );
    })
    .withMessage('Image must be an object with a valid url and public_id'),
];

export const validateCreateSubcategory = [...baseSubcategoryValidation, handleValidationErrors];
export const validateUpdateSubcategory = [...baseSubcategoryValidation, handleValidationErrors];

// --- MACHINE VALIDATORS ---
const baseMachineValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Name must be 1-200 characters'),

  body('category_id')
    .trim()
    .notEmpty()
    .isMongoId()
    .withMessage('Category ID must be a valid MongoDB ObjectId'),

  body('subcategory_id')
    .trim()
    .notEmpty()
    .isMongoId()
    .withMessage('Subcategory ID must be a valid MongoDB ObjectId'),

  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be max 1000 characters'),

  body('cover_image')
    .optional()
    .custom((value) => {
      if (!value) return true; // Allow null/undefined
      if (typeof value !== 'object') return false;
      const { url, public_id } = value;
      return (
        typeof url === 'string' &&
        /^https?:\/\//.test(url) &&
        typeof public_id === 'string' &&
        public_id.length > 0
      );
    })
    .withMessage('Cover image must be an object with a valid url and public_id'),

  body('demo_video')
    .optional()
    .custom((value) => {
      if (!value) return true; // Allow null/undefined
      if (typeof value !== 'object') return false;
      const { url, public_id } = value;
      return (
        typeof url === 'string' &&
        /^https?:\/\//.test(url) &&
        typeof public_id === 'string' &&
        public_id.length > 0
      );
    })
    .withMessage('Demo video must be an object with a valid url and public_id'),

  body('video_thumbnail')
    .optional()
    .custom((thumb) => {
      if (!thumb) return true; // Allow null/undefined
      if (typeof thumb !== 'object') return false;
      const { url, public_id } = thumb;
      return (
        typeof url === 'string' &&
        /^https?:\/\//.test(url) &&
        typeof public_id === 'string' &&
        public_id.length > 0
      );
    })
    .withMessage('Video thumbnail must be an object with a valid url and public_id'),

  body('gallery_images')
    .optional()
    .isArray()
    .withMessage('Gallery images must be an array')
    .custom((images) => {
      if (!images || images.length === 0) return true; // Allow empty array
      return images.every(img =>
        typeof img === 'object' &&
        typeof img.url === 'string' &&
        /^https?:\/\//.test(img.url) &&
        typeof img.public_id === 'string' &&
        img.public_id.length > 0
      );
    })
    .withMessage('Each gallery image must have a valid url and public_id'),

  body('price')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Price must be max 50 characters'),

  body('specifications')
    .optional()
    .isArray()
    .withMessage('Specifications must be an array'),

  body('features')
    .optional()
    .isArray()
    .withMessage('Features must be an array'),

  body('is_new')
    .optional()
    .isBoolean()
    .withMessage('is_new must be boolean'),

  body('is_featured')
    .optional()
    .isBoolean()
    .withMessage('is_featured must be boolean'),
];

export const validateCreateMachine = [...baseMachineValidation, handleValidationErrors];
export const validateUpdateMachine = [...baseMachineValidation, handleValidationErrors];

// --- VIDEO VALIDATORS ---
const baseVideoValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 150 })
    .withMessage('Title must be 1-150 characters'),

  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be max 1000 characters'),

  body('video')
    .custom((value) => {
      if (!value || typeof value !== 'object') return false;
      const { url, public_id } = value;
      return (
        typeof url === 'string' &&
        /^https?:\/\//.test(url) &&
        typeof public_id === 'string' &&
        public_id.length > 0
      );
    })
    .withMessage('Video must be an object with a valid url and public_id'),

  body('thumbnail')
    .optional()
    .custom((value) => {
      if (!value || typeof value !== 'object') return false;
      const { url, public_id } = value;
      return (
        typeof url === 'string' &&
        /^https?:\/\//.test(url) &&
        typeof public_id === 'string' &&
        public_id.length > 0
      );
    })
    .withMessage('Thumbnail must be an object with a valid url and public_id'),

  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured must be a boolean'),

  body('isHighlighted')
    .optional()
    .isBoolean()
    .withMessage('isHighlighted must be a boolean'),
];

export const validateCreateVideo = [...baseVideoValidation, handleValidationErrors];
export const validateUpdateVideo = [...baseVideoValidation, handleValidationErrors];

// --- CONTACT VALIDATOR ---
export const validateContact = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be 1-100 characters'),

  body('email')
    .isEmail()
    .withMessage('Valid email is required'),

  body('phone')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Phone must be max 20 characters'),

  body('company')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Company must be max 100 characters'),

  body('subject')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Subject must be 1-200 characters'),

  body('message')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message must be 1-2000 characters'),

  handleValidationErrors
];

// --- FEEDBACK VALIDATORS ---
export const validateCreateFeedback = [
  body('message')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be 10-2000 characters'),

  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),

  body('profile_image')
    .optional({ checkFalsy: true })
    .custom((value) => {
      if (!value) return true; // Allow null/undefined
      if (typeof value !== 'object') return false;
      const { url, public_id } = value;
      return (
        typeof url === 'string' &&
        /^https?:\/\//.test(url) &&
        typeof public_id === 'string' &&
        public_id.length > 0
      );
    })
    .withMessage('Profile image must be an object with a valid url and public_id'),

  handleValidationErrors
];

export const validateCreateReply = [
  body('message')
    .trim()
    .isLength({ min: 5, max: 1000 })
    .withMessage('Reply must be 5-1000 characters'),

  handleValidationErrors
];

// --- MEDIA VALIDATORS ---
export const validateMediaUpload = [
  body('base64')
    .notEmpty()
    .withMessage('Base64 file is required')
    .isString()
    .withMessage('Base64 must be a string'),

  body('folder')
    .notEmpty()
    .withMessage('Upload folder is required'),

  body('resourceType')
    .optional()
    .isIn(['image', 'video', 'auto'])
    .withMessage('Invalid resourceType'),

  handleValidationErrors
];

export const validateMediaDelete = [
  body('public_id')
    .notEmpty()
    .withMessage('public_id is required'),

  body('resourceType')
    .optional()
    .isIn(['image', 'video', 'auto'])
    .withMessage('Invalid resourceType'),

  handleValidationErrors
];
export const validateMediaUpdate = [
  body('newBase64')
    .notEmpty()
    .withMessage('New base64 file is required')
    .isString()
    .withMessage('newBase64 must be a string'),

  body('oldPublicId')
    .notEmpty()
    .withMessage('Old public_id is required'),

  body('folder')
    .notEmpty()
    .withMessage('Upload folder is required'),

  body('resourceType')
    .optional()
    .isIn(['image', 'video', 'auto'])
    .withMessage('Invalid resourceType'),

  handleValidationErrors
];

// --- PARTNER VALIDATORS ---
const basePartnerValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be 1-100 characters'),
  body('logo')
    .custom((value) => {
      if (!value || typeof value !== 'object') return false;
      const { url, public_id } = value;
      return (
        typeof url === 'string' &&
        /^https?:\/\//.test(url) &&
        typeof public_id === 'string' &&
        public_id.length > 0
      );
    })
    .withMessage('Logo must be an object with a valid url and public_id'),
  body('website')
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('Website must be a valid URL'),
];

export const validateCreatePartner = [...basePartnerValidation, handleValidationErrors];
export const validateUpdatePartner = [...basePartnerValidation, handleValidationErrors];

// --- SUCCESS STORY VALIDATORS ---
const baseSuccessStoryValidation = [
  body('user_name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('User name is required (1-100 chars)'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Description is required (max 2000 chars)'),
  body('success_image')
    .optional()
    .custom((value) => {
      if (!value) return true; // Allow null/undefined
      if (typeof value !== 'object') return false;
      const { url, public_id } = value;
      return (
        typeof url === 'string' &&
        /^https?:\/\//.test(url) &&
        typeof public_id === 'string' &&
        public_id.length > 0
      );
    })
    .withMessage('Success image must be an object with a valid url and public_id'),
  body('profile_image')
    .optional()
    .custom((value) => {
      if (!value) return true; // Allow null/undefined
      if (typeof value !== 'object') return false;
      const { url, public_id } = value;
      return (
        typeof url === 'string' &&
        /^https?:\/\//.test(url) &&
        typeof public_id === 'string' &&
        public_id.length > 0
      );
    })
    .withMessage('Profile image must be an object with a valid url and public_id'),
  body('title')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Title must be max 200 chars'),
  body('company')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Company must be max 100 chars'),
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
];

export const validateCreateSuccessStory = [...baseSuccessStoryValidation, handleValidationErrors];
export const validateUpdateSuccessStory = [...baseSuccessStoryValidation, handleValidationErrors];

// --- ABOUT VALIDATORS ---
const baseAboutValidation = [
  body('description')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Description is required (max 2000 chars)'),
  body('whyChooseUs')
    .isArray({ min: 1 })
    .withMessage('Why Choose Us must be an array with at least one item')
    .custom((arr) => arr.every(item => typeof item === 'string' && item.length <= 300)),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array')
    .custom((images) => {
      return images.every(img =>
        typeof img === 'object' &&
        typeof img.url === 'string' &&
        /^https?:\/\//.test(img.url) &&
        typeof img.public_id === 'string' &&
        img.public_id.length > 0
      );
    })
    .withMessage('Each image must have a valid url and public_id'),
];

export const validateCreateAbout = [...baseAboutValidation, handleValidationErrors];
export const validateUpdateAbout = [...baseAboutValidation, handleValidationErrors];

// --- USER VALIDATORS ---
export const validateCreateUser = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be 2-50 characters'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),

  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 10, max: 20 })
    .withMessage('Phone number must be 10-20 characters'),

  body('company')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Company must be max 100 characters'),

  handleValidationErrors
];

export const validateUpdateUser = [
  body('name')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be 2-50 characters'),

  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 10, max: 20 })
    .withMessage('Phone number must be 10-20 characters'),

  body('company')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Company must be max 100 characters'),

  body('address.street')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Street must be max 100 characters'),

  body('address.city')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage('City must be max 50 characters'),

  body('address.state')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage('State must be max 50 characters'),

  body('address.zipCode')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 20 })
    .withMessage('Zip code must be max 20 characters'),

  body('address.country')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage('Country must be max 50 characters'),

  handleValidationErrors
];
