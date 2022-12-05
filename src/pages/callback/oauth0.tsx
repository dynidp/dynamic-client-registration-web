// import App from "../../App";
import { useNavigate } from 'react-router-dom'
import React from 'react'

export const OAuth0Callback =()=>{
    const navigate = useNavigate()

    React.useEffect(()=>{
        const queryString = window.location.search.substring(1); // includes '?'
        const path = ['/', queryString].join('#');
        setTimeout(function() {
            navigate(path);
        }, 1000);
        
    });
    
    return ( 
    <div>
        <h1>AppAuthJS Redirect</h1> 
            <h3>
                For more information on why this redirect page exists, please look:
                <a href="https://tools.ietf.org/html/rfc6749#section-3.1.2.5">here</a>.
            </h3>
    </div>
  )
   
}
export default  OAuth0Callback ;

