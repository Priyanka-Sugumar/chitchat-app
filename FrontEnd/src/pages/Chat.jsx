import axios from "axios";
import { useEffect,useState,useRef} from "react";
import { useNavigate } from "react-router-dom";



const Chat=({user,setuser}) =>{

const [users,setusers]=useState([]);
const [selectedUser,setselectedUser]=useState(null);
const [messages,setMessages]=useState([]);
const [draft, setDraft] = useState("");
const wsRef = useRef(null);
// selectedUserRef mirrors selectedUser state because ws.onmessage is defined
// once inside a useEffect([]) — without a ref it would always "see" the
// selectedUser value from the very first render (a stale closure), so
// incoming messages could never be correctly filtered to the open conversation.
const selectedUserRef=useRef(null);
const navigate=useNavigate();

useEffect(() => {
  selectedUserRef.current = selectedUser;
}, [selectedUser]);

useEffect(() =>{
const fetchUsers=async ()=>{
    try{
        const res= await axios.get("http://localhost:5001/api/users");
        setusers(res.data);

    }catch(err){
        console.log(err);
    }
};
    fetchUsers();

},[]);

useEffect(() => {
    if(!selectedUser) return;
    const fetchMessages= async () => {
        
        try {
            const res=await axios.get(`http://localhost:5001/api/messages/${selectedUser.id}`);
            setMessages(res.data);
        }catch(err){
            console.log(err);
        }
    };
    fetchMessages();


},[selectedUser]);

useEffect(() => {
  const ws = new WebSocket("ws://localhost:5001/ws");
  wsRef.current=ws

  ws.onopen = () => {
    console.log("WebSocket connected");
  };

 ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("Received:", event.data);
    if (data.type === "new_message") {
      const msg = data.message;
      const other = selectedUserRef.current;
      const belongsToOpenConversation =
        other && (msg.sender_id === other.id || msg.receiver_id === other.id);

      if (belongsToOpenConversation) {
        setMessages((prev) => [...prev, msg]);
      }
    }
  };
  ws.onclose = () => {
    console.log("WebSocket disconnected");
  };

  return () => {
    ws.close();
  };
}, []);

const sendMessage =async () =>{
    if (!selectedUser || !draft.trim()) return;

    wsRef.current.send(JSON.stringify({
    type: "send_message",
    to: selectedUser.id,
    content: draft
  }));

  setDraft("");
};

const handleLogout= async() => {
  const res= await axios.post("http://localhost:5001/api/auth/logout");
  setuser(null);
  navigate("/");
}



return (
  <div className="h-screen flex bg-gray-100">
    <aside className="w-64 bg-white border-r flex flex-col">
  {/* Header */}
  <div className="p-4 border-b">
    <div className="flex justify-between items-center mb-2">
      <h2 className="font-semibold text-gray-800 text-lg">Contacts</h2>
      <button
        onClick={handleLogout}
        className="text-xs font-medium bg-red-500 text-white px-3 py-1.5 rounded-md hover:bg-red-600"
      >
        Logout
      </button>
    </div>
    <div className="flex items-center gap-2 text-sm text-gray-500">
      <span className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold text-xs">
        {user.name.charAt(0).toUpperCase()}
      </span>
      <span>Logged in as <span className="font-medium text-gray-700">{user.name}</span></span>
    </div>
  </div>

  {/* Contacts list */}
  <div className="flex-1 overflow-y-auto">
    {users.map((u) => (
      <div
        key={u.id}
        onClick={() => setselectedUser(u)}
        className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b hover:bg-gray-50 ${
          selectedUser?.id === u.id ? "bg-blue-50" : ""
        }`}
      >
        <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 font-semibold text-sm">
          {u.name.charAt(0).toUpperCase()}
        </span>
        <p className="font-medium text-gray-800">{u.name}</p>
      </div>
    ))}
  </div>
</aside>


    {/* Main chat area */}
      <section className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            <div className="p-4 bg-white border-b font-semibold text-gray-800">
              {selectedUser.name}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-xs px-3 py-2 rounded-lg ${
                    m.sender_id === user.id
                      ? "bg-blue-500 text-white ml-auto"
                      : "bg-white border text-gray-800"
                  }`}
                >
                  {m.content}
                </div>
              ))}
            </div>
            <div className="p-4 bg-white border-t flex gap-2">
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 border rounded-md px-3 py-2"
              />
              <button
                onClick={sendMessage}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select someone on the left to start chatting.
          </div>
        )}
      </section>
    </div>
  );
};

export default Chat;