import multer from "multer";

const storage = multer.diskStorage({
  destination: "src/uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage,

  //? 5MB limit set
  limits: {
    fileSize: 5 * 1024 * 1024, 
  },

  //? file type check
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "text/csv") {
      return cb(new Error("Only CSV files are allowed"));
    }

    cb(null, true);
  },
});

export default upload;
