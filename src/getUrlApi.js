const Axios = require('axios');
const { setupCache } = require("axios-cache-interceptor");

const instance = Axios.create();
const axios = setupCache(instance);

const DEFAULT_PROXY_URL = "https://dizipal1560.com";

async function fetchWithUrl() {
    try {
        if (process.env.URLGETSTATUS === "true") {
            const response = await axios.get("https://raw.githubusercontent.com/dizipaltv/api/refs/heads/main/dizipal.json");
            if (response.status == 200 && response.data && response.data.currentSiteURL) {
                let currentSiteURL = String(response.data.currentSiteURL).trim();
                if (!/^https?:\/\//i.test(currentSiteURL)) {
                    currentSiteURL = `https://${currentSiteURL}`;
                }
                process.env.PROXY_URL = currentSiteURL;
                return process.env.PROXY_URL;
            }
        }
    } catch (error) {
        console.error('Error fetching the URL:', error);
    }

    if (!process.env.PROXY_URL) {
        process.env.PROXY_URL = DEFAULT_PROXY_URL;
    }
    return process.env.PROXY_URL;
}

module.exports = { fetchWithUrl };