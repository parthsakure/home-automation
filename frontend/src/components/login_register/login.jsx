import { useState } from "react"
import { Navigate } from "react-router-dom"
import { useMessageContext } from "../../context/messageprovider";
import { useUserExistContext } from "../../context/userloggedIn";

import "./style.css"


function Login(params) {
    
    const [redirect, setRedirect] = useState(false);
    const userContext = useUserExistContext();
    const msgcontext = useMessageContext();
    
    const senddata = async (event) => {
        event.preventDefault();
        const form = event.target;
        const formdata = new FormData(form);
        const actualdata = {
            username: formdata.get('username'),
            password: formdata.get('password')
        }
        await fetch(params.url + "login/", {

            method: "POST",
            headers: {
                'Content-type': 'application/json',
            },
            body: JSON.stringify(actualdata),
        }).then(res => {
            if (res.status === 200)
                res.json().then(data => {
                    localStorage.setItem("access_token", data.token);
                    localStorage.setItem('user_id', data.user_id);
                    localStorage.setItem('username', actualdata.username);
                    msgcontext.append("Login Successful!",200);
                    userContext.set(true);
                    setRedirect(true);
                });
            else {
                res.json().then(res => {
                    msgcontext.append(res.message,400);
                })
            }
        });
    }


    return (
        <>
            {redirect && <Navigate to="/" />}
            
                <form className="login-form form" onSubmit={senddata}>
                    <div className="form-group" >
                        <label>Username</label>
                        <input type='text' name="username" placeholder="Enter Username" required/>
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type='password' name="password" placeholder="Enter Password" required/>
                    </div>

                    <input className="btn btn-login" type="submit" value='Login'/>
                </form>
                


        </>
    )
}

export default Login;