"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const fs = require('fs');
const path = require('path');
const LogUtil = require("./log-util");
const DBUtil = require("./db-util");
const SeafileSetting = require("./seafile-setting");


class SeafileSearch {

    getSearchExport() {
        return {
            enter: (action, callbackSetList) => {
                var layer = document.getElementById("setting-layer");
                if(layer) {
                    layer.style.display = "none";
                }
                this.settings = DBUtil.getItem(SeafileSetting.DB_KEY).data;
                console.log("action", action, "setting", this.settings);
                this.targetName = action.payload;
                this.targetPath = "";
                this.targetSuffix = [];
                if(this.settings && this.settings.paths) {
                    for(let i in this.settings.paths) {
                        let item = this.settings.paths[i];
                        if(item.name === action.payload) {
                            this.targetPath = item.path;
                            if(item.suffix) {
                                this.targetSuffix = item.suffix.split("|");
                            }
                        }
                    }
                }
                console.log("path: ", this.targetPath, "name: ", this.targetName, "suffix: ", this.targetSuffix);
                if(this.targetPath) {
                    this.loadData()
                }
            },
            search: (action, searchWord, callbackSetList) => {
                console.log("toSearch:", searchWord, this.data ? this.data.length : 0);
                let str = ["", ...searchWord, ""].map((item) => {return (item === ".") ? "\\." : item}).join(".*");
                console.log("str: ", str);
                let reg = new RegExp(str);
                let result = this.data.filter(function(item) {
                    return reg.test(item.path)
                }).map(function(item) {
                    return {
                        "title": item.path,
                        "description": item.path,
                        "icon": item.isDir ? "icon-dir.png" : "icon-file.png",
                        "obj": item
                    }
                });
                console.log("searchResult: ", result);
                callbackSetList(result);
            },
            select: (action, data, callbackSetList) => {
                console.log(data);
                utools.shellOpenPath(data.obj.path);
                utools.outPlugin();
            },
            placeholder: "搜索"
        }
    }

    loadData() {
        let result = [];
        let filePath = path.resolve(this.targetPath);
        this.fileDisplay(result, filePath);
        this.data = result;
        console.log("loadResult: ", this.data);
    }

    fileDisplay(result, filePath) {
        fs.readdir(filePath, (err, files) => {
           if(err) {
               LogUtil.notifyError("读取目录失败", err);
           } else {
              files.forEach((fileName) => {
                  let fileDir = path.join(filePath, fileName);
                  fs.stat(fileDir, (err2, stats) => {
                      if(err2) {
                          LogUtil.notifyError("获取文件状态失败", err2);
                      } else {
                          let isFile = stats.isFile();
                          let isDir = stats.isDirectory();
                          if(isFile) {
                              console.log("checkFile: " + fileDir, "ext: " + path.extname(fileDir), (!this.targetSuffix || this.targetSuffix.length === 0 || this.targetSuffix.indexOf(path.extname(fileDir).split(".")[1]) >= 0))
                          }
                          if(isFile && (!this.targetSuffix || this.targetSuffix.length === 0 || this.targetSuffix.indexOf(path.extname(fileDir).split(".")[1]) >= 0)) {
                              console.log("addFile: ", fileDir);
                              result.push({
                                  "path": fileDir,
                                  "isDir": false
                              });
                          }
                          if(isDir) {
                              result.push({
                                  "path": fileDir,
                                  "isDir": true
                              });
                              this.fileDisplay(result, fileDir)
                          }
                      }
                  })
              }) ;
           }
        });
    }
}

exports = module.exports = SeafileSearch;