import axios from 'axios';
import { Organization, Transaction } from '../types/HCB.ts';
import { organizationCache, transactionCache } from './Caching.mts';

export async function getOrganization({ baseUrl, organization }: { baseUrl: string, organization: string }) : Promise<Organization> {
  if (!organizationCache.has(organization)) {
    console.log(`Fetching organization ${organization} from API`);
    const response = await axios({
      method: "GET",
      headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
      },
      url: `${baseUrl}/organizations/${organization}`
    });
  
    organizationCache.set(organization, response.data);
    console.log(organizationCache.keys())
  } else {
    console.log(`Using cached organization ${organization}`);
  }
  return organizationCache.get(organization) as Organization;
}

export async function getAllOrganizationTransactions({ baseUrl, organization }: { baseUrl: string, organization: string }) : Promise<Transaction[]> {
  if (!transactionCache.has(organization)) {
    const response = await axios({
      method: "GET",
      headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
      },
      url: `${baseUrl}/organizations/${organization}/transactions`
    });
  
    transactionCache.set(organization, response.data);
    console.log(`Fetched ${response.data.length} transactions for organization ${organization} from API`);
  } else {
    console.log(`Using ${(transactionCache.get(organization) as Transaction[]).length} cached transactions for organization ${organization}`);
  }

  return transactionCache.get(organization) || [];
}