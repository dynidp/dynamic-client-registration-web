import {OidcProvider, OidcContext, OidcProviderProps} from "./OidcProvider";
import  * as auth from "./AuthProvider";
export default {
    Context: OidcContext,
    Provider: OidcProvider
}

export const AuthContext= OidcContext;
export const AuthProvider= OidcProvider;