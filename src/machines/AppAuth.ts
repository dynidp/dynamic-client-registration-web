
/* Some interface declarations for Material design lite. */

import {AuthorizationNotifier, AuthorizationRequest, AuthorizationResponse,
    AuthorizationServiceConfiguration,
    BaseTokenRequestHandler, RedirectRequestHandler, StringMap, TokenRequest, TokenResponse, TokenRequestHandler, AuthorizationRequestHandler } from "@openid/appauth";
import {Client, Issuer} from "./oidc-client/oidc_dr_machine";
import {NotificationsService} from "./notificationsMachine";
/**
 * Snackbar options.
 */
declare interface SnackBarOptions {
    message: string;
    timeout?: number;
}

/**
 * Interface that defines the MDL Material Snack Bar API.
 */
declare interface MaterialSnackBar {
    showSnackbar: (options: SnackBarOptions) => void;
}

const redirectUri = 'http://localhost:8000/app/redirect.html';
const scope = 'openid';

/**
 * The App Auth JS application.
 */
export class AppAuthJs {
    public notifier: AuthorizationNotifier;
    private authorizationHandler: AuthorizationRequestHandler;
    private tokenHandler: TokenRequestHandler; 
    private request: AuthorizationRequest|undefined;
    private response: AuthorizationResponse|undefined;
    private code: string|undefined;
    private tokenResponse: TokenResponse|undefined;
    private configuration: AuthorizationServiceConfiguration;

    constructor(public snackbar: Element, private issuer:Issuer,         
                public clientConfig:{client_id: string,  redirect_uri:string , scope:string},
                private  notificationService: NotificationsService
    ) {
        this.configuration= new AuthorizationServiceConfiguration(issuer.metadata as any);
         this.notifier = new AuthorizationNotifier();
        this.authorizationHandler = new RedirectRequestHandler();
        this.tokenHandler = new BaseTokenRequestHandler();
        // set notifier to deliver responses
        this.authorizationHandler.setAuthorizationNotifier(this.notifier);
        // set a listener to listen for authorization responses
        this.notifier.setAuthorizationListener((request, response, error) => {
            console.log('Authorization request complete ', request, response, error);
            // @ts-ignore
            request && notificationService.send({type:'ADD', notification:{ group:"auth", title: "request", payload:request, icon:'login'}});
            // @ts-ignore
            response && notificationService.send({type:'ADD', notification:{ group:"auth", title: "response", payload:response, icon:'login', severity:'success'}});
            // @ts-ignore
            error && notificationService.send({type:'ADD', notification:{ group:"auth", title: "error", payload:response, icon:'login', severity:'error'}});
            if (response) {
                this.request = request;
                this.response = response;
                this.code = response.code;
                
                this.showMessage(`Authorization Code ${response.code}`);
            }
        });
    }

    showMessage(message: string) {
        const snackbar = (this.snackbar as any)['MaterialSnackbar'] as MaterialSnackBar;
        snackbar.showSnackbar({message: message});
    }


    makeAuthorizationRequest(options:any) {
        // create a request
        let request = new AuthorizationRequest({
            client_id: options.client_id, //this.clientConfig.client_id,
            redirect_uri: options.redirect_uri,
            scope: options.scope,
            response_type: options.response_type,
            state: JSON.stringify(options),
            extras: {'prompt': 'none', 'access_type': 'offline'}
        });
        
        // @ts-ignore
        // this.notificationService.send({type:'ADD', notification:{ group:"auth", title: "authorization-request", payload:request, icon:'login'}});
 
        if (this.configuration) {
            this.authorizationHandler.performAuthorizationRequest(this.configuration, request);
        } else {
            this.showMessage(
                'Fetch Authorization Service configuration, before you make the authorization request.');
        }
    }

    makeTokenRequest() {
        if (!this.configuration) {
            this.showMessage('Please fetch service configuration.');
            return;
        }

        let request: TokenRequest|null = null;
        if (this.code) {
            let extras: StringMap|undefined = undefined;
            if (this.request && this.request.internal) {
                extras = {};
                extras['code_verifier'] = this.request.internal['code_verifier'];
            }
            // use the code to make the token request.
            request = new TokenRequest({
                client_id: this.clientConfig.client_id,
                redirect_uri: this.clientConfig.redirect_uri,
                grant_type: "code",
                code: this.code,
                refresh_token: undefined,
                extras: extras
            });
        } else if (this.tokenResponse) {
            // use the token response to make a request for an access token
            request = new TokenRequest({
                client_id: this.clientConfig.client_id,
                redirect_uri: redirectUri,
                grant_type: "refresh_token",
                code: undefined,
                refresh_token: this.tokenResponse.refreshToken,
                extras: undefined
            });
        }

        if (request) {
            this.tokenHandler.performTokenRequest(this.configuration, request)
                .then(response => {
                    let isFirstRequest = false;
                    if (this.tokenResponse) {
                        // copy over new fields
                        this.tokenResponse.accessToken = response.accessToken;
                        this.tokenResponse.issuedAt = response.issuedAt;
                        this.tokenResponse.expiresIn = response.expiresIn;
                        this.tokenResponse.tokenType = response.tokenType;
                        this.tokenResponse.scope = response.scope;
                    } else {
                        isFirstRequest = true;
                        this.tokenResponse = response;
                    }

                    // unset code, so we can do refresh token exchanges subsequently
                    this.code = undefined;
                    if (isFirstRequest) {
                        this.showMessage(`Obtained a refresh token ${response.refreshToken}`);
                    } else {
                        this.showMessage(`Obtained an access token ${response.accessToken}.`);
                    }
                })
                .catch(error => {
                    console.log('Something bad happened', error);
                    this.showMessage(`Something bad happened ${error}`)
                });
        }
    }

    checkForAuthorizationResponse() {
        this.authorizationHandler.completeAuthorizationRequestIfPossible();
    }
}

// export App
(window as any)['App'] = AppAuthJs;
