import React from "react";

export class ErrorBoundary extends React.Component<React.PropsWithChildren<{ data?: any }>,
    { hasError: boolean, error?: string }> {
     
    constructor({children}: React.PropsWithChildren) {
        super({children});
         this.state = {hasError: false, error: undefined};
    }

    static getDerivedStateFromError(error: any) {
        // Update state so the next render will show the fallback UI.
        return {hasError: true, error: error};
    }

    componentDidCatch(error: any, errorInfo: any) {
        // You can also log the error to an error reporting service
        // console.error(error, errorInfo);
        console.error("failed to load data", this.props.data);
    }

    render = () => {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return <div>
                <h1>Something went wrong.</h1>
            </div>
        }

        return this.props.children;
    };
}
