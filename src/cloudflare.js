const cloudscraper = require('cloudscraper');

async function request(options) {
    return new Promise((resolve, reject) => {
        const requestOptions = {
            ...options,
            followAllRedirects: true,
            gzip: true,
        };

        if (process.env.REQUEST_PROXY) {
            requestOptions.proxy = process.env.REQUEST_PROXY;
        }

        if (requestOptions.method && requestOptions.method.toUpperCase() === 'POST') {
            if (requestOptions.data && typeof requestOptions.data === 'object') {
                requestOptions.form = requestOptions.data;
                delete requestOptions.data;
            } else if (requestOptions.data && typeof requestOptions.data === 'string') {
                requestOptions.body = requestOptions.data;
                delete requestOptions.data;
            }
        }

        cloudscraper.request(requestOptions, (error, response, body) => {
            if (error) {
                return reject(error);
            }

            resolve({
                status: response && response.statusCode,
                statusText: response && response.statusMessage,
                headers: response && response.headers,
                data: body,
            });
        });
    });
}

module.exports = { request };