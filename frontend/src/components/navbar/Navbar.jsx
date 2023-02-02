
import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useUserExistContext } from "../../context/userloggedIn";
import Search from "../notifications/search";
import "./style.css"


function NavBar(params) {
    const context = useUserExistContext();
    const [find, setFind] = useState("");

    function setparameter(e) {
        e.preventDefault();
        setFind(document.getElementById('search-input').value);
    }

    useEffect(() => {
        console.log(find);
    },[find])

    // if(redirect) return <Navigate to="searchresults" results={results}/>

    return (
<>
        <header>
            <div className="container navbar">
                <div className="logo">
                    <a href="/">LOGO</a>
                </div>
                <form onSubmit={setparameter}>
                    <div className="searchbar">
                        <input id='search-input' className="input-search" name="find" type={'text'} placeholder={'search User'} />
                        <button ><i className="fa fa-search search-button"></i></button>
                    </div>
                </form>
                <nav>
                    <ul>
                        {!context.user ?<>
                            <li><Link to="login">Login</Link></li>
                            <li><Link to="register">Register</Link></li>
                        </>
                            : <>
                                <li><Link to="requests">Requests</Link></li>
                                <li><Link to="logout">Logout</Link></li>
                                <li><Link to="devices">Devices</Link></li>
                            </>}
                    </ul>
                </nav>
            </div>
            </header>
            <Search find={find} set={setFind} url={params.url} />
        </>
    )
}


export default NavBar;