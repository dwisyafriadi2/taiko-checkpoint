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
    res.render('index', { data: null, error: null });
});

app.post('/', async (req, res) => {
    const address = req.body.address;

    if (!address) {
        return res.render('index', { data: null, error: "Address is required" });
    }

    // HTTP/2 client setup
    const client = http2.connect('https://trailblazer.mainnet.taiko.xyz');
    const headers = {
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

    try {
        // Sending request via HTTP/2
        const request = client.request(headers);

        let data = '';
        request.on('data', chunk => {
            data += chunk;
        });

        request.on('end', () => {
            client.close();
            const jsonData = JSON.parse(data);
            res.render('index', { data: jsonData, error: null });
        });

        request.on('error', (err) => {
            client.close();
            res.render('index', { data: null, error: err.message });
        });

        request.end();
    } catch (error) {
        res.render('index', { data: null, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});