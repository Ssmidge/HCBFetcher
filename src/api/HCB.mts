import axios from 'axios';
import { Card, Organization, Transaction } from '../types/HCB.ts';
import { Cache, CacheName } from '../types/Cache.mts';


// TODO: Remove in next release
// const organizationCache = new nodeCache({ stdTTL: 600, checkperiod: 120, useClones: false });
// const organizationTransactionCache = new nodeCache({ stdTTL: 600, checkperiod: 120, useClones: false });
// const transactionCache = new nodeCache({ stdTTL: 600, checkperiod: 120, useClones: false });
// const cardCache = new nodeCache({ stdTTL: 600, checkperiod: 120, useClones: false });

export async function getOrganization({ baseUrl, organization, cache }: { baseUrl: string, organization: string, cache: Cache }) : Promise<Organization> {
  if (!await cache.has(CacheName.Organization, organization.toLowerCase())) {
    // console.log(`Fetching organization ${organization} from API`);
    const response = await axios({
      method: "GET",
      headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
      },
      url: `${baseUrl}/organizations/${organization}`,
      validateStatus: () => true,
    });
  
    cache.set(CacheName.Organization, organization.toLowerCase(), JSON.stringify(response.data));
  } else {
    // console.log(`Using cached organization ${organization}`);
  }
  return JSON.parse(await cache.get(CacheName.Organization, organization.toLowerCase())) as Organization;
}

export async function getAllOrganizationTransactions({ baseUrl, organization, cache }: { baseUrl: string, organization: string, cache: Cache }) : Promise<Transaction[]> {
  if (!await cache.has(CacheName.OrganizationTransactions, organization.toLowerCase())) {
    const response = await axios({
      method: "GET",
      headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
      params: {
        "expand": "user,ach_transfer,check,donation,invoice,transfer,card_charge",
        "per_page": "15"
      },
      url: `${baseUrl}/organizations/${organization}/transactions`,
      validateStatus: () => true,
    });
  
    cache.set(CacheName.OrganizationTransactions, organization.toLowerCase(), JSON.stringify(response.data));
    // console.log(`Fetched ${response.data.length} transactions for organization ${organization} from API`);
  } else {
    // console.log(`Using ${(organizationTransactionCache.get(organization) as Transaction[]).length} cached transactions for organization ${organization}`);
  }

  return JSON.parse(await cache.get(CacheName.OrganizationTransactions, organization.toLowerCase())) as Transaction[];
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
  
    cache.set(CacheName.Transaction, transactionId, JSON.stringify(response.data));
    // console.log(`Fetched data about transaction ${transactionId} from API`);
  } else {
    // console.log(`Using cached transaction data about transaction ${transactionId}`);
  }

  return JSON.parse(await cache.get(CacheName.Transaction, transactionId) || {}) as Transaction;
}