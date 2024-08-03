import axios from 'axios';
import nodeCache from 'node-cache';
import { Organization, Transaction } from '../types/HCB.ts';

const organizationCache = new nodeCache({ stdTTL: 600, checkperiod: 120, useClones: false });
const transactionCache = new nodeCache({ stdTTL: 600, checkperiod: 120, useClones: false });

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
  if (!transactionCache.has(organization)) {
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
  
    transactionCache.set(organization, response.data);
    console.log(`Fetched ${response.data.length} transactions for organization ${organization} from API`);
  } else {
    console.log(`Using ${(transactionCache.get(organization) as Transaction[]).length} cached transactions for organization ${organization}`);
  }

  return transactionCache.get(organization) || [];
}