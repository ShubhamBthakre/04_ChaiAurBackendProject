import multer from "multer";

//cb:callBack
const storage = multer.diskStorage({
    destination: function (req, file, cb) { 
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
  
  //we are using ES6 thats why don't need to write same key and value 
//   const upload = multer({ storage: storage })


export const upload=multer({storage})


