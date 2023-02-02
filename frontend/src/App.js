// import logo from './logo.svg';
import './App.css';
import "./fontawesome.css"
import NavBar from './components/navbar/Navbar';

import { BrowserRouter, Route, Routes} from "react-router-dom";
import Login from './components/login_register/login';
import Logout from './components/login_register/logout';
import Home from './components/home/homepage';
import Edit from './components/home/editpage';
import Messages from './components/notifications/messages';


import UserProvider from './context/userloggedIn';
import MessageProvider from './context/messageprovider';
import Register from './components/login_register/register';
import Requests from './components/notifications/requests';
import Search from './components/notifications/search';
import Devices from './components/devices/devices';





function App() {

  const baseurl = 'http://localhost:8000/api/'


  return (
    <BrowserRouter>
      <MessageProvider>
        <UserProvider>
          <div className="App">
            <NavBar url={baseurl} />
            <div className='container'>
              <Messages />
              <Routes>
                <Route index element={<Home url={baseurl} />} />
                <Route path='login' element={<Login url={baseurl}/> } />
                <Route path='register' element={<Register url={baseurl}/> } />
                <Route path='logout' element={<Logout url={baseurl}/> } />
                <Route path='requests' element={<Requests url={baseurl}/> } />
                <Route path='devices' element={<Devices url={baseurl}/> } />
                <Route path=':roomnum' element={<Home url={baseurl}/>} />
                <Route path=':hid/edit' element={<Edit url={baseurl}/>} />
                <Route path=':hid/:rid/edit' element={<Edit url={baseurl}/>} />
                <Route path=':hid/:rid/:lid/edit' element={<Edit url={baseurl}/>} />
              </Routes>
            </div>
          </div>
        </UserProvider>
      </MessageProvider>
    </BrowserRouter>
  );
}

export default App;
