import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useMessageContext } from "../../context/messageprovider";


function Edit(params) {
    const { hid, rid, lid } = useParams();
    const [element, setElement] = useState({});
    const [eleType, setEletype] = useState("");
    const [redirect, setRedirect] = useState(false);
    const token = localStorage.getItem('access_token');
    const msgcontext = useMessageContext();
    let url = params.url;
    let navigationUrl = "/"
    if (lid) {
        url += 'light/' + lid + "/";
        navigationUrl += `${hid}/${rid}`;
    }
    else if (rid) {
        url += 'room/' + rid + "/";
        navigationUrl += `${hid}/${rid}`;
    }
    else if (hid) {
        url += 'home/' + hid + "/";
        navigationUrl += `${hid}`;
    }

    useEffect(() => {
        if (token) {
            fetch(url, {
                method: "GET",
                headers: {
                    Authorization: token
                }
            }).then(res => {
                if (res.status === 200) {

                    res = res.json()
                    .then(data => {
                        if (lid) {
                            setElement(data.light);
                            setEletype("Light");
                        }
                        else if (rid) {
                            setElement(data.room);
                            setEletype("Room");
                        }
                        else if (hid) {
                            setElement(data.home);
                            setEletype("Home");
                        }
                    })
                }
                else {
                    res.json().then((res)=>{
                        setRedirect(true);
                        msgcontext.set([...msgcontext.messages, { message: res.message, type: 'error' }]);
                    })
                    
                }
            })
        }
    },[hid,rid,lid,url,token]);


    async function deleteElement() {
        await fetch(url+'delete/', {
            method: 'GET',
            headers: {
                Authorization: token,
                'Content-type':'application/json'
            }
        }).then(res => {
            if (res.status === 200) {
                res.json().then(res => {
                    setRedirect(true);
                    msgcontext.set([...msgcontext.messages, { message: res.message, type: 'success' }]);
                })
            }
            else {
                res.json().then(res => {
                    msgcontext.set([...msgcontext.messages, { message: res.message, type: 'error' }]);
                })
            }
        })

    }


    function handleChange(e) {
        setElement({ id: element.id, name: e.target.value });
    }
    
    async function handleSubmit(e) {
        e.preventDefault();
        fetch(url + 'edit/', {
            method: 'POST',
            headers: {
                Authorization: token,
                'Content-type':'application/json'
            },
            body: JSON.stringify(element)
        }).then(res => {
            if (res.status === 200) {
                res.json().then(res => {
                    setRedirect(true);
                    msgcontext.set([...msgcontext.messages, { message: res.message, type: 'success' }]);
                })
            }
            else {
                res.json().then(res => {
                    msgcontext.set([...msgcontext.messages, { message: res.message, type: 'error' }]);
                })
            }
        })

    }


    if (!token) {
        return <Navigate to='login'/>
    }
    return (<div>
        {redirect && <Navigate to={'/'} />}
        <h1>Change Name of {eleType} to "{element && element.name}" ?</h1>
        <form className="form" onSubmit={handleSubmit}>
            <div className='form-group'>
                <label>Name</label>
                    <input type='text' name="name" placeholder="Enter Name" value={element.name} onChange={handleChange} required/>
            </div >
            <div className="edit-delete">
                <a className="btn btn-danger" onClick={deleteElement} ><span>Delete</span></a>
                <button className="btn btn-login">Edit</button>
            </div>
        </form>
    </div>)
}

export default Edit;