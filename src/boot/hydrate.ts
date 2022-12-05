import {useInterpret} from '@xstate/react';
import {interpret, AnyStateMachine, State, InterpreterFrom, ContextFrom, StateFrom, AnyState} from 'xstate'
import React from "react";

class MachineHydratePersistent<Machine extends AnyStateMachine = AnyStateMachine, Service extends InterpreterFrom<Machine> = InterpreterFrom<Machine>, Context extends ContextFrom<Machine> = ContextFrom<Machine>, TState extends StateFrom<Machine> = StateFrom<Machine>> {
    public key: string;


    constructor(
        public machine: Machine,
        public select: (state: StateFrom<Machine>) => StateFrom<Machine> = MachineHydratePersistent.defaultSelector,
        public idProvider: (machine: Machine) => string = MachineHydratePersistent.defaultIdProvider,
    ) {

        this.key = this.idProvider(this.machine);

    }

    static defaultIdProvider(machine: AnyStateMachine) {
        return `machines/${machine.id}`
    };

    static defaultSelector<State extends AnyState>(state: State): State {
        return state;
    };

    load = (): StateFrom<Machine>  => {
        try {
            const stored = localStorage.getItem(this.key);
            if (stored) {
                return this.select(State.create(JSON.parse(stored)) as StateFrom<Machine>) ;
            } else return this.select(State.create(this.machine.initialState) as StateFrom<Machine>);


        } catch (e) {
            console.error('Failed to load machine state', e, this.key, this.machine);
            return State.create(this.machine.initialState) as TState;
        }


    }

    save = (state: any) => {
        console.log('onTransition-bottom', state.value)

        try {
            localStorage.setItem(this.key, JSON.stringify(state.toJSON()))
        } catch (e) {
            console.error("Failed to save state", e)
        }
    }


}

export const hydrateMachine = <TMachine extends AnyStateMachine = AnyStateMachine>(machine: TMachine) => {
    const hydrator = new MachineHydratePersistent<TMachine>(machine);
 
    return interpret(machine, {devTools: true, execute:true, deferEvents:true})
        .onTransition(hydrator.save)
        .start(hydrator.load())

}

// export function usePersistentHydrate<TMachine extends AnyStateMachine>(getMachine: MaybeLazy<TMachine>) {
//     let hydrator = new MachineHydratePersistent<TMachine>(getMachine);
//
//     return useInterpret(
//         getMachine,
//         {
//             state: currentState
//         }
//         , stateLocalStorage.observer);
//
// }

export const useHydrate = <TMachine extends AnyStateMachine = AnyStateMachine>(machine: TMachine, select: (state: StateFrom<TMachine>) => StateFrom<TMachine> = (state) => state) => {
    const hydrator = new MachineHydratePersistent<TMachine>(machine, select);

    // const [service, setService] = React.useState();
    const service= useInterpret(() => machine, {
        state: hydrator.load()
    }, hydrator.save);
    return {
        useInterpret: () => {
            return useInterpret(() => machine, {
                state: hydrator.load()
            }, hydrator.save)
        },
        service,
        load: hydrator.load,
        save: hydrator.save
    };
}
 

