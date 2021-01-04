const mysql = require("mysql");
function connectionDB() {
    return mysql.createConnection({
        "host": "localhost",
        "user": "root",
        "password": "root",
        "database": "i_mask_db",
        "multipleStatements" : true
    });
}

function PromiseConnectionDB(){
    return new Promise((resolve, reject) => {
        const DBconnection = connectionDB();
        if (DBconnection){
            DBconnection.connect(err => {
                if (err) {
                    reject(err);
                }
                resolve(DBconnection);
            });
        }
        else
            reject("DBError");
    });
        
}

module.exports = {"PromiseConnectionDB" : PromiseConnectionDB}