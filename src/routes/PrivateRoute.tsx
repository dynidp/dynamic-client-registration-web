import SignIn from "../components/SignIn";
import { useEffect } from "react";
import { useActor } from "@xstate/react";
import {LoginRoute} from "./LoginRoute";
import {AuthService} from "../machines/authMachine";
import { RouteComponentProps } from "@reach/router";
import {NotificationsService} from "../machines/notificationsMachine";
import {Services} from "../auth/OidcProvider";

declare type Props= RouteComponentProps & Services &{
    as: any;

}; 

export function PrivateRoute({authService,authProvider, as: Comp, ...props}: Props) {
    const [state, send] = useActor(authService);
    useEffect(() => {
        if (state.matches('unauthorized')) {
            send('LOGIN')
        }
    }, [state]);

    switch (authProvider) {
        case null:
            return <Comp {...props}  authService={authService}/>;
 
        default:
            return <LoginRoute authProvider={authProvider!} {...props}  authService={authService} />
    }


}