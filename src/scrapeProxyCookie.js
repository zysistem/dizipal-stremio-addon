const Axios = require('axios');
const { setupCache } = require("axios-cache-interceptor");

const instance = Axios.create();
const axios = setupCache(instance);

async function fetchWithCookies(url) {
  if (!process.env.COOKIESERVER || process.env.COOKIESERVER === 'undefined') {
    return undefined;
  }
  var cookieData = {
    url: url,
    token: "free"
  }
  try {
    var response = await axios.post(`${process.env.COOKIESERVER}/api/v1/getcookie`, cookieData);
    if (response.data.status == true) {
      return response.data;
    }
  } catch (error) {
    console.error('Error fetching the URL:', error);
  }
}

module.exports = { fetchWithCookies };