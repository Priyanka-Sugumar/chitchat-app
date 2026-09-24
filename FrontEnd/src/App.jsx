import {useState} from "react";
import {BrowserRouter as Router,Routes,Route,Navigate} from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register"
import Chat from "./pages/Chat"
import axios from "axios";

axios.defaults.withCredentials = true
function App(){

  const[user,setuser]=useState(null);

  return(
    <Router>
      <Routes>
        <Route path="/" element={<Home User={user}/>}/>
        <Route path="/login" element={<Login setuser={setuser}/>}/>
        <Route path="/register" element={<Register />}/>
       <Route path="/chat" element={user ? <Chat user={user} setuser={setuser}/>:<Navigate to="/"/>}/>
       </Routes>
    </Router>
  )


}

export default App;