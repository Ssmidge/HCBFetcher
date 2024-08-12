import HCBFetcher from "../core/HCBFetcher.mts";
import Module from "../types/Module.ts";
import Fastify from 'fastify';

export default class WebAPI extends Module {
    router: Fastify.FastifyInstance;
    constructor({ organization, client }: { organization: string, client: HCBFetcher }) {
        super({ organization, client });
        this.id = "webapi";
        this.multiHandler = true;
        this.router = Fastify({ 
            // TODO: Implement custom logger (https://stackoverflow.com/a/55266062)
            logger: false,
        });
    }

    public async sendOutput({ organizations }: { organizations?: string[] }) : Promise<any> {
        this.router.get('/', async (request, reply) => {
            return {
                status: "OK",
                routes: [],
            }
        });

        try {
            this.router.listen({ port: 3000 })
          } catch (err) {
            this.router.log.error(err)
            process.exit(1)
        }
    }
}