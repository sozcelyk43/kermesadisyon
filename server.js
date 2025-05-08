// server.js
const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const path = require('path');

// --- Sunucu Ayarları ---
const HTTP_PORT = process.env.PORT || 8080; // Render veya yerel için port

// --- Express Uygulaması ve HTTP Sunucusu ---
const app = express();
const httpServer = http.createServer(app);

// --- Statik Dosya Sunumu ('public' klasörü) ---
app.use(express.static(path.join(__dirname, 'public')));

// Ana URL ('/') isteği geldiğinde adisyon.html dosyasını gönder
app.get('/', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'adisyon.html');
    console.log(`Serving file: ${filePath}`);
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error("HTML dosyası gönderilirken hata:", err);
            if (!res.headersSent) {
                 res.status(err.status || 500).send("Adisyon dosyası yüklenemedi.");
            }
        }
    });
});


// --- WebSocket Sunucusunu HTTP Sunucusuna Bağlama ---
const wss = new WebSocket.Server({ server: httpServer });

console.log(`EMET LEZZET GÜNLERİ HTTP Sunucusu ${HTTP_PORT} portunda başlatıldı.`);
console.log(`WebSocket sunucusu da bu HTTP sunucusu üzerinden çalışıyor.`);

// --- Sunucu Verileri ---
let users = [
    { id: 1, username: 'garson1', password: 'sifre1', role: 'waiter' },
    { id: 2, username: 'garson2', password: 'sifre2', role: 'waiter' },
    { id: 3, username: 'kasa', password: 'kasa123', role: 'cashier' },
    { id: 4, username: 'ahmet', password: 'ahmet1', role: 'waiter' },
    { id: 5, username: 'ayse', password: 'ayse1', role: 'waiter' },
];

// *** GÜNCEL ÜRÜN LİSTESİ ***
let products = [
    // ET Kategorisi
    { id: 101, name: "TAVUK (PİLİÇ) ÇEVİRME", price: 220.00, category: "ET" },
    { id: 102, name: "ET DÖNER PORSİYON - 100 GRAM", price: 125.00, category: "ET" },
    { id: 103, name: "YAPRAK DÖNER PORSİYON - 100 GRAM", price: 150.00, category: "ET" },
    { id: 104, name: "TAVUK DÖNER PORSİYON - 100 GRAM", price: 110.00, category: "ET" },
    { id: 105, name: "KÖFTE PORSİYON - 5 ADET", price: 100.00, category: "ET" },
    { id: 106, name: "ET İSKENDER - 100 GRAM", price: 200.00, category: "ET" },
    { id: 107, name: "TAVUK İSKENDER - 100 GRAM", price: 160.00, category: "ET" },
    { id: 108, name: "ET DÖNER - 500 GRAM", price: 500.00, category: "ET" },
    { id: 109, name: "YAPRAK DÖNER - 500 GRAM", price: 600.00, category: "ET" },
    { id: 110, name: "TAVUK DÖNER - 500 GRAM", price: 300.00, category: "ET" },
    { id: 111, name: "PİRZOLA - 4 ADET", price: 150.00, category: "ET" },
    { id: 112, name: "KUZU ŞİŞ", price: 150.00, category: "ET" },
    { id: 113, name: "ADANA DÜRÜM", price: 120.00, category: "ET" },
    { id: 114, name: "ADANA DÜRÜM - SERVİSLİ", price: 150.00, category: "ET" },
    { id: 115, name: "KANAT - 5 ADET - SERVİSLİ", price: 150.00, category: "ET" },
    { id: 116, name: "PİŞMEMİŞ KÖFTE - KG", price: 500.00, category: "ET" },

    // EKMEK ARASI Kategorisi
    { id: 201, name: "EKMEK ARASI ET DÖNER - 80 GR", price: 110.00, category: "EKMEK ARASI" },
    { id: 202, name: "EKMEK ARASI YAPRAK DÖNER - 80 GRAM", price: 120.00, category: "EKMEK ARASI" },
    { id: 203, name: "EKMEK ARASI TAVUK DÖNER - 80 GR", price: 90.00, category: "EKMEK ARASI" },
    { id: 204, name: "EKMEK ARASI KÖFTE - 5 ADET", price: 100.00, category: "EKMEK ARASI" },

    // TOST&HAMBURGER Kategorisi
    { id: 301, name: "AYVALIK TOSTU", price: 80.00, category: "TOST&HAMBURGER" },
    { id: 302, name: "KUMRU", price: 80.00, category: "TOST&HAMBURGER" },
    { id: 303, name: "HAMBURGER", price: 100.00, category: "TOST&HAMBURGER" },

     // İÇECEK Kategorisi
    { id: 401, name: "OSMANLI ŞERBETİ - 1.5 LİTRE", price: 30.00, category: "İÇECEK" },
    { id: 402, name: "SU", price: 10.00, category: "İÇECEK" },
    { id: 403, name: "KUTU İÇECEKLER", price: 30.00, category: "İÇECEK" },
    { id: 404, name: "AYRAN", price: 10.00, category: "İÇECEK" },
    { id: 405, name: "ÇAY", price: 7.00, category: "İÇECEK" },
    { id: 406, name: "TÜRK KAHVESİ", price: 15.00, category: "İÇECEK" },
    { id: 407, name: "SODA", price: 8.00, category: "İÇECEK" },

    // TATLI Kategorisi
    { id: 501, name: "EV BAKLAVASI - KG", price: 350.00, category: "TATLI" },
    { id: 502, name: "EV BAKLAVASI - 500 GRAM", price: 175.00, category: "TATLI" },
    { id: 503, name: "AŞURE - KG", price: 150.00, category: "TATLI" },
    { id: 504, name: "AŞURE - 500 GRAM", price: 75.00, category: "TATLI" },
    { id: 505, name: "HÖŞMERİM - KG", price: 100.00, category: "TATLI" },
    { id: 506, name: "HÖŞMERİM - 500 GRAM", price: 50.00, category: "TATLI" },
    { id: 507, name: "YAĞLI GÖZLEME", price: 30.00, category: "TATLI" },
    { id: 508, name: "İÇLİ GÖZLEME", price: 35.00, category: "TATLI" },
    { id: 509, name: "LAHMACUN", price: 40.00, category: "TATLI" },
    { id: 510, name: "CHEESE KEK - DİLİM", price: 40.00, category: "TATLI" },
    { id: 511, name: "TRİLEÇE - DİLİM", price: 40.00, category: "TATLI" },
    { id: 512, name: "COCO STAR - DİLİM", price: 40.00, category: "TATLI" },
    { id: 513, name: "DİĞER PASTA ÇEŞİTLERİ", price: 35.00, category: "TATLI" },
    { id: 514, name: "SÜTLAÇ (FIRIN)", price: 30.00, category: "TATLI" },
    { id: 515, name: "REVANİ", price: 28.00, category: "TATLI" }
];
// *** ÜRÜN LİSTESİ SONU ***


