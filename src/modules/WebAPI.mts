import HCBFetcher from "../core/HCBFetcher.mts";
import { Organization } from "../types/HCB.ts";
import Module from "../types/Module.ts";
import Fastify, { FastifyReply, FastifyRequest } from 'fastify';

export default class WebAPI extends Module {
    static multiHandler: boolean = true;
    router: Fastify.FastifyInstance;
    constructor({ organization, client, isMultiHandler } : { organization: string, client: HCBFetcher, isMultiHandler?: boolean }) {
        super({ organization, client, isMultiHandler });
        this.id = "webapi";
        this.router = Fastify({ 
            // TODO: Implement custom logger (https://stackoverflow.com/a/55266062)
            logger: false,
        });
    }

    public async sendOutput() : Promise<any> {
        await this.addRoutes();

        try {
            this.router.listen({ port: 3000 })
          } catch (err) {
            this.router.log.error(err)
            process.exit(1)
        }
    }
    private async addRoutes() {
        this.router.get('/', async (request : FastifyRequest, reply : FastifyReply) => {
            return {
                status: "OK",
                routes: [],
            };
        });

        this.router.get('/health', async (request : FastifyRequest, reply : FastifyReply) => {
            return {
                status: "OK",
                url: request.url,
            };
        });

        this.router.get('/repo', async (request : FastifyRequest, reply : FastifyReply) => reply.redirect("https://github.com/Ssmidge/HCBFetcher", 301));

        this.router.get('/api/v1/modules', async (request : FastifyRequest, reply : FastifyReply) => {
            return {
                status: "OK",
                modules: this.client.moduleList.map((module) => {
                    return {
                        id: module.id,
                        organization: module.organization,
                    };
                }),
            };
        });

        this.router.get('/api/v1/hcb/organizations', async (request : FastifyRequest, reply : FastifyReply) => {
            return {
                status: "OK",
                organizations: await Promise.all(this.client.organizations.map(async (org: string) => {
                    const organization = await this.getOtherHCBOrganization(org);
                    return {
                        id: organization.id,
                        slug: organization.slug,
                        name: organization.name,
                        users: organization.users.length,
                    }
                })),
            };
        });
        
        this.router.get('/api/v1/hcb/organizations/:organization', async (request : FastifyRequest, reply : FastifyReply) => {
            const organization = await this.getOtherHCBOrganization((request.params as any).organization);
            if (!organization) return { status: "NOT_FOUND" };
            if (organization.message) return { status: "ERROR", message: organization.message };
            const orgTransactions = await this.getOtherHCBOrganizationTransactions((request.params as any).organization);
            return {
                status: "OK",
                id: organization.id,
                slug: organization.slug,
                name: organization.name,
                users: organization.users.length,
                transactions: orgTransactions.map((transaction) => {
                    return {
                        id: transaction.id,
                        date: transaction.date,
                        amount: transaction.amount_cents,
                        memo: transaction.memo,
                        status: transaction.ach_transfer?.status || transaction.check?.status || transaction.donation?.status || transaction.invoice?.status || transaction.transfer?.status || (transaction.pending ? "pending" : null) || "",
                    };
                }),
            };
        });

        this.router.get('/api/v1/hcb/transactions/:transaction', async (request : FastifyRequest, reply : FastifyReply) => {
            const transaction = await this.getHCBTransaction((request.params as any).transaction);
            if (!transaction) return { status: "NOT_FOUND" };
            if (transaction.message) return { status: "ERROR", message: transaction.message };
            return {
                status: "OK",
                id: transaction.id,
                date: transaction.date,
                amount: transaction.amount_cents,
                memo: transaction.memo,
                txStatus: transaction.ach_transfer?.status || transaction.check?.status || transaction.donation?.status || transaction.invoice?.status || transaction.transfer?.status || (transaction.pending ? "pending" : null) || "",
            };
        });

        this.router.get('/api/v1/hcb/cards/:card', async (request : FastifyRequest, reply : FastifyReply) => {
            const card = await this.getHCBCard((request.params as any).card);
            if (!card) return { status: "NOT_FOUND" };
            if (card.message) return { status: "ERROR", message: card.message };
            return {
                status: "OK",
                id: card.id,
                name: card.name,
                organization: card.organization.name,
                user: card.owner.full_name,
                cardStatus: card.status,
                type: card.type,
            };
        });
    }
}