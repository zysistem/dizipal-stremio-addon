require("dotenv").config();
const scrapeCookie = require("./src/scrapeProxyCookie");
const getUrlApi = require("./src/getUrlApi");

const DEFAULT_PROXY_URL = process.env.PROXY_URL || "https://dizipal1221.com";

try {
    getUrlApi.fetchWithUrl().then((value1) => {
        const proxyUrl = value1 || DEFAULT_PROXY_URL;
        scrapeCookie.fetchWithCookies(proxyUrl).then((value2) => {
            if (value2 && value2.data && value2.data.length > 10) {
                header.Cookie = value2.data;
                header.Origin = proxyUrl;
                header.Referer = proxyUrl;
            }
        }).catch((error) => {
            console.log(error.message);
        });
    }).catch((error) => {
        console.log(error.message);
    });
} catch (error) {
    console.log(error.message);
}





var header = {
    "Accept-Language": "tr,en;q=0.9,en-GB;q=0.8,en-US;q=0.7",
    "Sec-Ch-Ua-Platform": "Windows",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0",
    "Cookie": "",
    "Origin": DEFAULT_PROXY_URL,
    "Referer": DEFAULT_PROXY_URL,
}

module.exports = header;
