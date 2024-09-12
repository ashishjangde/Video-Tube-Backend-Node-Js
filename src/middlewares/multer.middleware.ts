import multer from "multer"

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, "./public/temp")
    },
    filename: (_req, file, cb) => {
        cb(null, `${file.originalname}+${Date.now()}`)
    }
})

export const Upload = multer({storage: storage})