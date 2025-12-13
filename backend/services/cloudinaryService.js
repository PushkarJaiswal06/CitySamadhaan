import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

class CloudinaryService {
  /**
   * Upload image to Cloudinary
   * @param {Buffer} fileBuffer - File buffer
   * @param {string} folder - Cloudinary folder path
   * @param {string} publicId - Optional public ID
   */
  async uploadImage(fileBuffer, folder = 'complaints', publicId = null) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `citysamadhaan/${folder}`,
          public_id: publicId,
          resource_type: 'image',
          transformation: [
            { width: 1200, height: 1200, crop: 'limit' },
            { quality: 'auto:good' }
          ]
        },
        (error, result) => {
          if (error) return reject(error);
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            size: result.bytes
          });
        }
      );

      streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
  }

  /**
   * Upload video to Cloudinary
   */
  async uploadVideo(fileBuffer, folder = 'complaints/videos', publicId = null) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `citysamadhaan/${folder}`,
          public_id: publicId,
          resource_type: 'video',
          chunk_size: 6000000 // 6MB chunks
        },
        (error, result) => {
          if (error) return reject(error);
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            size: result.bytes,
            duration: result.duration
          });
        }
      );

      streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
  }

  /**
   * Upload document (PDF, etc.)
   */
  async uploadDocument(fileBuffer, folder = 'documents', publicId = null) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `citysamadhaan/${folder}`,
          public_id: publicId,
          resource_type: 'raw'
        },
        (error, result) => {
          if (error) return reject(error);
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            size: result.bytes
          });
        }
      );

      streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
  }

  /**
   * Delete file from Cloudinary
   */
  async deleteFile(publicId, resourceType = 'image') {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType
      });
      return result;
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      throw error;
    }
  }

  /**
   * Upload profile picture
   */
  async uploadProfilePicture(fileBuffer, userId) {
    return await this.uploadImage(
      fileBuffer,
      'profiles',
      `user_${userId}_${Date.now()}`
    );
  }

  /**
   * Upload complaint photo
   */
  async uploadComplaintPhoto(fileBuffer, complaintId) {
    return await this.uploadImage(
      fileBuffer,
      'complaints/photos',
      `complaint_${complaintId}_${Date.now()}`
    );
  }

  /**
   * Upload land document
   */
  async uploadLandDocument(fileBuffer, propertyId) {
    return await this.uploadDocument(
      fileBuffer,
      'land-registry/documents',
      `property_${propertyId}_${Date.now()}`
    );
  }
}

export default new CloudinaryService();
