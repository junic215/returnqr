/**
 * ReturnQR EmailJS Integration Script
 * 
 * =========================================================
 * ⚠️ EmailJSのセットアップ手順 ⚠️
 * =========================================================
 * 1. https://www.emailjs.com/ でアカウントを作成・ログインします。
 * 2. 「Email Services」から利用するメールサービス（Gmail等）を追加し、
 *    そのService IDを控えます。
 * 3. 「Email Templates」で新しいテンプレートを作成し、Template IDを控えます。
 *    テンプレート内には以下の変数を設定してください：
 *      - アイテムID: {{item_id}}
 *      - メッセージ: {{message}}
 *      - 位置情報: {{location}}
 * 4. 「Account」タブからPublic Keyを控えます。
 * 5. 下記の「YOUR_PUBLIC_KEY」「YOUR_SERVICE_ID」「YOUR_TEMPLATE_ID」を
 *    ご自身のIDに書き換えてください。
 * =========================================================
 */

// 1. 公開キー（Public Key）を初期化
const EMAILJS_PUBLIC_KEY = 'Yn4lx7V4Cj1mekEt5'; // ここをご自身のPublic Keyに変更
const EMAILJS_SERVICE_ID = 'service_f5yp4ps'; // ここをご自身のService IDに変更
const EMAILJS_TEMPLATE_ID = 'template_d4wh4jt'; // ここをご自身のTemplate IDに変更

// EmailJS初期化
emailjs.init(EMAILJS_PUBLIC_KEY);

const form = document.getElementById('contact-form');
const submitBtn = document.getElementById('submit-btn');
const statusMessage = document.getElementById('status-message');
const messageInput = document.getElementById('message');
const sendLocationCheckbox = document.getElementById('send-location');

// URLパラメータからitem_idを取得
// 例: https://domain.com/?item_id=apple_watch_001
function getItemId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('item_id') || '不明 (item_id未指定)';
}

// フォームの通信中状態を切り替え
function setFormLoading(isLoading) {
    if (isLoading) {
        submitBtn.disabled = true;
        submitBtn.textContent = '送信中...';
        messageInput.disabled = true;
        sendLocationCheckbox.disabled = true;
    } else {
        submitBtn.disabled = false;
        submitBtn.textContent = '送信';
        messageInput.disabled = false;
        sendLocationCheckbox.disabled = false;
    }
}

// ステータスメッセージを表示
function showStatus(text, type) {
    statusMessage.textContent = text;
    statusMessage.className = ''; // クラスリセット
    statusMessage.classList.add(type); // 'success' または 'error'
    statusMessage.classList.remove('hidden');
}

// ステータスメッセージを隠す
function hideStatus() {
    statusMessage.classList.add('hidden');
}

// 位置情報を取得する関数 (Promise)
function getLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('お使いのブラウザは位置情報の発信に対応していません。'));
        } else {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            );
        }
    });
}

// フォーム送信イベント処理
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideStatus();
    setFormLoading(true);

    const message = messageInput.value.trim();
    if (!message) {
        setFormLoading(false);
        return;
    }

    const itemId = getItemId();
    let locationData = '位置情報は送信されませんでした。';

    // 位置情報送信のチェックボックスがONの場合
    if (sendLocationCheckbox.checked) {
        try {
            const coords = await getLocation();
            // Googleマップのリンクとして保存
            locationData = `https://maps.google.com/?q=${coords.lat},${coords.lng}`;
        } catch (error) {
            console.error('Location Error:', error);
            locationData = '位置情報の取得に失敗しました。';
        }
    }

    // EmailJSに渡すパラメータを設定
    const templateParams = {
        item_id: itemId,
        message: message,
        location: locationData
    };

    try {
        // 設定されたIDがデフォルトのままなら警告を出す (開発用親切設計)
        if (EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID') {
            throw new Error('EmailJSの各種IDが設定されていません。script.jsを確認してください。');
        }

        // EmailJSの送信処理
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);

        // 成功時の処理
        form.reset();
        showStatus('送信しました。ご協力ありがとうございます。', 'success');

    } catch (error) {
        console.error('EmailJS Error:', error);
        // エラー時の処理
        const errorMsg = error.message || 'エラーが発生しました。時間をおいて再度お試しください。';
        showStatus(errorMsg, 'error');
    } finally {
        setFormLoading(false);
    }
});