let tables = [];
function initializeTables(count = 12) {
    tables = [];
    for (let i = 1; i <= count; i++) {
        tables.push({
            id: `masa-${i}`,
            name: `Masa ${i}`,
            status: "boş",
            order: [],
            total: 0,
            waiterId: null,
            waiterUsername: null
        });
    }
}
initializeTables();

// --- WebSocket Yönetimi ---
const clients = new Map();

function broadcast(message) {
    const messageString = JSON.stringify(message);
    clients.forEach((userInfo, clientSocket) => {
        if (clientSocket.readyState === WebSocket.OPEN) {
            try {
                 clientSocket.send(messageString);
            } catch (error) {
                console.error(`Mesaj gönderilemedi (${userInfo ? userInfo.username : 'Bilinmeyen'}):`, error);
                 clients.delete(clientSocket);
            }
        }
    });
}

function broadcastTableUpdates() {
    broadcast({ type: 'tables_update', payload: { tables: tables } });
}

// Fiyatı hesaplamak için yardımcı fonksiyon
function calculateTableTotal(order) {
    return order.reduce((sum, item) => {
        const price = item.priceAtOrder || 0;
        return sum + (price * item.quantity);
    }, 0);
}


wss.on('connection', (ws) => {
    console.log('Yeni bir istemci bağlandı (WebSocket).');

    ws.on('message', (messageAsString) => {
        let message;
        try {
            message = JSON.parse(messageAsString);
            console.log('Alınan mesaj:', message);
        } catch (e) {
            console.error('Geçersiz JSON formatı:', messageAsString);
            ws.send(JSON.stringify({ type: 'error', payload: { message: 'Geçersiz JSON formatı.' } }));
            return;
        }

        const { type, payload } = message;
        const currentUserInfo = clients.get(ws);

        switch (type) {
            case 'login':
                const user = users.find(u => u.username === payload.username && u.password === payload.password);
                if (user) {
                    clients.set(ws, { id: user.id, username: user.username, role: user.role });
                    ws.send(JSON.stringify({
                        type: 'login_success',
                        payload: {
                            user: { id: user.id, username: user.username, role: user.role },
                            tables: tables,
                        }
                    }));
                    console.log(`Kullanıcı giriş yaptı: ${user.username} (Rol: ${user.role})`);
                } else {
                    ws.send(JSON.stringify({ type: 'login_fail', payload: { error: 'Kullanıcı adı veya şifre hatalı.' } }));
                }
                break;

            case 'add_order_item':
                if (!currentUserInfo) {
                    ws.send(JSON.stringify({ type: 'error', payload: { message: 'Sipariş eklemek için giriş yapmalısınız.' } }));
                    return;
                }
                const tableToAdd = tables.find(t => t.id === payload.tableId);

                // *** DETAYLI LOGLAMA VE TİP KONTROLÜ ***
                const receivedProductIdRaw = payload.productId;
                console.log(`[add_order_item] İstemciden RAW productId: ${receivedProductIdRaw} (tip: ${typeof receivedProductIdRaw})`);

                // Gelen ID'yi sayıya çevirmeyi dene (güvenlik önlemi)
                const receivedProductId = parseInt(receivedProductIdRaw, 10);
                console.log(`[add_order_item] Sayıya çevrilmiş productId: ${receivedProductId} (tip: ${typeof receivedProductId})`);

                if (isNaN(receivedProductId)) {
                     console.error(`[add_order_item] Geçersiz productId alındı: ${receivedProductIdRaw}`);
                     ws.send(JSON.stringify({ type: 'order_update_fail', payload: { error: 'Geçersiz ürün IDsi.' } }));
                     return; // Geçersiz ID ise devam etme
                }

                console.log(`[add_order_item] Sunucudaki ilk 5 ürün ID ve tipi: ${products.slice(0, 5).map(p => `${p.id} (${typeof p.id})`).join(', ')}`);

                const productToAdd = products.find(p => {
                    console.log(`[add_order_item] Karşılaştırılıyor: p.id (${p.id}, tip: ${typeof p.id}) === receivedProductId (${receivedProductId}, tip: ${typeof receivedProductId}) -> ${p.id === receivedProductId}`);
                    return p.id === receivedProductId;
                });

                console.log(`[add_order_item] products.find sonucu (productToAdd):`, productToAdd ? productToAdd.name : 'Bulunamadı');
                // *** DETAYLI LOGLAMA SONU ***

                console.log(`Ürün ekleme isteği: Masa=${payload.tableId}, ÜrünID=${payload.productId}, Adet=${payload.quantity}`);
                console.log(`Masa bulundu mu? ${!!tableToAdd}`);
                console.log(`Ürün bulundu mu? ${!!productToAdd}`);

                if (tableToAdd && productToAdd && payload.quantity > 0) {
                    const existingItem = tableToAdd.order.find(item =>
                        item.productId === receivedProductId && // Sayıya çevrilmiş ID ile karşılaştır
                        item.description === (payload.description || '')
                    );

                    if (existingItem) {
                        existingItem.quantity += payload.quantity;
                        existingItem.waiterUsername = currentUserInfo.username;
                    } else {
                        tableToAdd.order.push({
                            productId: receivedProductId, // Sayıya çevrilmiş ID'yi kaydet
                            quantity: payload.quantity,
                            priceAtOrder: productToAdd.price,
                            description: payload.description || '',
                            waiterUsername: currentUserInfo.username
                        });
                    }

                    tableToAdd.total = calculateTableTotal(tableToAdd.order);
                    tableToAdd.status = 'dolu';
                    tableToAdd.waiterId = currentUserInfo.id;
                    tableToAdd.waiterUsername = currentUserInfo.username;

                    ws.send(JSON.stringify({ type: 'order_update_success', payload: { tableId: tableToAdd.id } }));
                    broadcastTableUpdates();
                } else {
                    console.error(`Sipariş eklenemedi: Masa=${!!tableToAdd}, Ürün=${!!productToAdd}, Adet=${payload.quantity}`);
                    ws.send(JSON.stringify({ type: 'order_update_fail', payload: { error: 'Geçersiz masa, ürün veya adet.' } }));
                }
                break;

            case 'add_manual_order_item':
                 if (!currentUserInfo) {
                    ws.send(JSON.stringify({ type: 'error', payload: { message: 'İşlem için giriş yapmalısınız.' } }));
                    return;
                }
                 if (currentUserInfo.role !== 'cashier') {
                    ws.send(JSON.stringify({ type: 'error', payload: { message: 'Manuel ürün ekleme yetkiniz yok.' } }));
                    return;
                }

                const tableForManual = tables.find(t => t.id === payload.tableId);

                if (tableForManual && payload.name && payload.price >= 0 && payload.quantity > 0) {
                     tableForManual.order.push({
                         name: payload.name,
                         quantity: payload.quantity,
                         priceAtOrder: payload.price,
                         description: payload.description || '',
                         category: payload.category || 'Diğer',
                         waiterUsername: currentUserInfo.username
                     });

                    tableForManual.total = calculateTableTotal(tableForManual.order);
                    tableForManual.status = 'dolu';
                    tableForManual.waiterId = currentUserInfo.id;
                    tableForManual.waiterUsername = currentUserInfo.username;

                    ws.send(JSON.stringify({ type: 'order_update_success', payload: { tableId: tableForManual.id, manual: true } }));
                    broadcastTableUpdates();
                } else {
                     ws.send(JSON.stringify({ type: 'manual_order_update_fail', payload: { error: 'Geçersiz masa veya manuel ürün bilgileri.' } }));
                }
                break;


            case 'remove_order_item':
                 if (!currentUserInfo) {
                    ws.send(JSON.stringify({ type: 'error', payload: { message: 'İşlem için giriş yapmalısınız.' } }));
                    return;
                }
                const tableToRemoveFrom = tables.find(t => t.id === payload.tableId);
                if (tableToRemoveFrom) {
                    // Gelen productId'yi sayıya çevir (manuel değilse)
                    const productIdNum = payload.productId === null ? null : parseInt(payload.productId, 10);

                    const itemIndex = tableToRemoveFrom.order.findIndex(item =>
                        (item.productId === productIdNum || (productIdNum === null && item.name === payload.name)) &&
                        item.description === (payload.description || '')
                    );

                    if (itemIndex > -1) {
                        tableToRemoveFrom.order.splice(itemIndex, 1);

                        tableToRemoveFrom.total = calculateTableTotal(tableToRemoveFrom.order);

                        if (tableToRemoveFrom.order.length === 0) {
                            tableToRemoveFrom.status = 'boş';
                            tableToRemoveFrom.waiterId = null;
                            tableToRemoveFrom.waiterUsername = null;
                        }
                        broadcastTableUpdates();
                    } else {
                        console.warn("Silinecek öğe bulunamadı:", payload);
                        ws.send(JSON.stringify({ type: 'order_update_fail', payload: { error: 'Silinecek sipariş kalemi bulunamadı.' } }));
                    }
                } else {
                     ws.send(JSON.stringify({ type: 'order_update_fail', payload: { error: 'Masa bulunamadı.' } }));
                }
                break;

            case 'close_table':
                if (!currentUserInfo) {
                    ws.send(JSON.stringify({ type: 'error', payload: { message: 'İşlem için giriş yapmalısınız.' } }));
                    return;
                }
                if (currentUserInfo.role !== 'cashier') {
                    ws.send(JSON.stringify({ type: 'error', payload: { message: 'Bu işlem için yetkiniz yok (Sadece Kasa yapabilir).' } }));
                    return;
                }

                const tableToClose = tables.find(t => t.id === payload.tableId);
                if (tableToClose) {
                    tableToClose.order = [];
                    tableToClose.total = 0;
                    tableToClose.status = 'boş';
                    tableToClose.waiterId = null;
                    tableToClose.waiterUsername = null;
                    console.log(`${currentUserInfo.username} tarafından ${tableToClose.name} kapatıldı.`);
                    broadcastTableUpdates();
                } else {
                    ws.send(JSON.stringify({ type: 'error', payload: { message: 'Kapatılacak masa bulunamadı.' } }));
                }
                break;

            case 'logout':
                if (clients.has(ws)) {
                    const loggedOutUser = clients.get(ws);
                    clients.delete(ws);
                    console.log(`Kullanıcı çıkış yaptı: ${loggedOutUser.username}`);
                }
                break;

            default:
                console.log('Bilinmeyen mesaj tipi:', type);
                ws.send(JSON.stringify({ type: 'error', payload: { message: `Bilinmeyen mesaj tipi: ${type}` } }));
        }
    });

    ws.on('close', () => {
        const closedUser = clients.get(ws);
        if (closedUser) {
            console.log(`İstemci bağlantısı kesildi: ${closedUser.username}`);
        } else {
            console.log('Kimliği doğrulanmamış bir istemcinin bağlantısı kesildi.');
        }
        clients.delete(ws);
    });

    ws.on('error', (error) => {
        console.error('Bir WebSocket hatası oluştu:', error);
        clients.delete(ws);
    });
});

// --- HTTP Sunucusunu Başlatma ---
httpServer.listen(HTTP_PORT, () => {
  // Log mesajı zaten yukarıda tanımlı
});
