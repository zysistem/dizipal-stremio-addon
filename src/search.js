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

async function SearchMovieAndSeries(name) {
    try {
        var values;
        var q = (name || '').toString().trim();
        // If no search term provided, return a small sample 'popular' catalog so home shows content
        if (!q) {
            const SAMPLE = [
                { url: '/film/avengers-endgame', type: 'movie', title: 'Avengers: Endgame', poster: 'https://via.placeholder.com/300x450?text=Avengers+Endgame', genres: 'Action,Adventure' },
                { url: '/dizi/game-of-thrones', type: 'series', title: 'Game of Thrones', poster: 'https://via.placeholder.com/300x450?text=Game+of+Thrones', genres: 'Drama,Fantasy' },
                { url: '/film/inception', type: 'movie', title: 'Inception', poster: 'https://via.placeholder.com/300x450?text=Inception', genres: 'Sci-Fi,Thriller' }
            ];
            return SAMPLE;
        }
        var data = `query=${encodeURIComponent(name)}`;
        const response = await fetchWithFallback({
            ...sslfix,
            url: resolveUrl('/api/search-autocomplete'),
            headers: {
                ...header,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            method: "POST",
            data: data
        });
        if (response && (response.status == 200 || response.status == '200') && typeof response.data !== "undefined") {
            values = response.data;
        }
        // fallback to sample if remote returned nothing
        if (!values || (Array.isArray(values) && values.length === 0)) {
            return [{ url: '/film/placeholder', type: 'movie', title: 'No Results - try again', poster: 'https://via.placeholder.com/300x450?text=No+Results', genres: 'Drama' }];
        }
        return values;
    } catch (error) {
        console.log(error);
        return undefined;
    }
}

async function SearchMetaMovieAndSeries(id, type) {
    try {
        var response = await fetchWithFallback({ ...sslfix, url: resolveUrl(id), headers: header, method: "GET" });
        if (response && (response.status == 200 || response.status == '200')) {
            var $ = cheerio.load(response.data);
            if (type == "series") {
                var name = $("#container > div.popup-inner.auto > div.cover > h5").text().trim();
                var background = $("#container > div.popup-inner.auto > div.cover").css("background-image").trim().replace(/url\(["']?([^"']*)["']?\)/, '$1');
                var country = $("#container > div.popup-inner.auto > div.popup-summary > ul > li:nth-child(5) > div.value").text().includes("Yerli") ? "TR" : "US";
                //genres
                // var genres = [];
                // var asd = $("#container > div.popup-inner.auto > div.popup-summary > ul > li:nth-child(5) > div.value").get();
                var season = $("div.season-selectbox > select > option:last-child").attr("value").trim();
                var imdb = $("#container > div.popup-inner.auto > div.popup-summary > ul > li:nth-child(1) > div.value").text().trim();
                var releaseInfo = $("#container > div.popup-inner.auto > div.popup-summary > ul > li:nth-child(6) > div.value").text().trim();
                var description = $("#container > div.popup-inner.auto > div.popup-summary > div > p").text().trim();
            }else{
                var name = $("#pre_content > div:nth-child(4) > div > span").text().trim();
                var country = $("#container > div > div.popup-summary > ul > li:nth-child(5) > div.value").text().includes("Yerli") ? "TR" : "US";
                var imdb = $("#container > div > div.popup-summary > ul > li:nth-child(1) > div.value").text().trim();
                var releaseInfo = $("#container > div > div.popup-summary > ul > li:nth-child(4) > div.value").text().trim();
                var description = $("#container > div > div.popup-summary > div > p").text().trim();
            }
            var metaObj = {
                name: name,
                background: background || "",
                country: country || "JP",
                genres: [],
                season: season || 1,
                imdbRating: Number(imdb),
                description: description,
                releaseInfo: String(releaseInfo),
            }
            return metaObj;
        }


    } catch (error) {
        console.log(error);
    }
}

async function SearchDetailMovieAndSeries(id, type, episode) {
    try {
        if (type == "series") {
            var response = await fetchWithFallback({ ...sslfix, url: resolveUrl(id), headers: header, method: "GET" });
            if (response && (response.status == 200 || response.status == '200')) {
                var values = [{}];
                var $ = cheerio.load(response.data);
                var data = $(`div.last-episodes.all-episodes > ul:nth-child(${episode})`).find(".episode-item");
                data.each((i, element) => {
                    i++;
                    var id = $(element).find("a").attr("href");
                    var title = $(element).find(`div:nth-child(${i}) > a > div:nth-child(3) > div.name`).text().trim();
                    var thumbnail = $(element).find(`div:nth-child(${i}) > a > img`).attr("src");
                    var episode = i;
                    values.push({ id: id, title: title, thumbnail: thumbnail, episode: episode });
                })
                return values;
            }
        } else {
            var values = [{
                id: id
            }];
            return values;

        }

    } catch (error) {
        console.log(error);
    }
}

module.exports = { SearchMovieAndSeries, SearchMetaMovieAndSeries, SearchDetailMovieAndSeries };
