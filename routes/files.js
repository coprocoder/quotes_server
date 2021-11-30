const express = require("express");
const router = express.Router();

// For up/download files
var multer = require("multer");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { promisify } = require("util");
const sizeOf = promisify(require("image-size"));
const transliterate = require("../config/translit");
const conversion = require("../db/data_conversion");

/* === IMAGES === */
function createHashedFilename(filename) {
  console.log("createHashedFilename", filename);
  // Расширение файла (всё, что после последней точки в названии)
  let file_ext = filename.split(".");
  file_ext = file_ext[file_ext.length - 1];

  let filename_hash = conversion.createHash(filename) + "." + file_ext;
  filename_hash = filename_hash.replace("/", "").replace("\\", "");
  console.log("hashed_filename", filename_hash);

  return filename_hash;
}

async function generateAndSaveImageMiniature(file, filename_hash) {
  console.log("file", file);

  let full_abs_path = path.resolve(file.path);

  let resize_rel_path = path.join(
    file.destination,
    "../resized",
    filename_hash
  );
  let resize_abs_path = path.resolve(resize_rel_path);

  // Добавляем в ответ путь к resize img
  file["resized"] = resize_rel_path;

  // Вычисление размеров миниатюры
  await sizeOf(full_abs_path)
    .then(async (dimensions) => {
      console.log("dimensions", dimensions);

      let new_h, new_w;
      let max_size = 200; // height or width
      if (dimensions.width > dimensions.height) {
        new_w = max_size;
        new_h = dimensions.height * (max_size / dimensions.width);
      } else {
        new_w = dimensions.width * (max_size / dimensions.height);
        new_h = max_size;
      }
      // console.log("new_size", { new_w, new_h });

      // Сжатие картинки до нужных размеров
      await sharp(full_abs_path)
        .resize(Math.ceil(new_w), Math.ceil(new_h))
        .jpeg({ quality: 90 })
        .toFile(resize_abs_path);
    })
    .catch((err) => console.error(err));

  return file;
}

let filenames_lish_hashnames = [];
var storage_img = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploadStorage/images/full");
  },
  filename: function (req, file, cb) {
    // Хешируем имена файлов и складываем в массив для генерации миниатюр
    let filename_hash = createHashedFilename(file.originalname);
    filenames_lish_hashnames.push(filename_hash);
    cb(null, filename_hash);
  },
});
var uploadImg = multer({ storage: storage_img });

router.post("/upload_img", uploadImg.array("file"), async (req, res, next) => {
  console.log("upload_img", req.files);
  console.log("filenames_lish_hashnames", filenames_lish_hashnames);


  // Генерируем миниатюры
  async function generateMiniatures() {
    const promises = req.files.map((file, index) => {
      generateAndSaveImageMiniature(file, filenames_lish_hashnames[index]);
    });
    await Promise.all(promises);
    filenames_lish_hashnames = [];
    return res.status(200).send(req.files);
  }
  generateMiniatures();
});


/* === FILES === */

var storage_files = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploadStorage/files");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + transliterate(file.originalname));
  },
});
var uploadFiles = multer({ storage: storage_files });

router.post("/upload_files", uploadFiles.array("file"), async (req, res) => {
  return res.status(200).send(req.files);
});

/* =================
    DEPRECATED (get access by http URL)
   ================= */
router.post("/download_img", (req, res, next) => {
  /*
    body : {
      "mimetype": "image/png",
      "path":"public\\images\\full\\1631517937969-cake2.png",
    }
  */

  let rel_path = req.body.path; // rel path
  let filePath = path.join(__dirname, "../" + rel_path); // abs path
  var bitmap = fs.readFileSync(filePath); // buffered images
  res.send({
    file:
      "data:" +
      req.body.mimetype +
      ";base64," +
      Buffer(bitmap).toString("base64"),
  });

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
});

/* =================
    DEPRECATED (get access by http URL )
   ================= */
router.post("/download_files", (req, res, next) => {
  let rel_path = req.body.path; // rel path
  let filePath = path.join(__dirname, "../" + rel_path); // abs path
  res.sendFile(filePath);

  // res.download(filePath, fileName, (err) => {
  //   if (err) {
  //     res.status(500).send({
  //       message: "Could not download the file. " + err,
  //     });
  //   }
  // });
});

module.exports = router;
