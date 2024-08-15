/* eslint-disable @typescript-eslint/no-unused-vars */
import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import WebAPI from "../WebAPI.mts";
import { Transaction } from "../../types/HCB.ts";

export default function (fastify: Fastify.FastifyInstance, options: FastifyPluginOptions, done: () => void) {
    fastify.decorate('utility', function () {});
    const { webApi }: { webApi: WebAPI } = options;

    fastify.get('/hcb/organizations', async (request : FastifyRequest, reply : FastifyReply) => {
        return {
            status: "OK",
            organizations: await Promise.all(options.organizations.map(async (org: string) => {
                const organization = await webApi.getOtherHCBOrganization(org);
                return {
                    id: organization.id,
                    slug: organization.slug,
                    name: organization.name,
                    users: organization.users.length,
                };
            })),
        };
    });
    
    fastify.get('/hcb/organizations/:organization', async (request : FastifyRequest, reply : FastifyReply) => {
        const organization = await webApi.getOtherHCBOrganization((request.params as { organization: string }).organization);
        if (!organization) return { status: "NOT_FOUND" };
        if (organization.message) return { status: "ERROR", message: organization.message };
        const orgTransactions = await webApi.getOtherHCBOrganizationTransactions((request.params as { organization: string }).organization);
        return {
            status: "OK",
            id: organization.id,
            slug: organization.slug,
            name: organization.name,
            users: organization.users.length,
            transactions: orgTransactions.map((transaction: Transaction) => {
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

    fastify.get('/hcb/transactions/:transaction', async (request : FastifyRequest, reply : FastifyReply) => {
        const transaction = await webApi.getHCBTransaction((request.params as { transaction: string }).transaction);
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

    fastify.get('/hcb/cards/:card', async (request : FastifyRequest, reply : FastifyReply) => {
        const card = await webApi.getHCBCard((request.params as { card: string }).card);
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

    done();
}

declare type FastifyPluginOptions = {
    webApi: WebAPI;
    organizations: string[];
};