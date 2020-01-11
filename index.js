const configuration = require('./configuration')
const fastify = require('fastify')({ logger: { level: 'warn' }})
const parseDomain = require('parse-domain')
const { login, getDomains, getRecords, update, add, remove } = require('njalla-dns')

fastify.register(require('fastify-basic-auth'), { validate: async (username, password, req, reply) => {
    if (configuration.disableAuthentication)
        return
    if (!username || !password)
        return new Error('Invalid credentials')
    if (username !== configuration.username || password !== configuration.password)
        return new Error('Invalid credentials')
}})

const getInformations = async (body, doLogin) => {
    const parsed = parseDomain(body.fqdn.substring(0, body.fqdn.length - 1))
    const toFind = `${parsed.domain}.${parsed.tld}`
    
    if (doLogin)
        await login(configuration.dnsUsername, configuration.dnsPassword)
    const domains = await getDomains()
    const domain = domains.find((d) => d === toFind)
    
    if (!domain)
        throw new Error(`Unable to find domain ${toFind}`)
    
    const records = await getRecords(domain)
    const record = records.find((record) => record.name === body.fqdn)
    return { domain, record }
}

fastify.after(() => {
    fastify.addHook('preHandler', fastify.basicAuth)
  
    fastify.post('/present', async (request, res) => {
        const { body } = request
        const { record, domain } = await getInformations(body, true)
        
        request.log.warn(`Updating DNS record for ${domain}`)
        
        if (!record)
            await add(domain, 'TXT', body.fqdn, body.value, 900)
        else
            await update(domain, record, { content: body.value })
        
        request.log.warn(`Successfully updated DNS record for ${domain}`)
        return { ok: true }
    })
    
    fastify.post('/cleanup', async (request, res) => {
        const { body } = request
        const { record, domain } = await getInformations(body)
        
        request.log.warn(`Cleaning DNS record for ${domain}`)
        
        if (record)
            await remove(domain, record)
        
        request.log.warn(`Successfully cleaned DNS record for ${domain}`)
        return { ok: true }
    })
})


fastify.listen(configuration.port, '0.0.0.0', () => console.log(`Listening on ${configuration.port}`))