import React, {StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// import {initDemoSite} from "./gigya/engine";
//   import   "./machines/withGigya";
import { BrowserRouter } from "react-router-dom";
import {
    BrowserRouter as Router,
    useRoutes,
} from 'react-router-dom'

import routes from '~react-pages'

// eslint-disable-next-line no-console
console.log(routes)

function Main() {
    return (
        <Suspense fallback={<p>Loading...</p>}>
            {useRoutes(routes)}
        </Suspense>
    )
}

const app = createRoot(document.getElementById('root')!)

app.render(
    <StrictMode>
        <Router>
            <Main />
        </Router>
    </StrictMode>
)


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
