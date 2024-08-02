import axios from 'axios';

export async function getOrganization({ baseUrl, organization }: { baseUrl: string, organization: string }) {
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