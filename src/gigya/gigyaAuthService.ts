// @ts-nocheck - may need to be at the start of file
import gigyaWebSDK from "./gigyaWebSDK";
import {SocialPayload} from "../machines/authMachine";
import {Account, IBaseEvent, IErrorEvent} from "./models";
import {AnyRecord} from "../models";

// @ts-ignore

declare type AnyRequest = { [key: string]: any } | undefined;

export async function performSignup(args: any) {
    return new Promise((resolve, reject) => {
        initRegistration().then(regToken =>
            gigyaWebSDK().accounts.register({
                email: args.email,
                password: args.password,
                finalizeRegistration: true,
                regToken: regToken,
                callback: (response) => {
                    if (response.errorCode === 0) {
                        resolve(response);

                    } else {
                        reject(
                            `Error during registration: ${response.errorMessage}, ${response.errorDetails}`
                        );
                    }
                },
            }))

    });
}
export async function performSignupWithSS(args: any) {
    return new Promise((resolve, reject) => {

        gigyaWebSDK().accounts.showScreenSet(
            {
                ...args,
                screenSet: "Default-RegistrationLogin",
                startScreen: 'gigya-register-screen',
                onLogin: (r) => {
                    resolve(r)
                },
                callback: (response) => {
                    if (response.errorCode === 0) {
                        resolve(response);

                    }
                    if (response.errorCode !== 0) {
                        reject(
                            `Error during registration: ${response.errorMessage}, ${response.errorDetails}`
                        );
                    }
                },
            })

    });
}



export async function showLoginScreenSetAsync(args: any):Promise<Account> {
    return new Promise((resolve, reject) => {

        const onLogin =(r) => {
            resolve(r)
        }
        gigyaWebSDK().accounts.showScreenSet(
            {
                screenSet: "Default-RegistrationLogin",
                startScreen: 'gigya-login-screen',
                ...args,
                onLogin:onLogin,
                callback: (response) => {
                    if (response.errorCode === 0) {
                        resolve(response);

                    }
                    if (response.errorCode !== 0) {
                        reject(
                            `Error during registration: ${response.errorMessage}, ${response.errorDetails}`
                        );
                    }
                },
            });
        // gigyaWebSDK().accounts.addEventHandlers({
        //     onLogin: onLogin,
        // });

    });
}
export  function showLoginScreenSet(args: any, cb?: (account:Account)=> {}, error?: IErrorEvent ):void {
    const onLogin =(r) => {
        cb && cb(r)
    }; 
    gigyaWebSDK().accounts.showScreenSet(
            {
                screenSet: "Default-RegistrationLogin",
                startScreen: 'gigya-login-screen',
                ...args,
                onLogin:onLogin,
                callback: (response) => {
                    if (response.errorCode === 0) {
                        cb &&  cb(response);

                    }
                    if (response.errorCode !== 0) {
                        error && error(
                            `Error during registration: ${response.errorMessage}, ${response.errorDetails}`
                        );
                    }
                },
            });
        // gigyaWebSDK().accounts.addEventHandlers({
        //     onLogin: onLogin,
        // });

   
}
export async function openDelegatedAdminAsync(args){
    return await new Promise((resolve, reject) => {

        gigya.accounts.b2b.openDelegatedAdminLogin({
            ...(args || {}),
            onError: reject,
             callback: function (res) {
                if (res.errorCode === 0) {
                    resolve(res)
                } else {
                    reject(res)
                }

            }
        });
    })
}


function showSelfRegistration() {
    var params = {
        screenSet: "Default-OrganizationRegistration",
        containerID: "div",
        onAfterSubmit: showResponse

    };
    gigya.accounts.showScreenSet(params);

    function showResponse(eventObj) {
        if (eventObj.response.errorCode == 0) {
            document.getElementById('div').innerHTML = "<center> Request submitted</center>";
        }
    }
}

export  function showScreenSetAsync(args: any){
      return new Promise((resolve, reject) => {
        console.log('about to open screen set', args);
     

        gigya.accounts.showScreenSet(
            {
                 ...args,
                onHide: (response) => {
                    if (response.errorCode === 0) {
                        resolve(response);

                    }
                    if (response.errorCode !== 0) {
                        console.error(response);
                        reject(
                            response
                        );
                    }
                },
                onAfterSubmit: (response) => {
                    if (response.errorCode === 0) {
                        resolve(response);

                    }
                    if (response.errorCode !== 0) {
                        console.error(response);
                        reject(
                            response
                        );
                    }
                },
                onError: (error)=> {
                    console.error(response);
                    reject(error)},
                 callback: (response) => {
                    if (response.errorCode === 0) {
                        resolve(response);

                    }
                    if (response.errorCode !== 0) {

                        console.error(response);

                        reject(
                            response
                        );
                    }
                },
            });
        // gigyaWebSDK().accounts.addEventHandlers({
        //     onLogin: onLogin,
        // });

    });
}

