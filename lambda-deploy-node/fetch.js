//dev 6
const https = require('https');

module.exports = async function fetch(method, url, body) {
  return new Promise((resolve, reject) => {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
  
    const req = https.request(url, options, (res) => {
      let result = '';

      res.on('end', () => {
        let body;
        try {
          body = JSON.parse(result);
        } catch (e) {
          resolve({
            url,
            body,
            status: result,
          });
          
          return;
        }
        resolve({
          url,
          body,
          status: res.statusCode,
        });
      });

      res.on('data', (d) => {
        if (res.statusCode >= 300) {
          reject({
            url,
            status: res.statusCode,
            error: d.toString(),
          });
        } else {
          result += d.toString();
        }
      });
    });
    if (body) {
        req.write(JSON.stringify(body));
    }
    req.end();
  });
}