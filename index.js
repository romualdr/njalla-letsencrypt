const configuration = require('./configuration')
const fastify = require('fastify')({ logger: { level: 'warn' }})
const getRootDomain = require('extract-domain')
const { login, getDomains, getRecords, update, add, remove } = require('njalla-dns')

fastify.register(require('fastify-basic-auth'), { validate: async (username, password, req, reply) => {
    if (configuration.disableAuthentication)
        return
    if (!username || !password)
        return new Error('Invalid credentials')
    if (username !== configuration.username || password !== configuration.password)
        return new Error('Invalid credentials')
}})

const getInformations = async (body, { doLogin, checkContent }) => {
    const rootDomain = getRootDomain(body.fqdn.substring(0, body.fqdn.length - 1))

    if (doLogin)
        await login(configuration.dnsUsername, configuration.dnsPassword)
    const domains = await getDomains()
    const domain = domains.find((d) => d === rootDomain)
    
    if (!domain)
        throw new Error(`Unable to find domain ${rootDomain}`)
    
    const records = await getRecords(domain)
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
            request.log.warn(`Adding DNS record for ${domain}`)
            await add(domain, 'TXT', body.fqdn, body.value, 900)
        } else {
            request.log.warn(`Updating DNS record for ${domain} - record: ${record.name}`)
            await update(domain, record, { content: body.value })
        }

        request.log.warn(`Successfully updated DNS record for ${domain}`)
        return { ok: true }
    })
    
    fastify.post('/cleanup', { preHandler: fastify.basicAuth }, async (request, res) => {
        const { body } = request
        const { record, domain } = await getInformations(body, { checkContent: true })
        
        request.log.warn(`Cleaning DNS record for ${domain}`)
        
        if (record) {
            request.log.warn(`Removing DNS record ${record.name}`)
            await remove(domain, record)
        }
        
        request.log.warn(`Successfully cleaned DNS record for ${domain}`)
        return { ok: true }
    })
})


fastify.listen(configuration.port, '0.0.0.0', () => console.log(`Listening on ${configuration.port}`))