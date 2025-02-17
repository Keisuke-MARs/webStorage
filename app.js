//グローバル変数の宣言
let db //indexedDBのデータベースオブジェクトを格納する
const dbName = "PersonDB" //DB名
const storeName = "people" //オブジェクトストア(テーブル名)

//DBを開く関数
function openDB() {
    //データベースを開くリクエスト
    const request = indexedDB.open(dbName, 1)

    //エラーハンドラ
    request.onerror = (event) => {
        console.error("データベースエラー:", event.target.error)
    }

    //成功ハンドラ
    request.onsuccess = (event) => {
        db = event.target.result //データベースオブジェクトを格納
        console.log("データベースに接続しました")
        displayPeople()
    }

    //データベース構造のアップグレードが必要な場合のハンドラ
    request.onupgradeneeded = (event) => {
        db = event.target.result
        //オブジェクトストアの作成(idをキーパスとし、オートインクリメント)
        const objectStore = db.createObjectStore(storeName, { keyPath: "id", autoIncrement: true })
        //インデックスの作成
        objectStore.createIndex("name", "name", { unique: false })
        objectStore.createIndex("age", "age", { unique: false })
    }
}

//データを追加する関数(CREATE)
function addPerson(name, age, imageData) {
    //書き込みのトランザクションを開始
    const transaction = db.transaction([storeName], "readwrite")//操作するオブジェクトストア(テーブル)と操作内容を指定（今回は読み取り、書き込み）
    const objectStore = transaction.objectStore(storeName)//オブジェクトストア(テーブル)にアクセス

    //データを追加
    const request = objectStore.add({ name, age, image: imageData })

    //成功ハンドラ
    request.onsuccess = () => {
        console.log("データを追加しました")
        displayPeople()//追加後画像を表示
    }

    //エラーハンドラ
    request.onerror = (event) => {
        console.error("追加エラー:", event.target.error)

    }
}

//データを表示する関数(READ)
function displayPeople() {
    const tbody = document.querySelector('#personTable tbody')//テーブルのbody内の要素をすべて取得
    tbody.innerHTML = "" //テーブルの中身をクリア

    //読み取り専用のトランザクションを開始
    const objectStore = db.transaction(storeName).objectStore(storeName)

    //カーソルを使用してすべてのデータを取得
    objectStore.openCursor().onsuccess = (event) => {
        const cursor = event.target.result
        if (cursor) {
            //各データに対して行を作成
            const tr = document.createElement("tr")//tr属性の要素を生成
            tr.innerHTML = `
                <td>${cursor.key}</td>
                <td>${cursor.value.name}</td>
                <td>${cursor.value.age}</td>
                <td>${cursor.value.image ? `<img src="${cursor.value.image}" alt="Person Image">` : "No Image"}</td>
                <td>
                    <button onclick="openEditModal(${cursor.key}, '${cursor.value.name}', ${cursor.value.age})"class="button-36">編集</button>
                    <button onclick="deletePerson(${cursor.key})" class="button-36">削除</button>
                </td>
            `
            tbody.appendChild(tr)//要素をテーブルに挿入
            cursor.continue()//次のデータへ
        }
    }
}

//データを更新する関数(UPDATE)
function updatePerson(id, name, age, imageData) {
    const transaction = db.transaction([storeName], "readwrite")//操作するオブジェクトストア(テーブル)と操作内容を指定（今回は読み取り、書き込み）
    const objectStore = transaction.objectStore(storeName)//オブジェクトストア(テーブル)にアクセス

    //更新するデータを格納するオブジェクト
    const updatePerson = {
        id: id, //キーパスとして使用されるIDを含める
        name: name,
        age: age,
        image: imageData,
    }
    //データの更新(putメソッド)
    const request = objectStore.put(updatePerson)

    //更新成功時の処理
    request.onsuccess = () => {
        console.log("データを更新しました")
        displayPeople()
        closeEditModal()
    }

    //失敗時
    request.onerror = (event) => {
        console.error("更新エラー:", event.target.error)
    }
}

//データを削除する関数(DELETE)、IDを引数として受け取る
function deletePerson(id) {
    //書き込み可能なトランザクションを開始
    const request = db.transaction([storeName], "readwrite").objectStore(storeName).delete(id)//指定されたIDのデータを削除

    //成功ハンドラ
    request.onsuccess = () => {
        console.log("データを削除しました")
        displayPeople()//削除後、表示を更新
    }
}

//編集モーダルを開く関数
function openEditModal(id, name, age) {
    document.getElementById('editId').value = id
    document.getElementById('editName').value = name
    document.getElementById('editAge').value = age
    document.getElementById('editModal').style.display = 'block'
}

//編集モーダルを閉じる関数
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none'
}

//フォーム送信後の処理(データを追加)
document.getElementById('personForm').onsubmit = (e) => {
    e.preventDefault()//デフォルトのフォーム送信を防止
    //フォームから値を取得
    const name = document.getElementById("name").value
    const age = Number.parseInt(document.getElementById("age").value)
    const imageFile = document.getElementById("image").files[0]

    if (imageFile) {
        //画像ファイルの場合
        const render = new FileReader()
        render.onload = (e) => {
            //画像をDataURLとして読み込みDBにデータを追加
            addPerson(name, age, e.target.result)
        }
        render.readAsDataURL(imageFile)
    } else {
        addPerson(name, age, null)
    }
    e.target.reset()//フォームをリセット
}

//フォーム送信後の処理(データを更新)
document.getElementById('editForm').onsubmit = (e) => {
    e.preventDefault()//デフォルトのフォーム送信を防止
    //フォームから値を取得
    const id = Number.parseInt(document.getElementById('editId').value, 10)
    if (isNaN(id)) {
        console.error('無効なIDです')
        return
    }
    const name = document.getElementById("editName").value
    const age = Number.parseInt(document.getElementById("editAge").value)
    const imageFile = document.getElementById("editImage").files[0]

    if (imageFile) {
        //画像ファイルの場合
        const render = new FileReader()
        render.onload = (e) => {
            //画像をDataURLとして読み込みDBにデータを追加
            updatePerson(id, name, age, e.target.result)
        }
        render.readAsDataURL(imageFile)
    } else {
        // 既存の画像を保持するために、現在のデータを取得して更新
        const transaction = db.transaction([storeName], "readonly")
        const objectStore = transaction.objectStore(storeName)
        const getRequest = objectStore.get(id)

        getRequest.onsuccess = (event) => {
            const existingData = event.target.result
            updatePerson(id, name, age, existingData.image)
        }
        getRequest.onerror = (event) => {
            console.error("データ取得エラー:", event.target.error)
        }
    }
}


document.getElementById('cancelEdit').onclick = closeEditModal
//ページ読み込み時にDBを開く
openDB()