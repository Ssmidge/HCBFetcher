/* eslint-disable @typescript-eslint/no-unused-vars */
import axios from 'axios';
import { Card, Organization, Transaction } from '../types/HCB.ts';
import { Cache, CacheExpiration, CacheName } from '../types/Cache.mts';
import { validateJSON } from '../utils/JSONUtils.ts';

// TODO: Remove in next release
// const organizationCache = new nodeCache({ stdTTL: 600, checkperiod: 120, useClones: false });
// const organizationTransactionCache = new nodeCache({ stdTTL: 600, checkperiod: 120, useClones: false });
// const transactionCache = new nodeCache({ stdTTL: 600, checkperiod: 120, useClones: false });
// const cardCache = new nodeCache({ stdTTL: 600, checkperiod: 120, useClones: false });

export async function getOrganization({ baseUrl, organization, cache }: { baseUrl: string, organization: string, cache: Cache }) : Promise<Organization> {
  const formattedOrganization = organization.startsWith("org_") ? organization : organization.toLowerCase();
  if (!await cache.has(CacheName.Organization, formattedOrganization)) {
    // console.log(`Fetching organization ${organization} from API`);
    const response = await axios({
      method: "GET",
      headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
      },
      url: `${baseUrl}/organizations/${formattedOrganization}`,
      validateStatus: () => true,
    });

    // parse the response to see if it's json otherwise retry!!!
    if (!validateJSON(response.data)) return await getOrganization({ baseUrl, organization: formattedOrganization, cache });
    cache.set(CacheName.Organization, formattedOrganization, JSON.stringify(response.data));
  } else {
    // console.log(`Using cached organization ${organization}`);
  }
  return JSON.parse(await cache.get(CacheName.Organization, formattedOrganization)) as Organization;
}

export async function getAllOrganizationTransactions({ baseUrl, organization, cache }: { baseUrl: string, organization: string, cache: Cache }) : Promise<Transaction[]> {
  const formattedOrganization = organization.startsWith("org_") ? organization : organization.toLowerCase();
  if (!await cache.has(CacheName.OrganizationTransactions, formattedOrganization)) {
    const response = await axios({
      method: "GET",
      headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
      params: {
        "expand": "organization,user,ach_transfer,check,donation,invoice,transfer,card_charge",
        "per_page": "15"
      },
      url: `${baseUrl}/organizations/${formattedOrganization}/transactions`,
      validateStatus: () => true,
    });

    if (!validateJSON(response.data)) return await getAllOrganizationTransactions({ baseUrl, organization: formattedOrganization, cache });
    cache.set(CacheName.OrganizationTransactions, formattedOrganization, JSON.stringify(response.data), CacheExpiration.ONE_MINUTE);
    // console.log(`Fetched ${response.data.length} transactions for organization ${organization} from API`);
  } else {
    // console.log(`Using ${(organizationTransactionCache.get(organization) as Transaction[]).length} cached transactions for organization ${organization}`);
  }

  return JSON.parse(await cache.get(CacheName.OrganizationTransactions, formattedOrganization)) as Transaction[];
}

export async function getCard({ baseUrl, cardId, cache }: { baseUrl: string, cardId: string, cache: Cache }) : Promise<Card> {
  if (!await cache.has(CacheName.Card, cardId)) {
    const response = await axios({
      method: "GET",
      headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
      params: {
        "expand": "owner,organization,card",
        "per_page": "15"
      },
      url: `${baseUrl}/cards/${cardId}`,
      validateStatus: () => true,
    });
  
    if (!validateJSON(response.data)) return await getCard({ baseUrl, cardId, cache });
    cache.set(CacheName.Card, cardId, JSON.stringify(response.data));
    // console.log(`Fetched data about card ${cardId} from API`);
  } else {
    // console.log(`Using cached card data about card ${cardId}`);
  }

  return JSON.parse(await cache.get(CacheName.Card, cardId) || {}) as Card;
}

export async function getTransaction({ baseUrl, transactionId, cache }: { baseUrl: string, transactionId: string, cache: Cache }) : Promise<Transaction> {
  if (!await cache.has(CacheName.Transaction, transactionId)) {
    const response = await axios({
      method: "GET",
      headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
      params: {
        "expand": "user,organization,ach_transfer,check,donation,invoice,transfer,card_charge,card",
        "per_page": "15"
      },
      url: `${baseUrl}/transactions/${transactionId}`,
      validateStatus: () => true,
    });
  
    if (!validateJSON(response.data)) return await getTransaction({ baseUrl, transactionId, cache });
    cache.set(CacheName.Transaction, transactionId, JSON.stringify(response.data));
    // console.log(`Fetched data about transaction ${transactionId} from API`);
  } else {
    // console.log(`Using cached transaction data about transaction ${transactionId}`);
  }

  return JSON.parse(await cache.get(CacheName.Transaction, transactionId) || {}) as Transaction;
}

export async function getAllTransparentOrganizations({ baseUrl, cache }: { baseUrl: string; cache: Cache }) : Promise<Organization[]> {
  // some meth to make it get every single page
  let organizations: Organization[] = [];
  let page = 1;

  if (!await cache.has(CacheName.Organization, "all")) {
    for (;;) {
      const response = await axios({
        method: "GET",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
          },
        params: {
          "expand": "balances",
          "per_page": "15",
          "page": page
        },
        url: `${baseUrl}/organizations`,
        validateStatus: () => true,
      });

      
      if (response.data.length === 0) break;
      organizations = organizations.concat(response.data);
      page++;
    }

    if (!validateJSON(organizations)) return await getAllTransparentOrganizations({ baseUrl, cache });
    cache.set(CacheName.Organization, "all", JSON.stringify(organizations));
  }

  return JSON.parse(await cache.get(CacheName.Organization, "all")) as Organization[];;
}