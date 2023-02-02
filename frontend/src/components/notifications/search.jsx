
import { useEffect,useState } from "react";
import { useMessageContext } from "../../context/messageprovider";
import "./style.css"

function Search(params) {
    const user_id = localStorage.getItem('user_id');
    const username = localStorage.getItem('username');
    const token = localStorage.getItem('access_token');
    const msgcontext = useMessageContext();
    const [refresher, refresh] = useState(true);
    const [results, setResults] = useState([]);

    useEffect(() => {
        console.log(params.find);
    },[params.find])

    useEffect(() => {
        params.find != "" &&
        fetch(`${params.url}search/?q=${params.find}`, {
            method: 'GET',
            headers: {
                'Content-type': 'application/json'
            }
            }).then(res => {
                const status = res.status;
                res.json().then(res => {
                    console.log(res);
                    setResults(res);
                })
            })
        },[params.find,refresher])

    async function sendrequest(e, home) {
        console.log(user_id);
        console.log(home.requests);
        console.log(home.requests.includes(user_id));
        await fetch(`${params.url}sendrequest/${home.id}/`,{
            method: 'GET',
            headers:{
                Authorization: token,
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

    async function cancelRequest(e, home) {
        await fetch(`${params.url}removerequest/${home.id}/`,{
            method: 'GET',
            headers:{
                Authorization: token,
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



    return results.users ? results.users.length <1 ? <div>No result Found</div> : <div className="search container">
        {results.users && results.users.map((user) => {
            return ( user.username != username &&
                <div className="user">
                    <div className="userinfo">
                        <h1 className="username">{user.username}</h1>
                        <h3 className="name">{user.name}</h3>
                    </div>
                    <div className="homes">
                        {user.homes.length > 0 ? user.homes.map((home) => {
                            return (
                                <div className="home">
                                    <p>{home.name}</p>
                                    <div className="options">
                                        {home.owner != user_id && ((user_id  && (home.requests.includes(user_id)|| home.homies.includes(user_id))) ?
                                            <div className="remove" onClick={(e) => cancelRequest(e, home)}>
                                                <span className="option-label">Remove</span>
                                                <i className="fa fa-xmark fa-danger"></i>
                                            </div> :
                                            <div className="join" onClick={(e) => sendrequest(e, home)}>
                                                <span className="option-label">Join</span>
                                                <i className="fa fa-check fa-success"></i>
                                            </div>)
                                        }
                                    </div>
                                </div>
                            )
                        }) :
                            <div>No House Is Owned by {user.name}</div>
                    }
                    </div>
                </div>
            )
        })}
        {results.users && <div className="close-btn" onClick={() => { setResults([]) }}>Close <i className="fa fa-circle-xmark fa-danger"></i></div>}
    </div> : <></>
}

export default Search;