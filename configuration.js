require('dotenv').config()

module.exports = {
    username: process.env['HTTPREQ_USERNAME'],
    password: process.env['HTTPREQ_PASSWORD'],
    dnsKey: process.env['NJALLA_API_KEY'],
    port: process.env['PORT'] || 8080,
    disableAuthentication: process.env['DISABLE_AUTHENTICATION']
}
