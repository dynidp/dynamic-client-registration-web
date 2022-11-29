import { useEffect } from "react";
import {ActionTypes, AnyInterpreter, AnyEventObject, AnyState } from "xstate";
import {NotificationResponseItem, NotificationsEvents} from "../machines/notificationsMachine";
import { omit } from "lodash/fp";
import {AnyRecord} from "../models";
declare type  AppService= AnyInterpreter | undefined;
export function isUpdateType(state: AnyState) {
    return state.event?.type &&
        state.event.type.toLowerCase() === "xstate.update";
}
function generateUniqueID() {
    // Math.random should be unique because of its seeding algorithm.
    // Convert it to base 36 (numbers + letters), and grab the first 9 characters
    // after the decimal.
    return '_' + Math.random().toString(36).substr(2, 9);
}



export function getPayload(event: AnyEventObject, ctx: AnyRecord) {
    return {
        event:{
            ...omit(['type', 'data', 'service', 'loader'], event),
            ...(event.data || {}),

        },
        context: ctx
    };
}

function doneDetails(event: AnyEventObject): Partial<NotificationResponseItem> {
    if (event.type.indexOf('DONE.') > 0) {
        const title = `done: ${event.type.replace('DONE.INVOKE.', '').replace(':INVOCATION[0]', '')}`
        return {
            severity: 'success',
            title

        }
    }
    return {};
}


function errorDetails(event: AnyEventObject): Partial<NotificationResponseItem> {
    if (event.type.indexOf('ERROR.') > 0) {
        const title = `${event.type.toLowerCase()
            .replace(ActionTypes.ErrorCommunication, 'communication error: ')
            .replace(ActionTypes.ErrorExecution, 'execution error: ')
            .replace(ActionTypes.ErrorCustom, 'error: ')

            .replace(':invocation[0]', '')} `;
        return {
            severity: 'error',
            title

        }
    }
    return {};
}



export function useAppLogger(app: AppService, send: (notification: NotificationsEvents) => {}) {
    useEffect(() => {
        if(app){
            const subscriptions =
                subscribeApp(app, send);
            return () => subscriptions && subscriptions.unsubscribe();

        }
        else {
            return () => {};

        }
    }, [app]);

    return true;

    function subscribeApp(app:AppService, send: (notification: NotificationsEvents) => {}) {
        return app?.subscribe && app.subscribe((state: AnyState) => {
            if (!state || isUpdateType(state)) return;
            console.log(state);

            send({
                type: "ADD", notification: {
                    id: generateUniqueID(),
                    title: `${state.value}`,
                    severity: 'success',
                    group: `${state.machine?.id|| 'default'}`,
                    icon: state.context.app?.logo || 'manage_accounts' ,
                    summary: `event: ${state.event.type.toString().toLowerCase()} ${state.context.assets?.length && `assets: ${state.context.assets.length}` || ''}`,
                    payload: getPayload(state.event, state.context),
                    ...doneDetails(state.event),
                    ...errorDetails(state.event)
                }
            })

        });
    }


}