import { useState } from "react"
import { Navigate } from "react-router-dom"
import { useMessageContext } from "../../context/messageprovider";
import { useUserExistContext } from "../../context/userloggedIn";

import "./style.css"


function Register(params) {
    
    const [redirect, setRedirect] = useState(false);
    const userContext = useUserExistContext();
    const msgcontext = useMessageContext();
    
    async function senddata(e) {
        e.preventDefault();

        const formdata = new FormData(e.currentTarget);
        const actualdata = {
            username: formdata.get('username'),
            password1: formdata.get('password1'),
            password2: formdata.get('password2'),
            name: formdata.get('name'),

        }
        if (actualdata.password1 !== actualdata.password2) {
            msgcontext.append("Passwords Must match", 400);
        }


        else {
            await fetch(params.url + "register/", {

                method: "POST",
                headers: {
                    'Content-type': 'application/json',
                },
                body: JSON.stringify(actualdata),
            }).then(res => {
                if (res.status === 200)
                    res.json().then(data => {
                        localStorage.setItem("access_token", data.token);
                        localStorage.setItem('user_id', data.user_id)
                        msgcontext.append("Login Successful!", 200);
                        userContext.set(true);
                        setRedirect(true);
                    })
                else {
                    res.json().then(res => {
                        msgcontext.append(res.message, 400);
                    })
                }
            });
        }

    }


    return (
        <>
            {redirect && <Navigate to="/" />}
            
                <form className="login-form form" onSubmit={senddata}>
                    <div className="form-group" >
                        <label>Name</label>
                        <input type='text' name="name" placeholder="Enter name" required/>
                    </div>
                    <div className="form-group" >
                        <label>Username</label>
                        <input type='text' name="username" placeholder="Enter Username" required/>
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type='password' name="password1" placeholder="Enter Password" required/>
                    </div>
                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input type='password' name="password2" placeholder="Retype Password" required/>
                    </div>

                    <input className="btn btn-login" type="submit" value='Register'/>
                </form>
                


        </>
    )
}

export default Register;