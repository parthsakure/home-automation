import { useEffect, useState } from "react";
import { useMessageContext } from "../../context/messageprovider";
import "./style.css"


function Light(params) {
    const roomid = params.room;
    const token = localStorage.getItem('access_token');
    const user_id = localStorage.getItem('user_id');

    const [lightedit, setLightedit] = useState("");
    const [lights, setLights] = useState([]);
    const [deletinglight, setDeletinglight] = useState("");
    const [owner, setOwner] = useState("")
    const [createbulb, setCreatebulb] = useState(false);
    const [ports, setPorts] = useState([]);

    let options = []



    const msgcontext = useMessageContext();

    let url = `${params.url}rooms/`;
    if (roomid)
        url += `${roomid}/`;

    useEffect(() => {
        if (token && roomid) {
            fetch(url, {
                method: "GET",
                headers: {
                    Authorization: token
                }
            }).then(res => {
                if (res.status === 200) {
                    res.json().then(res => {
                        setLights(res.lights);
                        setOwner(res.owner);
                        setPorts(res.available_ports);
                    })
                }
                else {
                    msgcontext.append({ message: "Error Loading Lights", type: 'error' });
                }
            });
        }
    }, [url, token, roomid, lightedit, createbulb])
    


    async function changeState(item) {
        await fetch(`${params.url}set/${item.id}/${item.state ? 0 : 1}`, {
            method: 'GET',
            headers: {
                Authorization: token,
                'Content-type': 'application/json'
            }
        }).then(res => res.json()).then(res => {
            setLights(res.lights);
        })
    }

    async function handleLightSubmit(e, light) {
        e.preventDefault();
        const fd= new FormData(document.getElementById('light-edit-form'));
        light.port = fd.get('port');
        await fetch(`${params.url}edit/light/${light.id}/`, {
            method: "POST",
            headers: {
                Authorization: token,
                'Content-type': 'application/json'
            },
            body: JSON.stringify({ 'light': light })
        }).then(res => {
            const status = res.status;
            res.json().then(res => {
                msgcontext.append(res.message, status);
            });
        });
        setLightedit(-1);
    }

    async function confirmLightDelete(light) {
        await fetch(`${params.url}delete/light/${light.id}/`, {
            method: 'GET',
            headers: {
                Authorization: token,
                'Content-type': 'application/json'
            }
        }).then(res => {
            const status = res.status;
            res.json().then(res => {
                msgcontext.append(res.message, status);
            });
        })
        setLightedit(-1);
    }

    function handleLightChange(index, e) {
        let newlights = [...lights];
        let light = newlights[index];
        light.name = e.target.value;
        newlights[index] = light;
        setLights(newlights);
    }

    async function createLight(e) {
        e.preventDefault();
        const formdata = new FormData(e.currentTarget);
        await fetch(`${params.url}create/light/${roomid}/`, {
            method: 'POST',
            body: JSON.stringify({ 'room': roomid, 'light': { 'name': formdata.get('name'), 'port': formdata.get('port') } }),
            headers: {
                Authorization: token,
                'Content-type': 'application/json'
            }
        }).then(res => {
            const status = res.status;
            res.json().then(res => {
                msgcontext.append(res.message, status);
            })

        })
        setCreatebulb(false);
    }

    return (
    <div className="lights">
        { lights && lights.map((light, i) => {
            return (
                <div key={"light-" + light.id}>
                    {lightedit === light.id ?
                        deletinglight === light.id ?
                            <form id="confirm-delete-light-form" onSubmit={() => confirmLightDelete(light)}>
                                <div className="light-container">
                                    <label>Confirm ?</label>
                                    <div className="buttons-form">
                                        <div className="post-btn light-edit-btn" onClick={() => confirmLightDelete(light)}><i className="fa fa-check fa-danger"></i></div>
                                        <div className="post-btn light-edit-btn" onClick={() => setDeletinglight(-1)}><i className="fa fa-xmark fa-success"></i></div>
                                    </div>
                                </div>
                            </form> :
                            <form id="light-edit-form" onSubmit={(e) => handleLightSubmit(e, light)}>
                                <div className="light-container">
                                    <div>
                                        <input className="input-edit room-title" type={'text'} value={light.name} onChange={(e) => handleLightChange(i, e)} />
                                        <div className="selector">
                                        <label  className='label'>Port:</label>
                                            <select className="input-edit room-title" name='port'>
                                                <option value={light.port}>{light.port}</option>
                                                {ports && ports.map((portnum) => {
                                                    return (
                                                        <option value={portnum}>{portnum}</option>
                                                    )
                                                })}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="buttons-form">
                                        <div className="post-btn" onClick={() => setDeletinglight(light.id)}><i className="fa fa-xmark fa-danger fa-bigger"></i></div>
                                        <div className="post-btn" onClick={(e) => handleLightSubmit(e, light)}><i className="fa fa-check fa-success fa-bigger"></i></div>
                                    </div>
                                </div>
                            </form >
                        :
                        <div className="light-container">
                            <div className={"light-title light-" + (light.state ? "active" : "not-active")} onClick={() => changeState(light)}><i className={"fa-lightbulb fa " + (light.state ? "fa-solid fa-success-darker" : "fa-regular fa-danger-darker")}></i><span>{light.name}</span></div>
                            {owner === user_id && <div className="btn-edit" onClick={() => setLightedit(light.id)}><i className="fa fa-smaller fa-gear fa-primary"></i></div>}
                        </div>
                    }
                </div>
            )
            })
        }
        
        {roomid && ports.length >0 && user_id == owner && (createbulb ? 
            <form onSubmit={createLight}>
                <div className="light-title">
                    <input className="input-edit room-title" type={'text'} name='name' placeholder='Light Name' />
                    <div className="selector">
                        <label  className='label'>Port:</label>
                        <select className="input-edit room-title" name='port'>
                                {ports && ports.map((portnum) => {
                                    return (
                                        <option value={portnum}>{portnum}</option>
                                    )
                                })}
                        </select>
                    </div>
        
                    <div className="buttons-form buttons-light-create">
                        <div className="post-btn" onClick={()=>setCreatebulb(false)}><i className="fa fa-xmark fa-danger"></i></div>
                        <button className="post-btn"><i className="fa fa-check fa-success"></i></button>
                    </div>
        
                </div>
            </form>:
            <div className="light-title" onClick={()=>setCreatebulb(true)}>
                <i className="fa fa-circle-plus fa-success"></i>
                <span>Create Light</span>
            </div>)
        }
    </div>
            
    )
}

export default Light;