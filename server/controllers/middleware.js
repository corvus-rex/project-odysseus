import multer from 'multer'
import path from 'path'

const evidencePathSave = '../uploads/flagEvidence'


const evidenceStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, evidencePathSave)
    },
    filename: function (req, file, cb) {
        cb(null, req.body.publicationID + "_" + req.body.userID + "_" +
        req.body.flagIndex + "_" + file.originalname);
    }
})
export const uploadEvidence = multer({
    storage: evidenceStorage,
    fileFilter: (req, file, cb) => {
        const filetypes = /pdf|doc|docx|txt/; // filetypes you will accept
        const mimetype = filetypes.test(file.mimetype); // verify file is == filetypes you will accept
        const extname = filetypes.test(path.extname(file.originalname)); // extract the file extension
        // if mimetype && extname are true, then no error
        if(mimetype && extname){
            console.log("YEET")
            return cb(null, true);
        }
        // if mimetype or extname false, give an error of compatibilty
        console.log("YOOOOOOOOOOOOOOT")
        return cb(null, false);
    }
});