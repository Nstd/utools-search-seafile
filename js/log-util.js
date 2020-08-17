class LogUtil {
    static log(msg, e) {
        let txt = "" + msg;
        if(e) {
            if(txt) {
                txt += "\n";
            }
            txt += e.stackTrace ? e.stackTrace : e
        }
        console.log(txt);
        return txt;
    }

    static alert(msg, e) {
        let txt = LogUtil.log(msg, e);
        alert(txt)
    }

    static notification(msg) {
        utools.showNotification(msg);
    }

    static notifySuccess(msg) {
        utools.showNotification("")
    }

    static notifyAlert(msg) {
        utools.showNotification("⚠️" + msg);
    }

    static notifyError(msg, e) {
        let text = LogUtil.log(msg, e);
        utools.showNotification("❌ " + text);
    }
}

exports = module.exports = LogUtil;
