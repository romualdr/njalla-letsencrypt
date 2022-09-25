const configuration = require('./configuration')
const fastify = require('fastify')({ logger: { level: 'warn' } })
const getRootDomain = require('extract-domain')
const njalla = require('njalla-dns')
const dns = njalla(configuration.dnsKey)

fastify.register(require('fastify-basic-auth'), {
    validate: async (username, password, req, reply) => {
        if (configuration.disableAuthentication)
            return
        if (!username || !password)
            return new Error('Invalid credentials')
        if (username !== configuration.username || password !== configuration.password)
            return new Error('Invalid credentials')
    }
})

const getInformations = async (body, { doLogin, checkContent }) => {
    const rootDomain = getRootDomain(body.fqdn.substring(0, body.fqdn.length - 1))

    const domains = await dns.getDomains()
    const domain = domains.find((d) => d.name === rootDomain)

    if (!domain)
        throw new Error(`Unable to find domain ${rootDomain}`)

    const records = await dns.getRecords(domain)
    const record = records.find((record) => `${record.name}.${rootDomain}.` === body.fqdn && (!checkContent || body.value === record.content))
    return { domain, record }
}

fastify.after(() => {
    fastify.get('/healthcheck', async (request, res) => {
        return { ok: true }
    })

    fastify.post('/present', { preHandler: fastify.basicAuth }, async (request, res) => {
        const { body } = request
        const { record, domain } = await getInformations(body, { doLogin: true })

        if (!record) {
            request.log.warn(`Adding DNS record for ${domain.name}`)
            await dns.add(domain, 'TXT', body.fqdn, body.value, 900)
        } else {
            request.log.warn(`Updating DNS record for ${domain.name} - record: ${record.name}`)
            await dns.update(domain, record, { content: body.value })
        }

        request.log.warn(`Successfully updated DNS record for ${domain.name}`)
        return { ok: true }
    })

    fastify.post('/cleanup', { preHandler: fastify.basicAuth }, async (request, res) => {
        const { body } = request
        const { record, domain } = await getInformations(body, { checkContent: true })

        request.log.warn(`Cleaning DNS record for ${domain.name}`)

        if (record) {
            request.log.warn(`Removing DNS record ${record.name}`)
            await dns.remove(domain, record)
        }

        request.log.warn(`Successfully cleaned DNS record for ${domain.name}`)
        return { ok: true }
    })
})


fastify.listen(configuration.port, '0.0.0.0', () => console.log(`Listening on ${configuration.port}`))