import { Router } from 'express';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';

const router = Router();

// Configuración de Multer (Memoria RAM temporal)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// OJO AQUÍ: La ruta es '/' porque en index.js ya definimos '/api/upload'
// La ruta final será: POST http://localhost:3001/api/upload
router.post('/', upload.single('file'), async (req, res) => {
    try {
        console.log("📥 Recibiendo petición de subida...");

        if (!req.file) {
            console.log("❌ No llegó ningún archivo en el body");
            return res.status(400).json({ error: 'No se subió ningún archivo' });
        }

        console.log("✅ Archivo recibido en memoria. Subiendo a Cloudinary...");

        // Convertir buffer a base64
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

        // Subir a Cloudinary
        const result = await cloudinary.uploader.upload(dataURI, {
            folder: "las-galaxias",
            resource_type: "auto"
        });

        console.log("🎉 Imagen subida:", result.secure_url);

        res.json({
            url: result.secure_url,
            public_id: result.public_id
        });

    } catch (error) {
        console.error("❌ Error CRÍTICO en Cloudinary:", error);
        // Esto te dirá en la consola del servidor por qué falló
        res.status(500).json({ error: 'Error al subir imagen: ' + error.message });
    }
});

export default router;