require('dotenv').config()

module.exports = {
    username: process.env['HTTPREQ_USERNAME'],
    password: process.env['HTTPREQ_PASSWORD'],
    dnsUsername: process.env['NJALLA_USERNAME'],
    dnsPassword: process.env['NJALLA_PASSWORD'],
    port: process.env['PORT'] || 8080,
    disableAuthentication: process.env['DISABLE_AUTHENTICATION']
}
