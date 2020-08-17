
try {
    const SeafileSetting = require("./js/seafile-setting");
    const SeafileSearch = require("./js/seafile-search");

    // loadData();

    let settingHelper = new SeafileSetting();
    let searchHelper = new SeafileSearch();

    window.exports = {
        "seafileSetting": {
            mode: "none",
            args: settingHelper.getSettingExport()
        },
        "seafileSearch": {
            mode: "list",
            args: searchHelper.getSearchExport()
        }
    };
} catch (e) {
    alert(e.stackTrace ? e.stackTrace : e)
}