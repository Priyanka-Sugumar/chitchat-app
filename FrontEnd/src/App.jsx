import {useState,useEffect} from "react";
import {BrowserRouter as Router,Routes,Route,Navigate} from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register"
import Chat from "./pages/Chat"
import axios from "axios";

axios.defaults.withCredentials = true
function App(){

  const[user,setuser]=useState(null);
  const[authChecked,setAuthChecked]=useState(false);

  useEffect(() =>{
const authenticateUser = async()=>{
  try{
      const res=await axios.get("http://localhost:5001/api/auth/me");
      setuser(res.data);
  }catch(err){
    console.log(err);
  }finally{
    setAuthChecked(true);
  }
}
 authenticateUser();

  },[]);
   if (!authChecked) return <p>Loading...</p>;

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