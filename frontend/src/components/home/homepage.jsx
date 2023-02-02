import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useMessageContext } from "../../context/messageprovider";
import Light from "./lightpage";
import "./style.css"

function Home(params) {
    const [token,setToken] = useState(localStorage.getItem('access_token'));
    const [user_id,setUserId] = useState(localStorage.getItem('user_id'));
    const { roomnum } = useParams();

    const msgcontext = useMessageContext()

    const [homes, setHomes] = useState([]);
    const [devices, setDevices] = useState([]);
    const [owner, setOwner] = useState("");
    const [homeedit, setHomeedit] = useState(-1);
    const [deletingHome, setDeletingHome] = useState(-1);
    const [deletingRoom, setDeletingRoom] = useState(-1);
    const [createHome, setCreateHome] = useState(false);

    let url = params.url + "rooms/"
    
    useEffect(() => {
        if (token) {
            fetch(url, {
                method: "GET",
                headers: {
                    Authorization: token
                }
            }).then(res => {
                if (res.status === 200) {
                    res.json().then(res => {
                        console.log(res);
                        setHomes(res.homes);
                        setOwner(res.owner);
                        setDevices(res.devices);
                    })
                }
                else if(res.status === 404) {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('user_id');
                    setToken(localStorage.getItem('access_token'));
                    setUserId(localStorage.getItem('user_id'));
                }
            });
        }
    }, [url,token,roomnum,homeedit,deletingHome,createHome])
    

    function handleHomeChange(index, e) {
        let newHomes = [...homes];
        newHomes[index].name = e.target.value;
        setHomes(newHomes);
    }
    function handleRoomChange(homeIndex, roomIndex, e) {
        let newHomes = [...homes];
        newHomes[homeIndex].rooms[roomIndex].name = e.target.value;
        setHomes(newHomes);
    }


    async function handleHomeSubmit(event, home) {
        event.preventDefault();
        await fetch(`${params.url}edit/home/${home.id}/`, {
            method: 'POST',
            headers: {
                Authorization: token,
                'Content-type':'application/json'
            },
            body: JSON.stringify({ 'home': home })
        }).then(res => {
            const status = res.status;
            res.json().then(res => {
                msgcontext.append(res.message,status);
            })
            setHomeedit(-1);
        })
    }
    async function createHomeSubmit(e) {
        e.preventDefault();
        const formdata = new FormData(e.currentTarget)
        const data = {
            home: {
                name: formdata.get('name'),
            }
        }

        await fetch(`${params.url}create/home/`, {
            method: 'POST',
            headers: {
                Authorization: token,
                'Content-type':'application/json'
            },
            body: JSON.stringify(data)
        }).then(res => {
            const status = res.status;
            res.json().then(res => {
                msgcontext.append(res.message, status);
            })
        })
        setCreateHome(false);
    }


    async function confirmRoomDelete(e, room){
        await fetch(`${params.url}delete/room/${room.id}`, {
            method: 'GET',
            headers: {
                Authorization: token,
                'Content-type': 'application/json'
            }
        }).then(res => {
            const status = res.status;
            res.json().then(res => {

                setDeletingRoom(-1);
                setHomeedit(-1);
                msgcontext.append(res.message, status);
            });
        });
    }
    async function confirmHomeDelete(e, home) {
        await fetch(`${params.url}delete/home/${home.id}`, {
            method: 'GET',
            headers: {
                Authorization: token,
                'Content-type': 'application/json'
            }
        }).then(res => {
            const status = res.status;
            res.json().then(res => {
                msgcontext.append(res.message, status);
                setDeletingHome(-1);
            });
        });
    }

    
    async function createRoom(e, home) {
        e.preventDefault();
        const name = document.getElementById('new-room-name').value;
        if (!name) {
            msgcontext.append("Enter a valid name for new Room", 400);
            return;
        }
        await fetch(`${params.url}create/room/${home.id}/`, {
            method: 'POST',
            body: JSON.stringify({ 'room': { 'name': name }, 'home': home }), 
            headers: {
                Authorization: token,
                'Content-type':'application/json'
            }
        }).then(res => {
            const stat = res.status;
            res.json().then(res => {
                msgcontext.append(res.message, stat);
            })
            if (stat === 200) {
                setHomeedit(-1);
            }
        })
    }

    async function leaveHome(home) {
        await fetch(`${params.url}leave/home/${home.id}/`, {
            method: 'GET',
            headers: {
                Authorization: token,
                'Content-type':'application/json'
            },
        }).then(res => {
            const status = res.status;
            res.json().then(res => {
                msgcontext.append(res.message,status);
            })
            setHomeedit(0);
        })
    }


    function roomDeviceChangeHandler(hi,ri,e) {
        const dev = devices[e.currentTarget.value];

        let nh = [...homes];
        nh[hi].rooms[ri].device = dev;
        setHomes(homes);
    }

    

    return (
        <>
            {!token && <Navigate to={'login'}/>}
            <div className="main-container">
            <div className="homes">
                {homes && homes.map((home, homeIndex) => {
                    return (<div key={"home-"+home.id}>{homeedit === home.id ?
                        deletingHome === home.id ?
                            <div>
                                <label className="home-label">Confirm Delete ?</label>
                                <div className="buttons-form buttons-home-delete">
                                    <div className="push-btn" onClick={()=>setDeletingHome(-1)}><i className="fa fa-xmark fa-success"></i></div>
                                    <div className="push-btn" onClick={(e)=>confirmHomeDelete(e,home)}><i className="fa fa-check fa-danger"></i></div>
                                </div>
                            </div> :
                            <form className="form-home-edit" onSubmit={(e)=>handleHomeSubmit(e,home)}>
                                <div className="home-container">
                                    <input className="input-edit home-title" type={'text'} value={home.name} onChange={(e) => handleHomeChange(homeIndex, e)} />
                                    <div className="buttons-form">
                                        <div className="post-btn" onClick={()=>setDeletingHome(home.id)}><i className="fa fa-xmark fa-bigger fa-danger"></i></div>
                                        <div className="post-btn" onClick={(e)=>handleHomeSubmit(e,home)}><i className="fa fa-check fa-bigger fa-success"></i></div>
                                    </div>
                                </div>
                                <div className="edit-mode room-container">
                                    {home.rooms && home.rooms.map((room, roomIndex) => {
                                        return (<div key={"room-"+room.id}>
                                            {deletingRoom === room.id ?
                                                <div className="room delete">
                                                    <label>Confirm?</label>
                                                    <div className="buttons-form buttons-room-delete">
                                                        <div className="post-btn" onClick={(e)=>confirmRoomDelete(e,room)}><i className="fa fa-check fa-danger"></i></div>
                                                        <div className="post-btn" onClick={()=>setDeletingRoom(-1)}><i className="fa fa-xmark fa-success"></i></div>
                                                    </div>
                                                </div> :
                                                <div className="room">
                                                    <div className="room-inputs">
                                                        <input className="input-edit room-title" type={'text'} value={room.name} onChange={(e) => handleRoomChange(homeIndex, roomIndex, e)} />
                                                        <select className="input-edit room-title selector" onChange={(e)=>roomDeviceChangeHandler(homeIndex, roomIndex,e)}>
                                                            {room.device && <option value={0}>{room.device.name}</option>}
                                                            <option value={null}></option>
                                                            {devices && devices.map((dev,index) => {
                                                                if (room.device && dev.id !== room.device.id)
                                                                    return "";
                                                                else return <option value={index}>{dev.name}</option>;
                                                            })}
                                                        </select>
                                                    </div>
                                                    <div className="post-btn" onClick={() => setDeletingRoom(room.id)}><i className="fa fa-xmark fa-danger"></i></div>
                                                </div>}
                                        </div>)
                                    })}
                                    <div className="room create-form">
                                        <input className="input-edit room-title" id="new-room-name" type={'text'} placeholder='room Name'/>
                                        <div className="post-btn" onClick={(e)=>createRoom(e,home)}><i className="fa fa-plus fa-success"></i></div>
                                    </div>
                                </div>
                            </form> :
                        <div className={"home-tile "}>
                            <div className="home-container">
                                <p className="home-title">{home.name}</p>
                                {home.owner === user_id ? <div className="btn-edit" onClick={() => setHomeedit(home.id)}><i className="fa fa-gears fa-primary"></i></div> : <div className="btn-edit" onClick={() => leaveHome(home)}><i className="fa fa-right-from-bracket fa-danger"></i></div>}
                            </div>
                            <div className="room-container">
                                {home.rooms && home.rooms.map((room, i) => {
                                    return (
                                        <div className='room' key={'room-'+room.id}>
                                            <Link to={`/${room.id}`}>
                                                <p className={"room-title " + (room.id.toString() === roomnum ? 'active' : "")}>{room.name}</p>
                                            </Link>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    }
                    <hr/></div>)
                })}
                <div className="create-home">
                        {createHome ?
                            <form method="POST" onSubmit={createHomeSubmit}>
                            <div className="light-title">
                                <input className="input-edit home-title" type={'text'} name='name' placeholder='Home Name' />
                                
                                <div className="buttons-form buttons-light-create">
                                    <div className="post-btn" onClick={()=>setCreateHome(false)}><i className="fa fa-xmark fa-danger"></i></div>
                                    <button className="post-btn"><i className="fa fa-check fa-success"></i></button>
                                </div>
                    
                            </div>
                        </form>:
                            <div className="fa home-title fa-success" onClick={()=>setCreateHome(true)}>
                                <i className="fa-circle-plus"></i>
                                <span style={{marginLeft: '0.5em'}}>Add Home</span>
                            </div>
                            }
                </div>
                
            </div>
            <div className="light-tile">
                <Light room={roomnum} url={params.url} /> 
            </div>
        </div>
        </>
    );
}

export default Home;






// {roomid &&
//     createbulb ? 
//     <form onSubmit={createLight}>
//         <div className="light-title">
//             <input className="input-edit room-title" type={'text'} name='name' placeholder='Light Name' />
//             <div className="selector">
//                 <label  className='label'>Select Port Number:</label>
//                 <select className="input-edit" name='port'>
//                     {options}
//                 </select>
//             </div>

//             <div className="buttons-form buttons-light-create">
//                 <div className="push-btn" onClick={()=>setCreatebulb(false)}><i className="fa fa-xmark fa-danger"></i></div>
//             </div>

//         </div>
//     </form>:
//     <div className="light-title" onClick={()=>setCreatebulb(true)}>
//         <i className="fa fa-circle-plus fa-success"></i>
//         <span>Create Light</span>
//     </div>
// }