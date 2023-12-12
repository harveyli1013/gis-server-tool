let Bagpipe = require("bagpipe");
let fs = require("fs");
let gracefulFs = require("graceful-fs");
gracefulFs.gracefulify(fs);
const { mkdirp } = require("mkdirp");

const request = require("request");

let bou = [117, 28.5, 119.5, 30];

let Minlevel = 14; //最小层级
let Maxlevel = 14; //最大层级
let token = `?sku=101iMRX7adL6P&access_token=pk.eyJ1IjoiYmlud25hZyIsImEiOiJjbDE0ZXB5ZGgwOXVhM2RvamNtd2JiZGxrIn0.sEVbroN0zj4ztS1AputKCQ`;
let zpath = "./mapbox-chunan"; // 瓦片目录
let speed = 5; //并发数
let suffix = "webp";
let all = [];
let URL = `https://api.mapbox.com/raster/v1/mapbox.mapbox-terrain-dem-v1`;

function calcXY(lng, lat, level) {
  let x = (lng + 180) / 360;
  let title_X = Math.floor(x * Math.pow(2, level));
  let lat_rad = (lat * Math.PI) / 180;
  let y =
    (1 - Math.log(Math.tan(lat_rad) + 1 / Math.cos(lat_rad)) / Math.PI) / 2;
  let title_Y = Math.floor(y * Math.pow(2, level));
  return {
    title_X,
    title_Y,
  };
}
function mainnAllXY(bounding, Minlevel, Maxlevel) {
  for (i = Minlevel; i <= Maxlevel; i++) {
    alli = {};
    let p1 = calcXY(bounding[2], bounding[3], i);
    let p2 = calcXY(bounding[0], bounding[1], i);
    alli.t = i;
    alli.x = [p2.title_X, p1.title_X];
    alli.y = [p1.title_Y, p2.title_Y];
    all.push(alli);
  }

  createDir();
}
async function createDir() {
  try {
    // 使用mkdirp模块递归地创建目录
    await mkdirp(zpath);
    for (let z = 0; z <= all.length - 1; z++) {
      await mkdirp(`${zpath}/${all[z].t}`);
      for (let x = all[z].x[0]; x <= all[z].x[1]; x++) {
        await mkdirp(`${zpath}/${all[z].t}/${x}`);
      }
      console.log(all[z].t + "级目录创建完成");
    }
    // console.log("等待目录创建完毕后开始下载任务");
    await task();
  } catch (err) {
    // 处理错误
    console.error(err);
  }
}
let sum = 0;
let bag = new Bagpipe(speed, {
  timeout: 1000 * 0.65,
});
function task() {
  for (let z = 0; z <= all.length - 1; z++) {
    for (let x = all[z].x[0]; x <= all[z].x[1]; x++) {
      for (let y = all[z].y[0]; y <= all[z].y[1]; y++) {
        let _pngName = `${zpath}/${all[z].t}/${x}/${y}.${suffix}`;
        if (fs.existsSync(_pngName)) {
          let _stats = fs.statSync(_pngName);
          if (_stats.size > FileSize) {
            continue;
          }
        }
        ++sum;
        bag.push(download, x, y, all[z].t);
      }
    }
  }
}
async function download(x, y, z) {
  let imgurl = `${URL}/${z}/${x}/${y}.${suffix}${token}`;

  let _pngName = `${zpath}/${z}/${x}/${y}.${suffix}`;
  if (fs.existsSync(_pngName)) {
    let _stats = fs.statSync(_pngName);
    if (_stats.size < FileSize) {
      fs.unlinkSync(_pngName);
    } else {
      sum--;
      return;
    }
  }

  let ws = fs
    .createWriteStream(`${zpath}/${z}/${x}/${y}.${suffix}`)
    .on("finish", () => {
      console.log(`图片下载成功,第${z}层: ${_pngName}`);
      console.log(--sum);
      ws.close();
    })
    .on("error", (err) => {
      console.log("发生异常:", err);
    });

  request
    .get(imgurl)
    .on("error", function (err) {
      bag.push(download, x, y, z);
      sum++;
      console.log("request错误", err);
      ws.close();
    })
    .pipe(ws);
}

module.exports = async function (
  zPath,
  minlevel,
  maxlevel,
  lng1,
  lat1,
  lng2,
  lat2,
  fileSize,
  _URL,
  _token
) {
  bou = [
    parseFloat(lng1),
    parseFloat(lat1),
    parseFloat(lng2),
    parseFloat(lat2),
  ];
  FileSize = parseInt(fileSize) || 500;
  zpath = zPath;
  Minlevel = parseInt(minlevel);
  Maxlevel = parseInt(maxlevel);
  URL = _URL;
  token = _token;
  mainnAllXY(bou, Minlevel, Maxlevel);
  /**
   * 创建下载队列
   */
};
