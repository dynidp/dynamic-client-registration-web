import {AuthMachineContext, AuthMachineEvents} from "../authMachine";
import {Client, DrContext, Issuer} from "./oidc_dr_machine";
import  axios from "axios";
const AAD_MULTITENANT = Symbol();
const ISSUER_DEFAULTS = {
    claim_types_supported: ['normal'],
    claims_parameter_supported: false,
    grant_types_supported: ['authorization_code', 'implicit'],
    request_parameter_supported: false,
    request_uri_parameter_supported: true,
    require_request_uri_registration: false,
    response_modes_supported: ['query', 'fragment'],
    token_endpoint_auth_methods_supported: ['client_secret_basic'],
};

export type InvokeRegistrationSrc={
    data: {
        registration_endpoint: string,
        redirect_uris: string[]
        client_name: string
    }
};export type InvokeDiscoverySrc={
    data: {
        authority: string,
    }
};

export const oidc_dr_registration_service = async (context: DrContext, event: any, src: InvokeRegistrationSrc):Promise<{client: Client}> => {

    const {registration_endpoint, client_name, redirect_uris} = {...context.issuer?.metadata,...context?.config,...src.data} ;
 
    var options = {
        method: 'POST',
        url: registration_endpoint,
        headers: {'Content-Type': 'application/json'},
        data: {
            client_name: client_name,
            redirect_uris: redirect_uris
        }
    };

    const  {data} = await axios.request(options);
    return {client: data};


}
export const oidc_discovery_service = async (context: DrContext, event: any, src: InvokeDiscoverySrc):Promise<{issuer: Issuer}> => {

    const {authority} = src?.data|| context;
    const url = authority.endsWith('/') ? `${authority}.well-known/openid-configuration` : `${authority}/.well-known/openid-configuration`;


    const  {data} = await axios.request({
        method: 'GET',
        responseType: 'json',
        url: url,
        headers: {
            Accept: 'application/json',
        },
    });

    return {
       issuer:{
           metadata:{
               ...ISSUER_DEFAULTS,
               ...data
           }
       } 

    };



}

