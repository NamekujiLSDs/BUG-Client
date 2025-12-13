require("v8-compile-cache")

const { app } = require("electron")
const store = require("electron-store")
const log = require("electron-log")
const path = require('path');

const configalt = new store({
    name: "alt",
    encryptionKey: "BugClient"
})


//エレメントが生成されるのを待つためのawait必要関数
function waitForElement(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
        // 1. 最初からあるかチェック (カンマ区切りなら「どれか1つ」あればヒット)
        const el = document.querySelector(selector);
        if (el) return resolve(el);

        const observer = new MutationObserver((mutations) => {
            // 2. 変化があるたびにチェック
            const el = document.querySelector(selector);
            if (el) {
                resolve(el);
                observer.disconnect();
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        if (timeout > 0) {
            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Timeout: Element '${selector}' not found`));
            }, timeout);
        }
    });
}

//Alt一覧のウィンドウ
async function openAltManager() {
    const menuHolder = document.getElementById("windowHolder")
    menuHolder.style = "display: block;"
    menuHolder.setAttribute("class", "popupWin")
    const menuW = document.getElementById("menuWindow")
    menuW.style = "overflow-y: auto; width: 1000px;"
    menuW.setAttribute("class", "stickyHeader dark")
    const altHeader = Object.assign(document.createElement("div"), {
        id: "altHeader"
    })
    const altHeaderTitle = Object.assign(document.createElement("div"), {
        id: "altHeaderTitle",
        innerText: "Alt Manager"
    })
    const addAlt = Object.assign(document.createElement("div"), {
        id: "addAlt",
        classList: "button",
        innerText: "add",
        style: "font-family: 'Material Icons Outlined';"
    })
    addAlt.setAttribute('onclick', "window.addAlt()")
    altHeader.append(altHeaderTitle)
    altHeader.append(addAlt)
    //alt一覧の表示

    const altBody = Object.assign(document.createElement("div"), {
        id: "altList",
    })
    let altList = configalt.get("alts", [])
    if (altList.length === 0) {
        const altEmpty = Object.assign(document.createElement("div"), {
            id: "noAlts",
            innerText: "No alt account found.\nAdd alt first."
        })
        altBody.append(altEmpty)
    } else {
        for (let i = 0; i < altList.length; i++) {
            const altListItem = Object.assign(document.createElement("div"), {
                classList: "altListItem"
            })
            const altName = Object.assign(document.createElement("div"), {
                classList: "altName",
                innerText: altList[i][0]
            })
            const altEdit = Object.assign(document.createElement("div"), {
                classList: "altEdit material-icons-outlined button",
                innerText: "edit"
            })
            altEdit.setAttribute("onclick", `window.altEdit(${i})`)
            const altLogin = Object.assign(document.createElement("div"), {
                classList: "altLogin material-icons-outlined button",
                innerText: "login"
            })
            altLogin.setAttribute("onclick", `window.altLogin(${i})`)

            const altRemove = Object.assign(document.createElement("div"), {
                classList: "altRemove material-icons-outlined button",
                innerText: "delete_forever"
            })
            altRemove.setAttribute("onclick", `window.altRemove(${i})`)
            altListItem.append(altName, altEdit, altLogin, altRemove)
            altBody.append(altListItem)
        }
    }
    menuW.innerHTML = "";
    menuW.append(altHeader, altBody)
}

//Alt追加用のウィンドウ
function openAddWin() {
    const menuHolder = document.getElementById("windowHolder");
    menuHolder.style = "display: block;";
    menuHolder.setAttribute("class", "popupWin");
    const menuW = document.getElementById("menuWindow");
    menuW.style = "overflow-y: auto; width: 1000px;";
    menuW.setAttribute("class", "stickyHeader dark");

    // --- 1. Username Section ---
    const userDiv = document.createElement('div');
    userDiv.className = 'altInputs';
    // テキスト "Username" を追加
    userDiv.append("Username");

    const userInput = document.createElement('input');
    Object.assign(userInput, {
        type: 'text',
        className: 'io-input-field',
        id: 'altUsername',
        placeholder: 'Username'
    });
    userDiv.append(userInput);

    // --- 2. Password Section ---
    const passDiv = document.createElement('div');
    passDiv.className = 'altInputs';
    // テキスト "Password" を追加
    passDiv.append("Password");

    // パスワード入力欄とアイコンを囲む親div (#altPasswordHolder)
    const passHolder = document.createElement('div');
    passHolder.id = 'altPasswordHolder';

    const passInput = document.createElement('input');
    Object.assign(passInput, {
        type: 'password',
        className: 'io-input-field',
        id: 'altPass',
        placeholder: 'Password'
    });

    const toggleIcon = document.createElement('span');
    // クラス指定: material-icons-outlined button passVis
    toggleIcon.className = 'material-icons-outlined button passVis';
    toggleIcon.textContent = 'visibility';

    // アイコンのクリックイベント（表示切り替えロジック）
    toggleIcon.onclick = function () {
        if (passInput.type === 'password') {
            passInput.type = 'text';
            toggleIcon.textContent = 'visibility_off'; // 斜線付きの目
        } else {
            passInput.type = 'password';
            toggleIcon.textContent = 'visibility';     // 普通の目
        }
    };

    // passHolder に input と span を追加
    passHolder.append(passInput, toggleIcon);
    // passDiv に passHolder を追加
    passDiv.append(passHolder);

    // --- 3. Warning Section (#altWarn) ---
    const warnDiv = document.createElement('div');
    Object.assign(warnDiv, {
        id: 'altWarn',
        style: "display:none",
        innerText: "Missing Username or Password!!"
    })

    // --- 4. Buttons Section ---
    const buttonsDiv = document.createElement('div');
    buttonsDiv.id = 'inputtings';

    const addBtn = document.createElement('div');
    Object.assign(addBtn, {
        id: 'addAlt',
        className: 'button',
        textContent: 'Add Account'
    });
    // 文字列でのonclick設定
    addBtn.setAttribute('onclick', 'window.saveAltAccount()');

    const cancelBtn = document.createElement('div');
    Object.assign(cancelBtn, {
        id: 'cancelAddAlt',
        className: 'button',
        textContent: 'Cancel'
    });
    cancelBtn.setAttribute('onclick', 'window.openAltManager()');

    buttonsDiv.append(addBtn, cancelBtn);

    // --- 最終的な組み立て ---
    menuW.innerHTML = "";
    menuW.append(userDiv, passDiv, warnDiv, buttonsDiv);
}

//Alt追加の確認
async function saveAlt() {
    const username = document.getElementById("altUsername").value
    const password = document.getElementById("altPass").value
    if (!username || !password || username.length === 0 || password.length === 0) {
        document.getElementById("altWarn").style = "display:block"
    } else if (username && password) {
        let alts = configalt.get("alts", [])
        alts.push([username, password])
        configalt.set("alts", alts)
        openAltManager()
    }
}
//Alt編集用のウィンドウ
function editAlt(num) {
    let altAcc = configalt.get("alts", [])[num]
    const menuHolder = document.getElementById("windowHolder");
    menuHolder.style = "display: block;";
    menuHolder.setAttribute("class", "popupWin");
    const menuW = document.getElementById("menuWindow");
    menuW.style = "overflow-y: auto; width: 1000px;";
    menuW.setAttribute("class", "stickyHeader dark");

    //ユーザー名
    const userDiv = document.createElement('div');
    userDiv.className = 'altInputs';
    userDiv.append("Username");

    const userInput = document.createElement('input');
    Object.assign(userInput, {
        type: 'text',
        className: 'io-input-field',
        id: 'altUsername',
        placeholder: 'Username',
        value: altAcc[0]
    });
    userDiv.append(userInput);

    //パスワード
    const passDiv = document.createElement('div');
    passDiv.className = 'altInputs';
    passDiv.append("Password");

    //親div - #altPasswordHolder
    const passHolder = document.createElement('div');
    passHolder.id = 'altPasswordHolder';

    const passInput = document.createElement('input');
    Object.assign(passInput, {
        type: 'password',
        className: 'io-input-field',
        id: 'altPass',
        placeholder: 'Password',
        value: altAcc[1]
    });

    const toggleIcon = document.createElement('span');
    toggleIcon.className = 'material-icons-outlined button passVis';
    toggleIcon.textContent = 'visibility';

    // pass表示切り替え
    toggleIcon.onclick = function () {
        if (passInput.type === 'password') {
            passInput.type = 'text';
            toggleIcon.textContent = 'visibility_off'; // 斜線付きの目
        } else {
            passInput.type = 'password';
            toggleIcon.textContent = 'visibility';     // 普通の目
        }
    };

    passHolder.append(passInput, toggleIcon);
    passDiv.append(passHolder);

    // Warn
    const warnDiv = document.createElement('div');
    Object.assign(warnDiv, {
        id: 'altWarn',
        style: "display:none",
        innerText: "Missing Username or Password!!"
    })
    // 下部ボタン
    const buttonsDiv = document.createElement('div');
    buttonsDiv.id = 'inputtings';
    const addBtn = document.createElement('div');
    Object.assign(addBtn, {
        id: 'addAlt',
        className: 'button',
        textContent: 'Save Changes'
    });
    addBtn.setAttribute('onclick', 'window.saveAltChange(' + num + ')');
    const cancelBtn = document.createElement('div');
    Object.assign(cancelBtn, {
        id: 'cancelAddAlt',
        className: 'button',
        textContent: 'Cancel'
    });
    cancelBtn.setAttribute('onclick', 'window.openAltManager()');

    buttonsDiv.append(addBtn, cancelBtn);
    menuW.innerHTML = "";
    menuW.append(userDiv, passDiv, warnDiv, buttonsDiv);
}

function saveEdit(num) {
    let altList = configalt.get("alts", [])
    altList[num] = [document.getElementById("altUsername").value, document.getElementById("altPass").value]
    configalt.set("alts", altList)
    openAltManager()
}

//ログインする関数
//[type,identifier,passowrd]のリストを受け取る
async function loginAlt(num) {
    closWind()
    const accInfo = configalt.get("alts", [])[num]
    const identifier = accInfo[0]
    const password = accInfo[1]
    window.loginOrRegister();
    await waitForElement("#accName, #accEmail");

    let inputField = document.getElementById("accName");
    if (!inputField) {
        const toggleBtn = document.querySelector(".auth-toggle-btn");
        if (toggleBtn) {
            toggleBtn.click();
            inputField = await waitForElement(`#accName`);
        } else {
            console.error("切り替えに失敗");
            return;
        }
    }
    inputField.value = identifier;
    inputField.dispatchEvent(new Event('input', { bubbles: true }));

    const passField = document.getElementById("accPass");
    if (passField) {
        passField.value = password;
        passField.dispatchEvent(new Event('input', { bubbles: true }));
    }
    //入力のラグを考慮する
    setTimeout(() => {
        const submitBtn = document.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.click();
    }, 10);
}

function removeAlt(num) {
    let account = configalt.get("alts", [])[num]
    document.getElementById("popupHolder").style = "z-index: 2147483647; display: block;"
    document.getElementById("twitchPop").style = "display: none"
    const genPop = document.getElementById("genericPop")
    genPop.classList = "altRemovePopup"
    genPop.style = "display: block"
    const msg = Object.assign(document.createElement("div"), {
        classList: "message",
        innerText: `Are you sure you want to delete the Alt\n"${account[0]}"?`
    })
    const confBtn = Object.assign(document.createElement("div"), {
        id: "confirmBtn",
        innerText: "Yes"
    })
    confBtn.setAttribute("onclick", `window.removeConfirm(${num}),clearPops()`)

    const decBtn = Object.assign(document.createElement("div"), {
        id: "declineBtn",
        innerText: "No"
    })
    decBtn.setAttribute("onclick", `window.openAltManager(),clearPops()`)
    genPop.innerHTML = ""
    genPop.append(msg, confBtn, decBtn)
}

function removeConfirm(num) {
    let accList = configalt.get("alts", [])
    accList.splice(num, 1);
    configalt.set("alts", accList)
    openAltManager()
}

module.exports = {
    openAltManager,
    loginAlt,
    openAddWin,
    saveAlt,
    editAlt,
    saveEdit,
    removeConfirm,
    removeAlt
}