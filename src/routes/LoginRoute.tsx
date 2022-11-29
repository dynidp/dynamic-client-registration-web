import {AuthService} from "../machines/authMachine";
import SignIn from "../components/SignIn";
import { useActor } from "@xstate/react";
import {NotificationsService} from "../machines/notificationsMachine";

export function LoginRoute({authService,...props}: { authService: AuthService , notificationsService: NotificationsService}) {
    const [state] = useActor(authService)
    switch (true) {
        case state.matches('login.signup'):
            return <SignIn  {...props} authService={authService} />
        default:
            return <SignIn {...props}  authService={authService}/>
    }


}