import { useEffect, useState } from "react";
import { useMessageContext } from "../../context/messageprovider";
import "./style.css"

function Devices(params) {
    const token = localStorage.getItem('access_token');
    const [devices, setDevices] = useState([]);
    const [refresher, refresh] = useState(false);
    const msgcontext = useMessageContext();

    useEffect(() => {
        fetch(`${params.url}device/`, {
            method: "get",
            headers: {
                Authorization: token,
                'Content-type':'application/json'
            }
        }).then(res => {
            const status = res.status;
            res.json().then(res => {
                if (status == 200) {
                    setDevices(res.devices);
                }
                else {
                    msgcontext.append(res.message, status);
                }
            })
        })
    }, [refresher])
    
    async function deleteDevice(dev) {
        await fetch(`${params.url}device/delete/${dev.id}`, {
            method: "GET",
            headers: {
                Authorization: token,
                'Content-type': 'application/json'
            }
        }).then(res => {
            const status = res.status;
            res.json().then(res => {
                msgcontext.append(res.message, status);
                refresh(!refresher);
            })
        });
    }

    async function createDevice(e) {

        const data = { "name": document.getElementById('device-name').value, "password": document.getElementById("device-password").value }
        document.getElementById("device-password").value = "";
        document.getElementById("device-name").value = "";

        await fetch(`${params.url}device/create/`, {
            method: "POST",
            headers: {
                Authorization: token,
                'Content-type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(res => {
            const status = res.status;
            res.json().then(res => {
                msgcontext.append(res.message, status);
                refresh(!refresher);
            })
        });
    }


    return (devices ? <div>
        <form>
        <table>
            <thead>
                <tr>
                    <th>Device Name</th>
                    <th>Device ID</th>
                    <th>Device Rooms</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                {devices.map((device) => {
                    return(<tr>
                        <td>{device.name}</td>
                        <td>{device.id}</td>
                        <td>
                            {device.rooms.map((room) => {
                                return (<p>{room.name}</p>)
                            })}
                        </td>
                        <td><i onClick={()=>deleteDevice(device)} className="fa fa-xmark fa-danger fa-bigger"></i></td>
                    </tr>)
                })
                }
            </tbody>
            <tfoot>
                <tr id="footer-row">
                    <td>
                        <input className="input-edit room-title" id="device-name" name={"name"} placeholder="name" type={'text'} required/>
                    </td>
                    <td>
                        <input className="input-edit room-title" id='device-password' name={"password"} placeholder="Password (Do not Forget this password)" type={'password'} required/>
                    </td>
                    <td></td>
                    <td>
                        <div onClick={(e)=>createDevice(e)}><i className="fa fa-plus fa-success fa-bigger"></i></div>
                    </td>
                </tr>
            </tfoot>
            </table>
            </form>
    </div> :
    <div>No Registerd Devices yet!</div>)
}

export default Devices;