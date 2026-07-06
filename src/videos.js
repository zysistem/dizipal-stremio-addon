require("dotenv").config();
const header = require("../header");
const sslfix = require("./sslfix");
const cheerio = require("cheerio");
const Axios = require('axios')
const { setupCache } = require("axios-cache-interceptor");

const instance = Axios.create();
const axios = setupCache(instance);
const DEFAULT_PROXY_URL = process.env.PROXY_URL || "https://dizipal1221.com";

function getProxyUrl() {
    return process.env.PROXY_URL || DEFAULT_PROXY_URL;
}

function resolveUrl(pathOrUrl) {
    if (/^https?:\/\//i.test(pathOrUrl)) {
        return pathOrUrl;
    }
    return `${getProxyUrl()}${pathOrUrl}`;
}

const cloudflare = require('./cloudflare');

async function fetchWithFallback(options) {
    try {
        const resp = await axios(options);
        if (resp && typeof resp.data === 'string') {
            const body = resp.data;
            if (/just a moment|_cf_chl_|cf-browser-verification/i.test(body) || (resp.status && resp.status >= 400)) {
                const cfResp = await cloudflare.request({ url: options.url, method: options.method || 'GET', headers: options.headers, data: options.data });
                return cfResp;
            }
        }
        return resp;
    } catch (err) {
        try {
            const cfResp = await cloudflare.request({ url: options.url, method: options.method || 'GET', headers: options.headers, data: options.data });
            return cfResp;
        } catch (e) {
            throw err;
        }
    }
}

async function GetVideos(id) {
    try {
        var response = await fetchWithFallback({ ...sslfix, url: resolveUrl(id), headers: header, method: "GET" });
        if (response && (response.status == 200 || response.status == '200')) {
            var $ = cheerio.load(response.data);
            var videoLink = $("#vast_new > iframe").attr("src");
            var jsFileUrl = await ScrapeVideoUrl(videoLink);
            if (jsFileUrl) return jsFileUrl;
        }
    } catch (error) {
        console.log(error);
    }

}


async function ScrapeVideoUrl(scrapeUrl) {
    try {
        var scrapeHeader = {
            "referer":process.env.PROXY_URL,
            "user-agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0"
        };
        var response = await fetchWithFallback({ url: resolveUrl(scrapeUrl), headers: scrapeHeader, method: "GET" });
        if (response && (response.status == 200 || response.status == '200')) {
            var playerFileLink = "";
            var subtitles;
            var $ = cheerio.load(response.data);
            var videoLinks = $("body > script:nth-child(2)");


            videoLinks.each((index, script) => {
                const scriptContent = $(script).html().trim();
                if (scriptContent.includes('new Playerjs')) {
                    const fileMatch = scriptContent.match(/file:"([^"]+)"/);
                    const subtitleMatch = scriptContent.match(/"subtitle":"([^"]+)"/)
                    if (fileMatch && fileMatch[1]) {
                        playerFileLink = fileMatch[1];
                    }
                    if (subtitleMatch && typeof (subtitleMatch) !== "null") {
                        subtitles = subtitleMatch[1].split(",");
                    }

                }
            });
            var video = {
                url: playerFileLink,
                subtitles: subtitles,
            }

            if (video) return video;

        }
    } catch (error) {
        console.log(error);
    }
}


module.exports = { GetVideos }