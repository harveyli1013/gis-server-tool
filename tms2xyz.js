let fs = require("graceful-fs");
let path = require("path");

// const GWC_PATH = "./temp/xihu_xihucut"
const GWC_PATH = path.join("temp", "xihu_xihucut");
const OUT_PATH = path.join("temp", "xihu_xyz");


function createDir(path) {
  try {
    fs.accessSync(path, fs.constants.R_OK);
    // console.log('文件可读');
  } catch (err) {
    // console.error('文件不可读');
    fs.mkdir(path, (err) => { });
  }
}

// 定义一个函数，用于递归地遍历一个文件夹及其所有子文件夹，并对每个png文件进行操作
function processDir(dir, tms_Z) {
  // 使用readdirSync方法获取当前文件夹内的所有文件名
  let files = fs.readdirSync(dir);
  // 遍历所有文件名
  files.forEach(function (file) {
    const _tms_name = file.split("_")
    // 拼接当前文件的完整路径
    let filePath = path.join(dir, file);
    // 使用statSync方法获取当前文件的状态信息
    let stat = fs.statSync(filePath);

    let _Z
    if (_tms_name[_tms_name.length - 1].endsWith("pbf")) {
      const _col_x = parseInt(_tms_name[0])
      const _row_y = parseInt(_tms_name[1].split(".")[0])

      createDir(path.join(OUT_PATH, parseInt(tms_Z).toString(), String(_col_x)))
      fs.copyFileSync(filePath, path.join(OUT_PATH, parseInt(tms_Z).toString(), String(_col_x), String(_row_y) + ".pbf"))

    } else if (_tms_name[0].includes("EPSG")) {
      _Z = _tms_name[_tms_name.length - 1]
        ;
      createDir(path.join(OUT_PATH, parseInt(_Z).toString()))
    }

    if (stat.isDirectory()) {
      processDir(filePath, _Z || tms_Z);
    }
  });
}
createDir(OUT_PATH)
processDir(GWC_PATH)
