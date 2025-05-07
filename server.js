// server.js
const WebSocket = require('ws');
const express = require('express'); // Express.js'i dahil et
const http = require('http');     // Node.js'in http modülünü dahil et
const path = require('path');     // Dosya yolları için path modülünü dahil et

// --- Sunucu Ayarları ---
const HTTP_PORT = 8080; // HTTP sunucusu için port (örneğin 8080)

// --- Express Uygulamasını ve HTTP Sunucusunu Oluşturma ---
const app = express();
const httpServer = http.createServer(app); // Express uygulamasını kullanan bir HTTP sunucusu oluştur

// --- Statik Dosya Sunumu (adisyon.html'in bulunduğu 'public' klasörü) ---
// Bu satır, server.js ile aynı dizinde 'public' adlı bir klasör olduğunu
// ve adisyon.html'in bu klasörün içinde olduğunu varsayar.
app.use(express.static(path.join(__dirname, 'public')));

// Ana URL ('/') isteği geldiğinde adisyon.html dosyasını gönder
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'adisyon.html'));
});

// --- WebSocket Sunucusunu HTTP Sunucusuna Bağlama ---
// Artık belirli bir port yerine oluşturduğumuz HTTP sunucusunu kullanıyoruz
const wss = new WebSocket.Server({ server: httpServer });

console.log(`EMET LEZZET GÜNLERİ HTTP Sunucusu ${HTTP_PORT} portunda başlatıldı.`);
console.log(`WebSocket sunucusu da bu HTTP sunucusu üzerinden çalışıyor.`);

// --- Sunucu Verileri (Değişiklik Yok) ---
let users = [ 
    { id: 1, username: 'garson1', password: 'sifre1', role: 'waiter' },
    { id: 2, username: 'garson2', password: 'sifre2', role: 'waiter' },
    { id: 3, username: 'kasa', password: 'kasa123', role: 'cashier' }, 
    { id: 4, username: 'ahmet', password: 'ahmet1', role: 'waiter' },
    { id: 5, username: 'ayse', password: 'ayse1', role: 'waiter' },
];

let products = [ 
    { id: 1, name: "Çay", price: 7.00, category: "İçecekler" },
    { id: 2, name: "Türk Kahvesi", price: 15.00, category: "İçecekler" },
    { id: 3, name: "Limonata (El Yapımı)", price: 20.00, category: "İçecekler" },
    { id: 4, name: "Portakal Suyu (Taze Sıkım)", price: 25.00, category: "İçecekler" },
    { id: 5, name: "Su (0.5L)", price: 5.00, category: "İçecekler" },
    { id: 6, name: "Ayran", price: 10.00, category: "İçecekler" },
    { id: 7, name: "Bitki Çayı (Adaçayı)", price: 12.00, category: "İçecekler" },
    { id: 8, name: "Soda", price: 8.00, category: "İçecekler" },
    { id: 10, name: "Gözleme (Peynirli)", price: 40.00, category: "Yiyecekler" },
    { id: 11, name: "Gözleme (Kıymalı)", price: 50.00, category: "Yiyecekler" },
    { id: 12, name: "Gözleme (Patatesli)", price: 35.00, category: "Yiyecekler" },
    { id: 13, name: "Simit", price: 10.00, category: "Yiyecekler" },
    { id: 14, name: "Poğaça (Peynirli)", price: 12.00, category: "Yiyecekler" },
    { id: 15, name: "Sandviç (Kaşarlı)", price: 30.00, category: "Yiyecekler" },
    { id: 16, name: "Tost (Karışık)", price: 35.00, category: "Yiyecekler" },
    { id: 17, name: "Börek (Su Böreği Dilim)", price: 30.00, category: "Yiyecekler" },
    { id: 18, name: "Mantı (Bir Porsiyon)", price: 60.00, category: "Yiyecekler" },
    { id: 20, name: "Kek (Ev Yapımı Dilim)", price: 25.00, category: "Tatlılar" },
    { id: 21, name: "Kurabiye (Karışık 3 Adet)", price: 15.00, category: "Tatlılar" },
    { id: 22, name: "Sütlaç (Fırın)", price: 30.00, category: "Tatlılar" },
    { id: 23, name: "Muffin (Çikolatalı)", price: 20.00, category: "Tatlılar" },
    { id: 24, name: "Revani", price: 28.00, category: "Tatlılar" },
    { id: 25, name: "Trileçe", price: 35.00, category: "Tatlılar" },
    { id: 26, name: "Waffle (Meyveli)", price: 55.00, category: "Tatlılar" }
];

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

// --- WebSocket Yönetimi (Değişiklik Yok, sadece wss tanımı yukarıda değişti) ---
const clients = new Map(); 

function broadcast(message) {
    clients.forEach((userInfo, clientSocket) => {
        if (clientSocket.readyState === WebSocket.OPEN) {
            clientSocket.send(JSON.stringify(message));
        }
    });
}

function broadcastTableUpdates() {
    broadcast({ type: 'tables_update', payload: { tables: tables } });
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
                const productToAdd = products.find(p => p.id === payload.productId);
                
                if (tableToAdd && productToAdd && payload.quantity > 0) {
                    const existingItem = tableToAdd.order.find(item => item.productId === payload.productId && item.description === (payload.description || '')); 
                    
                    if (existingItem) {
                        existingItem.quantity += payload.quantity;
                    } else {
                        tableToAdd.order.push({
                            productId: payload.productId,
                            quantity: payload.quantity,
                            priceAtOrder: productToAdd.price, 
                            description: payload.description || '' 
                        });
                    }
                    
                    tableToAdd.total = tableToAdd.order.reduce((sum, item) => {
                        const p = products.find(prod => prod.id === item.productId);
                        return sum + (p.price * item.quantity);
                    }, 0);
                    tableToAdd.status = 'dolu';
                    tableToAdd.waiterId = currentUserInfo.id; 
                    tableToAdd.waiterUsername = currentUserInfo.username; 

                    ws.send(JSON.stringify({ type: 'order_update_success', payload: { tableId: tableToAdd.id } }));
                    broadcastTableUpdates(); 
                } else {
                    ws.send(JSON.stringify({ type: 'order_update_fail', payload: { error: 'Geçersiz masa, ürün veya adet.' } }));
                }
                break;

            case 'remove_order_item':
                 if (!currentUserInfo) {
                    ws.send(JSON.stringify({ type: 'error', payload: { message: 'İşlem için giriş yapmalısınız.' } }));
                    return;
                }
                const tableToRemoveFrom = tables.find(t => t.id === payload.tableId);
                if (tableToRemoveFrom) {
                    const itemIndex = tableToRemoveFrom.order.findIndex(item => item.productId === payload.productId);
                    if (itemIndex > -1) {
                        tableToRemoveFrom.order.splice(itemIndex, 1);
                        
                        tableToRemoveFrom.total = tableToRemoveFrom.order.reduce((sum, item) => {
                            const p = products.find(prod => prod.id === item.productId);
                            return sum + (p.price * item.quantity);
                        }, 0);

                        if (tableToRemoveFrom.order.length === 0) {
                            tableToRemoveFrom.status = 'boş';
                            tableToRemoveFrom.waiterId = null;
                            tableToRemoveFrom.waiterUsername = null; 
                        }
                        broadcastTableUpdates();
                    } else {
                        ws.send(JSON.stringify({ type: 'order_update_fail', payload: { error: 'Sipariş kaleminde ürün bulunamadı.' } }));
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
    // Bu log mesajı zaten yukarıda tanımlı
});
