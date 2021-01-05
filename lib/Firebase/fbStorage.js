const { storage } = require("./firebase.js");
global.atob = require("atob");
global.XMLHttpRequest = require("xhr2");
const {login, register} = require("./fbAuth.js");

async function handleLogin() {
    await login("jforiscot@gmail.com", "i-mask-2021");
}
function getDate(date = new Date()) {
    return (`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}-${date.getMilliseconds()}`);
}
function FirebaseUpload(file) {
    return new Promise(async (resolve, reject) => {
        await handleLogin();
        storage.ref(`images/`).child(file).putString(file, "data_url").then(async snapshot => {
             (await snapshot.ref.getDownloadURL());
        }).catch(e => reject(e));
    });
}
module.exports = { FirebaseUpload, getDate};