import {useState} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login=({setuser}) => {
    const [form,setform] =useState({
        email:"",
        password:""
    })
    const[error,seterror]=useState("");
    const navigate=useNavigate();

    const handleSubmit= async (e)=>{
        e.preventDefault();
        try{
            const res=await axios.post("http://localhost:5001/api/auth/login",form);
            setuser(res.data.user);
            navigate("/chat");


        }catch(err)
        {
            seterror("Invalid Email or Password");

        }
    }

    return(
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <form onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center" >Login</h2>
            {error&&<p className="text-red-500 text-sm mb-3">{error}</p>}
            <input 
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e)=> setform({...form,email:e.target.value})}
            className="border p-2 w-full mb-3 rounded-md"
            />
            <input
            type="password" 
            placeholder="Password"
            value={form.password}
            onChange={(e)=> setform({...form,password:e.target.value})}
            className="border p-2 w-full mb-3 rounded-md"
            />
            <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600">Login</button>
        </form>
        </div>
    );


};
export default Login;