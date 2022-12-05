import {AnyInterpreter, AnyState} from "xstate";
import {SnackbarContext} from "../machines/snackbarMachine";
import {useEffect} from "react";

export const useSnackbar=(service:AnyInterpreter)=>{
    const showSnackbar = (payload: SnackbarContext) => service.send({type: "SHOW", ...payload});

    useEffect(() => {
        if (service) {
            const subscription = service.subscribe((state: AnyState) => {
                // simple state logging
                console.log(state);
                showSnackbar({message: state.value.toString(), severity: "info"})

            });
            return subscription.unsubscribe;

        }
        return () => {
        };

    }, [service]);
}