import axios from 'axios';
import nodeCache from 'node-cache';
import { Card, Organization, Transaction } from '../types/HCB.ts';

const organizationCache = new nodeCache({ stdTTL: 600, checkperiod: 120, useClones: false });
const organizationTransactionCache = new nodeCache({ stdTTL: 600, checkperiod: 120, useClones: false });
const transactionCache = new nodeCache({ stdTTL: 600, checkperiod: 120, useClones: false });
const cardCache = new nodeCache({ stdTTL: 600, checkperiod: 120, useClones: false });

export async function getOrganization({ baseUrl, organization }: { baseUrl: string, organization: string }) : Promise<Organization> {
  // console.log(`HCB - getOrganization - PreSet - ${organization} - ${organizationCache.keys()}`);
  if (!organizationCache.has(organization.toLowerCase())) {
    console.log(`Fetching organization ${organization} from API`);
    const response = await axios({
      method: "GET",
      headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
      },
      url: `${baseUrl}/organizations/${organization}`,
      validateStatus: () => true,
    });
  
    organizationCache.set(organization.toLowerCase(), response.data);
    // console.log(`HCB - getOrganization - PostSet - ${organization} - ${organizationCache.keys()}`);
  } else {
    console.log(`Using cached organization ${organization}`);
  }
  return organizationCache.get(organization.toLowerCase()) as Organization;
}

export async function getAllOrganizationTransactions({ baseUrl, organization }: { baseUrl: string, organization: string }) : Promise<Transaction[]> {
  if (!organizationTransactionCache.has(organization)) {
    const response = await axios({
      method: "GET",
      headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
      params: {
        "expand": "user,organization,ach_transfer,check,donation,invoice,transfer,card_charge",
        "per_page": "15"
      },
      url: `${baseUrl}/organizations/${organization}/transactions`,
      validateStatus: () => true,
    });
  
    organizationTransactionCache.set(organization, response.data);
    console.log(`Fetched ${response.data.length} transactions for organization ${organization} from API`);
  } else {
    console.log(`Using ${(organizationTransactionCache.get(organization) as Transaction[]).length} cached transactions for organization ${organization}`);
  }

  return organizationTransactionCache.get(organization) || [];
}

export async function getCard({ baseUrl, cardId }: { baseUrl: string, cardId: string }) : Promise<Card> {
  if (!cardCache.has(cardId)) {
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
  
    cardCache.set(cardId, response.data);
    console.log(`Fetched data about card ${cardId} from API`);
  } else {
    console.log(`Using cached card data about card ${cardId}`);
  }

  return cardCache.get(cardId) || {} as Card;
}

export async function getTransaction({ baseUrl, transactionId }: { baseUrl: string, transactionId: string }) : Promise<Transaction> {
  if (!transactionCache.has(transactionId)) {
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
  
    transactionCache.set(transactionId, response.data);
    console.log(`Fetched data about transaction ${transactionId} from API`);
  } else {
    console.log(`Using cached transaction data about transaction ${transactionId}`);
  }

  return transactionCache.get(transactionId) || {} as Transaction;
}