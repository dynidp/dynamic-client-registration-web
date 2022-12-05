import axios from "axios";
import {Interpreter} from 'xstate'
import {Token} from "../machines/oidcProviderMachine";


declare type TokenService=Interpreter<{token:Token}>;
declare type Props={tokenService:TokenService};

function createHttpClient ({tokenService}: Props){
  const httpClient = axios.create({
    withCredentials: true,
  });

  httpClient.interceptors.request.use((config) => { 
    const accessToken = tokenService.getSnapshot()?.context?.token?.access_token;
    if(accessToken){
      // @ts-ignore
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }


    return config;
  });
  
  return httpClient;
}


export { createHttpClient };
