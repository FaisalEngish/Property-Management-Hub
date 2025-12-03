import { Router, Request, Response, NextFunction } from "express";
import { db } from "./db";
import { properties } from "@shared/schema";
import { eq } from "drizzle-orm";
import { isDemoAuthenticated } from "./demoAuth";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

const uploadsDir = path.join(__dirname, "uploads/property_images");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("[PROPERTY-IMAGES] Created uploads directory:", uploadsDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("[PROPERTY-IMAGES] Multer destination called for:", file.originalname);
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    console.log("[PROPERTY-IMAGES] Multer filename generated:", unique + ext);
    cb(null, unique + ext);
  }
});

const upload = multer({
  storage,
  limits: { 
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    console.log("[PROPERTY-IMAGES] FileFilter called:", file.originalname, file.mimetype);
    const allowedMimes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp',
      'image/tiff'
    ];
    const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.tiff', '.tif'];
    
    const ext = path.extname(file.originalname).toLowerCase();
    const mimeOk = allowedMimes.includes(file.mimetype);
    const extOk = allowedExts.includes(ext);
    
    if (mimeOk || extOk) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.originalname}. Allowed: JPG, PNG, WebP, TIFF`));
    }
  }
});

router.post("/:propertyId/upload", isDemoAuthenticated, (req: Request, res: Response, next: NextFunction) => {
  console.log("[PROPERTY-IMAGES] Starting upload middleware...");
  console.log("[PROPERTY-IMAGES] Content-Type header:", req.headers['content-type']);
  console.log("[PROPERTY-IMAGES] Content-Length header:", req.headers['content-length']);
  
  const uploadMiddleware = upload.array('images', 50);
  
  uploadMiddleware(req, res, (err: any) => {
    if (err) {
      console.error("[PROPERTY-IMAGES] Multer error:", err.message, err.code);
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File too large. Maximum size is 10MB per image.' });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({ error: 'Too many files. Maximum 50 images allowed.' });
        }
        return res.status(400).json({ error: `Upload error: ${err.message}` });
      }
      return res.status(400).json({ error: err.message || 'Upload failed' });
    }
    console.log("[PROPERTY-IMAGES] Multer completed, files:", (req as any).files?.length || 0);
    next();
  });
}, async (req: Request, res: Response) => {
  try {
    const propertyId = parseInt(req.params.propertyId, 10);
    const files = (req as any).files as Express.Multer.File[];

    console.log("[PROPERTY-IMAGES] Handler - Files received:", files?.length || 0);
    
    if (!files || files.length === 0) {
      return res.status(400).json({ 
        error: 'At least one image file is required. Supported formats: JPG, PNG, WebP, TIFF (max 10MB each)' 
      });
    }

    const existingProperty = await db.select().from(properties).where(eq(properties.id, propertyId)).limit(1);
    
    if (existingProperty.length === 0) {
      files.forEach(file => {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      });
      return res.status(404).json({ error: 'Property not found' });
    }

    if (existingProperty[0].source !== 'LOCAL') {
      files.forEach(file => {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      });
      return res.status(400).json({ error: 'Cannot upload images for external properties. Only local properties support image uploads.' });
    }

    const existingImages = existingProperty[0].images || [];
    
    if (existingImages.length + files.length > 50) {
      files.forEach(file => {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      });
      return res.status(400).json({ 
        error: `Cannot upload ${files.length} images. Property already has ${existingImages.length} images. Maximum 50 images allowed per property.` 
      });
    }

    const newImageUrls = files.map(file => `/uploads/property_images/${file.filename}`);
    const allImages = [...existingImages, ...newImageUrls];

    await db.update(properties)
      .set({ 
        images: allImages,
        updatedAt: new Date()
      })
      .where(eq(properties.id, propertyId));

    console.log(`[PROPERTY-IMAGES] SUCCESS: Added ${files.length} images to property ${propertyId}. Total: ${allImages.length}`);
    
    res.json({ 
      success: true, 
      message: `${files.length} image(s) uploaded successfully`,
      images: allImages,
      newImages: newImageUrls,
      totalImages: allImages.length
    });

  } catch (err: any) {
    console.error("[PROPERTY-IMAGES] ERROR:", err);
    res.status(500).json({ error: err.message || 'Server error uploading images' });
  }
});

router.delete("/:propertyId/image", isDemoAuthenticated, async (req: Request, res: Response) => {
  try {
    const propertyId = parseInt(req.params.propertyId, 10);
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    const existingProperty = await db.select().from(properties).where(eq(properties.id, propertyId)).limit(1);
    
    if (existingProperty.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    if (existingProperty[0].source !== 'LOCAL') {
      return res.status(400).json({ error: 'Cannot delete images from external properties' });
    }

    const existingImages = existingProperty[0].images || [];
    const updatedImages = existingImages.filter(img => img !== imageUrl);

    await db.update(properties)
      .set({ 
        images: updatedImages,
        updatedAt: new Date()
      })
      .where(eq(properties.id, propertyId));

    if (imageUrl.startsWith('/uploads/property_images/')) {
      const filename = path.basename(imageUrl);
      const filePath = path.join(uploadsDir, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`[PROPERTY-IMAGES] Deleted file: ${filePath}`);
      }
    }

    res.json({ 
      success: true, 
      message: 'Image removed successfully',
      images: updatedImages,
      totalImages: updatedImages.length
    });

  } catch (err: any) {
    console.error("[PROPERTY-IMAGES] ERROR deleting image:", err);
    res.status(500).json({ error: err.message || 'Server error deleting image' });
  }
});

router.get("/:propertyId", isDemoAuthenticated, async (req: Request, res: Response) => {
  try {
    const propertyId = parseInt(req.params.propertyId, 10);

    const existingProperty = await db.select().from(properties).where(eq(properties.id, propertyId)).limit(1);
    
    if (existingProperty.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const images = existingProperty[0].images || [];
    
    res.json({ 
      propertyId,
      images,
      count: images.length,
      maxImages: 50,
      maxSizePerImage: '10MB',
      maxTotalSize: '200MB',
      allowedFormats: ['JPG', 'PNG', 'WebP', 'TIFF']
    });

  } catch (err: any) {
    console.error("[PROPERTY-IMAGES] ERROR getting images:", err);
    res.status(500).json({ error: err.message || 'Server error getting images' });
  }
});

export default router;
