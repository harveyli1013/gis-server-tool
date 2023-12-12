const program = require("commander");
const mapboxgl = require("./src/mapbox.js");

program
  .command(
    "dem <zPath> <minlevel> <maxlevel> <lng1> <lat1> <lng2> <lat2> <FileSize> <URL> <token>"
  )
  .option("-p, --path <zPath>", "下载文件路径")
  .option("-min, --minlevel <minlevel>", "地图最小层级 一般为5级")
  .option("-max, --maxlevel <maxlevel>", "地图最大层级 mapboxgl支持最大为18级")
  .option("-n1, --lng1 <lng1>", "经度最小边界")
  .option("-a1, --lat1 <lat1>", "维度最小边界")
  .option("-n2, --lng2 <lng2>", "经度最大边界")
  .option("-a2, --lat2 <lat2>", "维度最大边界")
  .option("-f, --FileSize <FileSize>", "小于FileSize的会倍视为下载错误的图片")
  .option("-u, --URL <URL>", "目标URL")
  .option("-a, --token <token>", "mapboxgl认证token")
  .action(mapboxgl);

program.parse(process.argv);
