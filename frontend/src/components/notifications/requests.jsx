import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useMessageContext } from "../../context/messageprovider";


function Requests(params) {
    const token = localStorage.getItem('access_token')

    const [reqs, setreqs] = useState([]);
    const msgcontext = useMessageContext();
    const [refresher, refresh] = useState(false);

    async function accept(home,user) {
        await fetch(`${params.url}accept/${home.id}/${user.username}/`,{
            method:'GET',
            headers:{
                Authorization:token,
                'Content-type':'application/json'
            }
        }).then(res=>{
            const status = res.status;
            res.json().then(res=>{
                msgcontext.append(res.message,status);
            })
        })
        refresh(!refresher);
    }

    async function deny(home,user) {
        await fetch(`${params.url}deny/${home.id}/${user.username}/`,{
            method:'GET',
            headers:{
                Authorization:token,
                'Content-type':'application/json'
            }
        }).then(res=>{
            const status = res.status;
            res.json().then(res=>{
                msgcontext.append(res.message,status);
            })
        })
        refresh(!refresher);
    }
    
    useEffect(() => {
        fetch(`${params.url}requests`, {
            method: 'GET',
            headers: {
                Authorization: token,
                'Content-type': 'application/json'
            }
        }).then(res => {
            const status = res.status;
            res.json().then(res => {
                console.log(res)
                setreqs(res.requests)
            })
        })
    },[refresher])
    if (!token) return <Navigate to='login' />;
    return <div>
        {reqs && reqs.map((home) => {
            return (
                <div>
                    <h1>{home.name}</h1>
                    {home.requests.length > 0 ?
                        home.requests.map((user) => {
                                return (<div className="user-request">
                                    <span className="username">{user.username} </span>
                                    <span className="name">{user.name}</span>
                                    <div className="options">
                                        <div className="approve" onClick={()=>accept(home,user)}>Approve <i className="fa fa-check fa-success"></i></div>
                                        <div className="decline" onClick={() => deny(home,user)}>Deny <i className="fa fa-xmark fa-danger"></i></div>
                                        </div>
                                </div>)
                        }) :
                    <p>No requests</p>}
                </div>)
        })}
    </div>;
}


export default Requests;