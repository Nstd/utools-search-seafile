const LogUtil = require("./log-util");

class DBUtil {
    static getItem(name) {
        try {
            return utools.db.get(name);
        } catch(e) {
            LogUtil.alert("get (" + name + ") failed!", e)
        }
        return undefined;
    }


    static putItem(item, data) {
        try {
            let dbItem = undefined;
            if(typeof item === 'string') {
                dbItem = DBUtil.getItem(item);
                if(dbItem) {
                    dbItem.data = data;
                } else {
                    dbItem = {
                        _id: item,
                        data: data
                    };
                }
            } else if(typeof item === 'object'
                && item.hasOwnProperty("_id") && item._id
                && item.hasOwnProperty("data")) {
                dbItem = DBUtil.getItem(item._id);
                if(dbItem) {
                    dbItem.data = item.data;
                    dbItem._rev = item._rev;
                } else {
                    dbItem = {
                        _id: item._id,
                        data: item.data
                    }
                }
            } else {
                LogUtil.alert("can't put invalidate item, _id not found:\n" + item);
            }
            if(dbItem) {
                utools.db.put(dbItem);
                console.log("save dbItem, success: ", dbItem);
            }
        } catch(e) {
            LogUtil.alert("put (" + item + ") failed!", e);
        }
    }

    static removeItem(item) {
        try {
            utools.db.remove(item)
        } catch(e) {
            LogUtil.alert("remove (" + item + ") failed!");
        }
    }
}

exports = module.exports = DBUtil;
