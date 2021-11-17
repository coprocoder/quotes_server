const express = require('express');
const router = express.Router();

// For up/download files
var multer = require('multer')
const fs = require('fs')
const path = require('path')
const sharp = require('sharp')
const { promisify } = require('util');
const sizeOf = promisify(require('image-size'))
const transliterate = require('../config/translit')

/* === FILES === */

var storage_img = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploadStorage/images/full')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + transliterate(file.originalname))
  }
})
var storage_files = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploadStorage/files')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + transliterate(file.originalname))
  }
})
var uploadImg = multer({ storage: storage_img })

var uploadFiles = multer({ storage: storage_files })

router.post('/upload_img', uploadImg.array('file'), async (req, res) => {
  /* 
    res.files : [
      { file_info1},
      { file_info2},
      ...
    ]

    ex: {
      destination: "public/images/full",
      encoding: "7bit",
      fieldname: "file",
      filename: "1631521695124-cake.jpg",
      mimetype: "image/jpeg",
      originalname: "cake.jpg",
      path: "public\\images\\full\\1631521695124-cake.jpg",
      resize: "public\\images\\resized\\1631521695124-cake.jpg",
      size: 175981
    }
  */

  // console.log('multer files', req.files)

  for(let i in req.files) {
    let file = req.files[i]
    let resize_abs_path = path.resolve(path.join(file.destination,'../'),  'resized', file.filename)
    let resize_rel_path = path.join(file.destination,'../resized', file.filename);

    // Добавляем в ответ путь к resize img
    file['resized'] = resize_rel_path
    
    // Вычисление размеров миниатюры
    // let new_h, new_w
    // sizeOf(resize_abs_path)
    //   .then(dimensions => { 
    //       console.log('dimensions', dimensions);

    //       let max_size = 200 // height or width
    //       if(dimensions.width > dimensions.height) {
    //         new_w = max_size
    //         new_h = dimensions.height * (max_size / dimensions.width )
    //       }
    //       else {
    //         new_w = mdimensions.width * (max_size / dimensions.height )
    //         new_h = max_size 
    //       }
    //    })
    //   .catch(err => console.error(err))

    await sharp(file.path)
      .resize(200,200)
      .jpeg({ quality: 90 })
      .toFile(
        resize_abs_path
      )
  }
  // console.log('file size', JSON.stringify(req.files).length)
  return res.status(200).send(req.files)
})

router.post('/upload_files', uploadFiles.array('file'), async (req, res) => {
  return res.status(200).send(req.files)
})

/* =================
    DEPRECATED (get access by http URL)
   ================= */
router.post('/download_img', (req, res, next)=>{
  /*
    body : {
      "mimetype": "image/png",
      "path":"public\\images\\full\\1631517937969-cake2.png",
    }
  */

  let rel_path = req.body.path    // rel path
  let filePath = path.join(__dirname, '../' + rel_path); // abs path
  var bitmap = fs.readFileSync(filePath); // buffered images
  res.send({
    file: 'data:' + req.body.mimetype + ';base64,' + Buffer(bitmap).toString('base64'),
  })

    // res.zip([
    //   { path: filePath_full, name: fileName },
    //   { path: filePath_resize, name: fileName}
    // ]);
    // let options = {}
    // res.sendFile(filePath_full, options, function (err) {
    //   if (err) {
    //       next(err);
    //   } else {
    //       console.log('Sent full:', fileName);
    //   }
    // })
    // res.download(filePath_full, fileName, (err) => {
    //   if (err) {
    //     res.status(500).send({
    //       message: "Could not download the file. " + err,
    //     });
    //   }
    // });
})

/* =================
    DEPRECATED (get access by http URL )
   ================= */
router.post('/download_files', (req, res, next)=>{  
  let rel_path = req.body.path    // rel path
  let filePath = path.join(__dirname, '../' + rel_path); // abs path
  res.sendFile(filePath)

  // res.download(filePath, fileName, (err) => {
  //   if (err) {
  //     res.status(500).send({
  //       message: "Could not download the file. " + err,
  //     });
  //   }
  // });

})

module.exports = router;