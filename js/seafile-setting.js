"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const fs = require('fs');
const path = require('path');
const DBUtil = require('./db-util');
const LogUtil = require('./log-util');

const DB_KEY = "SeafileSetting";

class SeafileSetting {

    constructor() {
        this.isDataInited = false;
    }

    async iniData(configPath) {
        if(configPath) {
            try {
                let content = await fs.readFileSync(configPath, 'utf8');
                let conf = JSON.parse(content);
                // console.log("readConfig:", content);
                let checkResult = this.isValidateConfig(conf);
                if(checkResult) {
                    LogUtil.notifyAlert("配置文件格式错误：" + checkResult);
                }
                this.settings = conf;
                DBUtil.putItem(DB_KEY, conf);
            } catch(e) {
                LogUtil.notifyError("配置文件读取失败", e);
            }
        }

        if(this.isDataInited) return ;

        // $ = require('jquery')(window);

        let defaultSetting = {
            paths: []
        };
        let dbSetting = DBUtil.getItem(DB_KEY);
        this.settings = (dbSetting && dbSetting.data) || defaultSetting;
        this.isInited = false;
        console.log("dbSettings: ", this.settings);
        this.isDataInited = true;
    }

    isValidateConfig(conf) {
        if(!conf.hasOwnProperty("path")) return "empty path";
        return "";
    }

    getSettingExport() {
        return {
            enter: async (action) => {
                try {
                    console.log("enter settings", action, typeof action.payload);
                    await this.iniData(typeof action.payload === "object" ? action.payload[0].path : undefined);
                    console.log("isDataInited: " + this.isDataInited + ", isInited: " + this.isInited);
                    setTimeout(() => {
                        this.initSettingView();
                        utools.setExpendHeight(500);
                    }, 50);
                } catch(e) {
                    console.error(e);
                    LogUtil.notifyError("初始化异常", e)
                }
            },
            search: (action, searchWord, callbackSetList) => {
                console.log("search settings");
            },
            select: (action, data, callbackSetList) => {
                console.log("select settings");
            },
            placeholder: "设置"
        }
    }

    async initSettingView() {
        try {
            let layer = document.getElementById("setting-layer");
            if (layer) {
                layer.style.display = "flex";
            }

            if (this.isInited) return;

            async function initScript() {
                const jsLinks = [
                    path.join(__dirname, "jquery.min.js"),
                    path.join(__dirname, "bootstrap.bundle.min.js"),
                    path.join(__dirname, "clipboard.min.js"),
                ];

                for(let i in jsLinks) {
                    try {
                        let script = document.createElement('script');
                        script.src = jsLinks[i];
                        document.head.append(script);
                        await sleep(50);
                        console.log("to add js: " + script);
                    } catch(e) {
                        alert("in error:" + (e.stackTrace ? e.stackTrace : e))
                    }
                }
            }

            function sleep(milliseconds) {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve("")
                    }, milliseconds);
                })
            }

            await initScript();

            const cssLinks = [
                path.join(__dirname, "..", "css", "bootstrap.css"),
            ];

            for(let i in cssLinks) {
                let script = document.createElement('link');
                script.href = cssLinks[i];
                script.rel="stylesheet";
                script.type="text/css";
                document.head.append(script);
                // $("head").append(
                //     '<link href="' + cssLinks[i] + '" rel="stylesheet" type="text/css">'
                // );
            }
            let html = fs.readFileSync(path.resolve(__dirname, "../html/settings.html"), 'utf8');
            // console.log(html);
            let rootItem = document.getElementById("root");
            let settingHtml = document.createElement("div");
            settingHtml.innerHTML = html;
            rootItem.append(settingHtml);
            // $("#root").append(html);
            setTimeout(() => {
                this.initDataSourceView();
                this.updateDataSourceState();
            }, 100);

            this.isInited = true;
        } catch(e) {
            LogUtil.notifyError("init failed!", e);
        }
    }

    initDataSourceView() {
        $("#dev").click(() => {
            const electron = require('electron');
            console.log(electron);
            console.log(utools);
            electron.remote.getCurrentWebContents().openDevTools()
        });

        $("#add").click(() => {
            let item = this.newItem();
            $("#add-layer").before(item);
        });

        $("#save").click(() => {
            let result = [];
            $("#form div.items").each(function() {
                let name = $(this).find("input:eq(0)").val();
                let path = $(this).find("input:eq(1)").val();
                let suffix = $(this).find("input:eq(2)").val();
                if(name && path) {
                    result.push({
                        "name": name,
                        "path": path,
                        "suffix": suffix
                    })
                }
            });

            console.log("old features: ", utools.getFeatures());

            if(this.settings.paths.length > 0) {
                try {
                    utools.removeFeature("seafileSearch")
                } catch (e) {
                    LogUtil.log("remove failed", e);
                }
            }

            if(result.length > 0) {
                let cmds = [];
                for(let idx in result) {
                    let item = result[idx];
                    cmds.push(item.name);
                }
                try {
                    utools.setFeature({
                        "code": "seafileSearch",
                        "explain": "Seafile搜索 ",
                        "icon": "../logo.png",
                        "cmds": cmds
                    });
                } catch (e) {
                    LogUtil.log("add failed", e);
                }
            }

            console.log("new features: ", utools.getFeatures());

            this.settings.paths = result;
            DBUtil.putItem(DB_KEY, this.settings);
        });

        console.log("setttings", this.settings);
        if(this.settings.paths.length > 0) {
            for(let index in this.settings.paths) {
                let item = this.settings.paths[index];
                let html = this.newItem();
                html.find("input:eq(0)").val(item.name);
                html.find("input:eq(1)").val(item.path);
                html.find("input:eq(2)").val(item.suffix);
                $("#add-layer").before(html);
            }
        } else {
            $("#add").click();
        }
    }

    newItem() {
        let item = $($("#line-template").html()).clone();
        item.find("button").click(() => {
            item.remove();
        });
        return item;
    }

    updateDataSourceState() {

    }
}


exports = module.exports = SeafileSetting;
module.exports.DB_KEY = DB_KEY;
