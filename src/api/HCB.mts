import axios from 'axios';
import { Organization, Transaction } from '../types/HCB.ts';

export async function getOrganization({ baseUrl, organization }: { baseUrl: string, organization: string }) : Promise<Organization> {
  const response = await axios({
    method: "GET",
    headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
    },
    url: `${baseUrl}/organizations/${organization}`
  });

  return response.data;
}

export async function getAllOrganizationTransactions({ baseUrl, organization }: { baseUrl: string, organization: string }) : Promise<Transaction[]> {
  const response = await axios({
    method: "GET",
    headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
    },
    url: `${baseUrl}/organizations/${organization}/transactions`
  });

  return response.data;
}