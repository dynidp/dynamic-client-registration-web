import {AuthService} from "../machines/authMachine";
import SignIn from "../components/SignIn";
import { useActor } from "@xstate/react";
import {NotificationsService} from "../machines/notificationsMachine";
import {RouteComponentProps} from "@reach/router";
import {Services} from "../auth/OidcProvider";
declare type Props= RouteComponentProps & Services & {authProvider: Pick<Services, "authProvider">} ;
export function LoginRoute({authService,...props}:Props) {
    const [state] = useActor(authService)
    switch (true) {
        case state.matches('login.signup'):
            return <SignIn  {...props} authService={authService} />
        default:
            return <SignIn {...props}  authService={authService}/>
    }


}