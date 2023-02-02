import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useMessageContext } from "../../context/messageprovider";
import { useUserExistContext } from "../../context/userloggedIn";



function Logout(params) {
    const [redirect, setRedirect] = useState(false);
    const userContext = useUserExistContext();
    const msgcontext = useMessageContext();

    const token = localStorage.getItem('access_token');
    const logout = async () => {
        if (token) {
            await fetch(params.url+"logout/", {
                method: 'GET',
                headers: {
                    'Content-type':'application/json',
                    "Authorization": token
                }
            }).then(res => {
                if (res.status === 200) {
                    msgcontext.append("You are logged out Successfully!",200);
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('user_id');
                    localStorage.removeItem('username');
                    setRedirect(true);
                    userContext.set(false);
                }
                else {
                    msgcontext.append(res.message,400);
                }
            })
        }
    }
    logout();

    return (
        redirect ? <Navigate to="/" /> : <h1>Logging You Out</h1>
    );
}

export default Logout;