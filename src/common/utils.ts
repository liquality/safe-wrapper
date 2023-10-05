import { getProvider, getWallet } from "../factory";
import { random } from "lodash";

export async function fetchGet(url: string, params?: any) {
  if(params) url =  `${url}?${(new URLSearchParams(params)).toString()}`;
  const response: any = await fetch(url, {
    method: 'GET', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    headers: {
      'Content-Type': 'application/json'
    },
  });

  return response.json();
}

export function getSafeOwnerAddress() {
  return getWallet().address;
}

export async function getChainID() {
  return Number((await getProvider().getNetwork()).chainId);
}


export async function withInterval<T>(
  func: () => Promise<T | undefined>
): Promise<T> {
  const updates = await func();
  if (updates) {
    return updates;
  }
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      const updates = await func();
      if (updates) {
        clearInterval(interval);
        if(updates instanceof Error) reject(updates)
        else resolve(updates);
      }
    }, random(5000, 10000));
  });
}