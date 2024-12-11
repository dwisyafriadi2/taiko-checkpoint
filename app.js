const express = require('express');
const http2 = require('http2');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware to parse URL-encoded data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set the view engine and static files
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
    res.render('index', { data: null, history: null, error: null });
});

app.post('/', async (req, res) => {
    const address = req.body.address;

    if (!address) {
        return res.render('index', { data: null, history: null, error: "Address is required" });
    }

    // HTTP/2 client setup for rank data
    const client = http2.connect('https://trailblazer.mainnet.taiko.xyz');
    const rankHeaders = {
        ':method': 'GET',
        ':path': `/s2/user/rank?address=${address}`,
        ':scheme': 'https',
        ':authority': 'trailblazer.mainnet.taiko.xyz',
        'accept': 'application/json, text/plain, */*',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-US,en;q=0.9',
        'origin': 'https://trailblazers.taiko.xyz',
        'priority': 'u=1, i',
        'referer': 'https://trailblazers.taiko.xyz/',
        'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': 'Windows',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    };

    // Headers for history data
    const historyHeaders = {
        ':method': 'GET',
        ':path': `/s2/user/history?address=${address}`,
        ':scheme': 'https',
        ':authority': 'trailblazer.mainnet.taiko.xyz',
        'accept': 'application/json, text/plain, */*',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-US,en;q=0.9',
        'origin': 'https://trailblazers.taiko.xyz',
        'priority': 'u=1, i',
        'referer': 'https://trailblazers.taiko.xyz/',
        'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': 'Windows',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    };

    try {
        // Fetch rank data
        const rankRequest = client.request(rankHeaders);
        let rankData = '';
        rankRequest.on('data', chunk => {
            rankData += chunk;
        });

        // Fetch history data
        const historyRequest = client.request(historyHeaders);
        let historyData = '';
        historyRequest.on('data', chunk => {
            historyData += chunk;
        });

        rankRequest.on('end', () => {
            historyRequest.on('end', () => {
                client.close();
                const rankJson = JSON.parse(rankData);
                const historyJson = JSON.parse(historyData);
                res.render('index', { data: rankJson, history: historyJson.data.items, error: null });
            });

            historyRequest.on('error', (err) => {
                client.close();
                res.render('index', { data: rankJson, history: null, error: err.message });
            });
            historyRequest.end();
        });

        rankRequest.on('error', (err) => {
            client.close();
            res.render('index', { data: null, history: null, error: err.message });
        });
        rankRequest.end();

    } catch (error) {
        res.render('index', { data: null, history: null, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
