import { getProvider, getSigner } from "../factory";
import { random } from "lodash";
import axios from 'axios';

// export async function fetchGet(url: string, params?: any) {
//   if(params) url =  `${url}?${(new URLSearchParams(params)).toString()}`;
//   const response: any = await fetch(url, {
//     method: 'GET', // *GET, POST, PUT, DELETE, etc.
//     mode: 'cors', // no-cors, *cors, same-origin
//     headers: {
//       'Content-Type': 'application/json'
//     },
//   });

//   return response.json();
// }


export async function fetchGet(url: string, params?: any) {
  if(params) url =  `${url}?${(new URLSearchParams(params)).toString()}`;

  const response = await axios.get(url);
  return response.data;
}

export function getSafeOwnerAddress(): Promise<string> {
  const signer = getSigner();
  return signer.getAddress();
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