import {GigyaSdk} from "../gigya/gigyaLoadMachine";
import {appMachine, AppMachine, appModel, Assets} from "./appMachine";
import {omit} from "lodash/fp";
import {AnyRecord, PortalApplication, User} from "../models";
import {spawn} from "xstate";

export function gigyaAppMachine(app: PortalApplication, { user,  service}:{ user?:User , service: GigyaSdk}): AppMachine {
    const {orgId} = user?.organization || {};
    return appMachine.withContext({
        id: app.id,
        service: service,
        user: user,
        org:orgId,
        app: app,
        error: undefined,
        assets: undefined,
        action: app.action
    }).withConfig({
        services: {
            fetchAssets: (ctx, event) => (send) => {
                const payload = omit("type", event);
                return ctx.service.getAssetsAsync({appId: ctx.id, ...payload})
                    .then(function ({allowedAssets}: { allowedAssets: [] }) {
                        if (allowedAssets && allowedAssets.length) {
                            send({type: "FOUND", assets: allowedAssets})
                        }
                    })
                    .catch(function (err: any) {
                        send({type: "ERROR", error: err})
                    })
            },
            open: (ctx, event, {data})=>{     
                const payload = {...event, ...data};
                const {action} = payload;
                if(action === "OPEN_DELEGATED_ADMIN"){
                   return ctx.service.openDelegatedAdminAsync({orgId: ctx.org});
                }

                if(action === "GO_TO_ACCOUNT"){
                    return ctx.service.showScreenSetAsync({...payload, 
                        screenSet: "Default-ProfileUpdate",
                         containerID: "edit_profile_placeholder",
                    });
                }
                
                 
            }
           
        }
    });
}