export async function initRegistration(args: any) {
    return new Promise((resolve, reject) => {
        gigyaWebSDK().accounts.initRegistration({
            callback: (response) => {
                if (response.errorCode === 0) {
                    resolve(response.regToken);

                } else {
                    reject(
                        `Error during registration: ${response.errorMessage}, ${response.errorDetails}`
                    );
                }
            },
        });


    });
}

export async function performSignin(args) {
    return new Promise((resolve, reject) => {
        const params = {
            loginID: args.email,
            password: args.password,
            ...args
        };
        gigyaWebSDK().accounts.login(params, {
            callback: (response) => {
                if (response.errorCode === 0) {
                    resolve(response);
                } else {
                    reject(
                        `Error during login: ${response.errorMessage}, ${response.errorDetails}`
                    );
                }
            }


        });

    });

}

export function getJwt(args) {
    return new Promise((resolve, reject) => {
        gigyaWebSDK().accounts.getJWT({
            ...(args || {}),
            fields: 'phone_number,isRegistered,authMethods,email,provider',
            callback: function (res) {
                if (res.errorCode === 0) {
                    resolve(res.id_token as string)
                } else {
                    reject(res)
                }

            }
        })
    });
}




export function getAccount(args ={}): Promise<Account> {
    return new Promise((resolve, reject) => {
        gigyaWebSDK().accounts.getAccountInfo({  
            include: "groups, profile, *",

            ...(args || {}),
            callback: function (res) {
                if (res.errorCode === 0) {
                    resolve(res)
                } else {
                    reject(res)
                }

            }
        })
    });
}
export async function getAssetsAsync(args: AnyRecord & { appId:string}) {

    return new Promise((resolve, reject) => {
        gigya.accounts.b2b.auth.getAssets({
            ...args,
            callback: function (response) {
                console.log(response);
                if (response.errorCode === 0) {
                    resolve(response);

                }
                if (response.errorCode !== 0) {
                    reject(
                        response
                    );

                }
            }
        });
    });
    //get portal application assets


}

async function getAssets(appId) {

    return new Promise((resolve, reject) => {
        gigya.accounts.b2b.auth.getAssets({
            appId: appId,
            callback: function (response) {
                console.log(response);
                if (response.errorCode === 0) {
                    resolve(response.allowedAssets);

                }
                if (response.errorCode !== 0) {
                    reject(
                        `Error during registration: ${response.errorMessage}, ${response.errorDetails}`
                    );

                }
            }
        });
    });
    //get portal application assets


}

export async function getApps(appId) {
    try { 
        const assets = await getAssets(appId || config.appId);
       
        const portalApps= assets.filter(a => a.type === 'Portal Applications').map(e => {
            return {name: e.path, id: e.attributes?.app, ...(e.attributes || {})}});
        
        const delegated = assets
            .filter(e => e.attributes && e.attributes['Response Value'] && e.attributes['Response Value'][0] ==='delegated_admin')
            .map(e => {
            return {name: "Delegated Admin", id: "PBZHUUUXRMQMHMBK8AHX", ...(e.attributes || {})}});
            
          return portalApps.contact(delegated);
        }
    catch (ex) {
        console.log(ex);
        return [{
            id: "ssd",
            icon: "img/assets/products/1.svg",
            name: "Portal Application",
            info: ex.message,
            role: "Explorer"
        }]
    }
}



export type LoginParams = {
    [key: string]: any
    loginMode?: string
}

export type SocialLoginParams = SocialPayload & LoginParams

export const socialLoginAsync = (args: SocialLoginParams) => {
    return new Promise((resolve, reject) => {
        const params = {
            ...(args || {}),
            include: "all",
            callback: function (res) {
                if (res.errorCode === 0) {
                    resolve(res)
                } else {
                    reject(res)
                }

            }
        };
        window.gigya.socialize.login({...params, enabledProviders: params.provider});
    });
}
export const socialLogin = (args: { provider: string, [key: string]: any }, callback: (res) => {}) => {
    const params = {
        ...(args || {}),
        include: "all",
        callback: callback
    }
    gigyaWebSDK().socialize.login({...params, enabledProviders: params.provider});
}
export const startFlow = (args: { provider: string, [key: string]: any }, callback: (res) => {}) => {
    const params = {
        ...(args || {}),
        include: "all",
        callback: callback
    }
    gigyaWebSDK().identityFlows.start({...params, enabledProviders: params.provider});
}


export const logout = (args: AnyRequest = {}) => {
    return new Promise((resolve, reject) => {
        const params = {
            ...(args || {}),
            callback: function (res) {
                if (res.errorCode === 0) {
                    resolve(res)
                } else {
                    reject(res)
                }

            }
        };
        gigyaWebSDK().socialize.logout({...params});
    });
}

