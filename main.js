//以下ローカルストレージの関数
// localStorageの内容を表示する関数
function showStorage() {
    //storageCheck要素を取得
    const storageCheck = document.querySelector('.storageCheck');
    //その要素に空値をいれる
    storageCheck.innerHTML = '';
    //for文。localstorageプロパティを生成してiに挿入する
    for (let i = 0; i < localStorage.length; i++) {
        //localstorage内の要素を変数に代入
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        //storageCheckに取得した要素をhtmlとして表示
        storageCheck.innerHTML += `<li>${key}: ${value}</li><br>`;
    }
}

// 新しい項目をlocalStorageに追加する関数
function addToStorage() {
    //id「keyInput,valueInput」の要素を取得
    const keyInput = document.getElementById('keyInput');
    const valueInput = document.getElementById('valueInput');
    //上2行で取得した要素の空白を削除した値を代入
    const key = keyInput.value.trim();
    const value = valueInput.value.trim();
    //key,valueの要素が入っていた時
    if (key && value) {
        //ローカルストレージに保存
        localStorage.setItem(key, value);
        //要素のリセット
        keyInput.value = '';
        valueInput.value = '';
        showStorage(); // 保存後に表示を更新
        console.log(`ローカルストレージに追加: ${key} = ${value}`);
    }
}

//以下セッションストレージの関数
function showSessionStorage() {
    const sessionStorageCheck = document.querySelector('.sessionStorageCheck');
    sessionStorageCheck.innerHTML = '';
    for (let i = 0; i < sessionStorage.length; i++) {
        const sessionKey = sessionStorage.key(i);
        const sessionValue = sessionStorage.getItem(sessionKey);
        sessionStorageCheck.innerHTML += `<li>${sessionKey}:${sessionValue}</li><br>`;
    }
}
function addToSessionStorage() {
    const sessionKeyInput = document.getElementById('sessionKeyInput');
    const sessionValueInput = document.getElementById('sessionValueInput');
    const sessionKey = sessionKeyInput.value.trim();
    const sessionValue = sessionValueInput.value.trim();
    if (sessionKey && sessionValue) {
        sessionStorage.setItem(sessionKey, sessionValue);
        sessionKeyInput.value = '';
        sessionValueInput.value = '';
        showSessionStorage()
        console.log(`セッションストレージに追加: ${sessionKey} = ${sessionValue}`);
    }
}

// DOMが読み込まれた後に実行(ページが最初に読み込まれたとき)
document.addEventListener('DOMContentLoaded', () => {
    // 初期表示
    showStorage();
    showSessionStorage();

    // 「ローカルストレージの中を見る」ボタンにイベントリスナーを追加
    // const checkButton = document.getElementById('checkStorage');
    // checkButton.addEventListener('click', showStorage);

    // 「ローカルストレージに追加」ボタンにイベントリスナーを追加
    const addButton = document.getElementById('addToStorage');
    addButton.addEventListener('click', addToStorage);

    //以下セッションストレージのこと
    // const sessionCheckButton = document.getElementById('checkSessionStorage');
    // sessionCheckButton.addEventListener('click', showSessionStorage);
    const addSessionButton = document.getElementById('addToSessionStorage');
    addSessionButton.addEventListener('click', addToSessionStorage);
});
