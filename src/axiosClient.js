require('dotenv').config();
const Axios = require('axios');
const { setupCache } = require('axios-cache-interceptor');
const { URL } = require('url');

const DEFAULT_REQUEST_PROXY = process.env.REQUEST_PROXY || process.env.HTTP_PROXY || process.env.HTTPS_PROXY || 'http://185.208.102.108:8080';
process.env.REQUEST_PROXY = process.env.REQUEST_PROXY || DEFAULT_REQUEST_PROXY;
process.env.HTTP_PROXY = process.env.HTTP_PROXY || DEFAULT_REQUEST_PROXY;
process.env.HTTPS_PROXY = process.env.HTTPS_PROXY || DEFAULT_REQUEST_PROXY;

let proxyConfig;

try {
  const proxyUrl = new URL(DEFAULT_REQUEST_PROXY);
  proxyConfig = {
    host: proxyUrl.hostname,
    port: Number(proxyUrl.port) || (proxyUrl.protocol === 'https:' ? 443 : 80),
    protocol: proxyUrl.protocol.replace(':', ''),
  };
} catch (e) {
  proxyConfig = undefined;
}

const axiosOptions = {};
if (proxyConfig) {
  axiosOptions.proxy = proxyConfig;
}

const instance = Axios.create(axiosOptions);
const axios = setupCache(instance);

module.exports = {
  axios,
  proxyConfig,
  requestProxy: DEFAULT_REQUEST_PROXY,
};
