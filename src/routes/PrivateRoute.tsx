import SignIn from "../components/SignIn";
import { useEffect } from "react";
import { useActor } from "@xstate/react";
import {LoginRoute} from "./LoginRoute";
import {AuthService} from "../machines/authMachine";
import { RouteComponentProps } from "@reach/router";
import Organization from "../components/Organization";
import {NotificationsService} from "../machines/notificationsMachine";
export interface Props extends RouteComponentProps {
    authService: AuthService;
    notificationsService: NotificationsService,
    as: any;


}
export function PrivateRoute({authService,notificationsService, as: Comp, ...props}: Props) {
    const [state, send] = useActor(authService);
    useEffect(() => {
        if (state.matches('unauthorized')) {
            send('LOGIN')
        }
    }, [state]);

    switch (true) {
        case state == undefined:
            return <LoginRoute authService={authService}/>;

        case state.matches('loggedIn'):
            return  <Comp {...props} authService={authService} notificationsService={notificationsService}/>
      
        case state.matches('organization'):
            return  <Organization {...props} authService={authService}/>
 
        default:
            return <LoginRoute authService={authService}/>
    }


}