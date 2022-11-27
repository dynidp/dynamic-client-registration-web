import {getAccount, getApps} from "../gigya/gigyaAuthService";
import {omit} from "lodash/fp";
import {AuthMachine, authModel} from "./authMachine";
import {GigyaSdk, gigyaService, loader} from "../gigya/gigyaLoadMachine";
import {AppMachine, appMachine} from "./appMachine";
import { spawn } from "xstate";
import {gigyaAppMachine} from "./gigyaAppMachine";
import { portalApplicationMachine } from "./portalApplication";



export const withGigya = (authMachine: AuthMachine) => authMachine.withContext({
    ...authMachine.context,
    loader: loader,
    
}).withConfig({
    services: {
        loader: (context, event) => loader,
        registerOrganization: (ctx, event) => (send) => {
            const payload = omit("type", event);
            const context = omit("service", ctx);
            const show = async (payload: any) => {
                try {
                    const response = await ctx.service.showScreenSetAsync(payload);
                    send({type: "ORGANIZATION.REGISTER.SUCCESS", organization: response});

                } catch (e) {
                    send({type: "ORGANIZATION.REGISTER.ERROR", error: e});
                }
            }
            // @ts-ignore
            return show({
                containerID: context.container,
                screenSet: `Default-OrganizationRegistration`, ...payload
            });
        },
        showLogin: (ctx, event, {data, src, meta}) => {
            const payload = omit("type", event);
            const context = omit("service", ctx); 
            const args={containerID: context.container, ...payload, ...data}; 
            ctx.service &&  ctx.service.showLoginScreenSetAsync(args);
            return ctx.service.$login;
        },
        showLoginCallback: (ctx, event, {data, src, meta}) => (send)=>{
            const payload = omit("type", event);
            const context = omit("service", ctx);
            if(!ctx.service){
                send({type:"ERROR",  error:"Pending gigya load"});
                return ;
            }
          
            const args={containerID: context.container, ...payload, ...data};
            ctx.service.accounts.showScreenSet(
                {
                    screenSet: "Default-RegistrationLogin",
                    startScreen: 'gigya-login-screen',
                    ...args,
                    onError: (e:any)=> send({type:"ERROR",  error:e}),
                    OnLogin: (e:any)=> send({type:"LOGGED_IN",  user: e})
                });
          
            return ()=>{};
        },
        fetchAccount: (ctx, event) => (send) => {
            const payload = omit("type", event);
            getAccountAsync(payload)
                .then(function ({user}) { 
                    send({type: "ACCOUNT", user})
                })
                .catch(function (err) {
                    send({type: "ACCOUNT_MISSING", error:err})
                })
        },
       
      
        fetchAccountCallback:  (ctx, event) => (callback, onReceive) => {
            // This will send the 'INC' event to the parent every second
            const args = omit("type", event);
            ctx.service.accounts.getAccountInfo({
                ...(args || {}),
                include: "all",
                callback: function (res:any) {
                    if (res.errorCode === 0) {
                        const user = {...res, ...(res?.profile || {}), photo: res?.profile?.photoURL};

                        callback({type: "ACCOUNT", user})

                    } else {
                        callback("ACCOUNT_MISSING")                    }

                }
            });
            // Perform cleanup
            return () => {};
      
           
        },
        logout: (ctx, event) => (send) => {
            ctx.service.logout({callback: () => send({type: "LOGGED_OUT"})})

        },
    },

    actions: {
        assignService: authModel.assign({
            service: (_: any, ev: { type: "LOADED", service: any; }) => ev.service
        }),
        assignApp: authModel.assign({
            app: (ctx,e)=>  spawn(
                portalApplicationMachine(gigyaAppMachine(ctx.service.config.portal, {service:ctx.service, user:ctx.user}))
           , { sync: true } )
        }),
    }
});

 

async function getAccountAsync(payload: any) {
    const account = await getAccount(payload);
    const organizations=account?.groups?.organizations || [];

    const user = {...account, ...(account?.profile || {}), photo: account?.profile?.photoURL, organization:organizations.pop()};

    return {  user}
}

function decodeJwt(token?: string) {

    return token && token.split && JSON.parse(atob(token.split('.')[1]));

}

