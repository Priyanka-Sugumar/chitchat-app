import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken"
import pool from "../config/db.js"
import dotenv from "dotenv"

dotenv.config()
// userId -> live WebSocket connection. Lets us push a message to one specific
// recipient instead of broadcasting to everyone. Lives only in server memory —
// resets on restart, and won't work across multiple server instances without
// a shared store (e.g. Redis) if this ever needs to scale horizontally.
const clients =new Map();

function parseCookies(cookieHeader = "") {
  return Object.fromEntries(
    cookieHeader
      .split(";")
      .filter(Boolean)
      .map((pair) => {
        const [key, ...rest] = pair.trim().split("=");
        return [key, decodeURIComponent(rest.join("="))];
      })
  );
}

export function initwebsocket(server){
    const wss=new WebSocketServer({server,path:"/ws"});
    function broadcast(payload) {
  const data = JSON.stringify(payload);
  for (const socket of clients.values()) {
    if (socket.readyState === socket.OPEN) {
      socket.send(data);
    }
  }
}

    wss.on("connection",async (ws,req) =>{
        try{
        const cookies=parseCookies(req.headers.cookie);
        const token=cookies.token;
        if (!token){
            return ws.close(4001,"No Token")
        }
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        console.log(decoded);
        const user=await pool.query('select id,email,name from users where id= $1',[decoded.id]);
        if(user.rows.length===0){
            return ws.close(4001,"No user found")
        }
        const foundUser=user.rows[0]
        ws.userId=foundUser.id;
        clients.set(foundUser.id,ws)
        ws.send(JSON.stringify({type:"Connected",user:foundUser}));
        // 1. tell the new user who is already online
        ws.send(JSON.stringify({
        type: "online_users",
        userIds: [...clients.keys()],
        }));

        // 2. tell everyone that this user just came online
        broadcast({ type: "presence", userId: foundUser.id, online: true });

        ws.on("message",async (raw)=>{
            let data;
            try{
                data=JSON.parse(raw.toString());
                console.log("Received",data);
                if (data.type==="send_message"){
                const to= Number (data.to);
                const content= typeof data.content ==="string" ? data.content.trim():"";
                // Validate before inserting, not after — rejecting bad input here is free,
// but a bad row written to the DB is harder to undo. Order matters.
                if(!Number.isInteger(to)||!content){
                 return ws.send(JSON.stringify({type:"message",message:"Missing or invalid to or content"}));

                 }
                const insert = await pool.query(
               `INSERT INTO messages (sender_id, receiver_id, content)
                VALUES ($1, $2, $3)
                RETURNING id, sender_id, receiver_id, content, created_at`,
                [foundUser.id, to, content]);
                const message = insert.rows[0];
                console.log("Saved message:", message);
                const payload=JSON.stringify({type:"new_message",message});
                ws.send(payload);

                const recipientSocket=clients.get(to);
                if (recipientSocket && recipientSocket.readyState === recipientSocket.OPEN) {
  recipientSocket.send(payload);
} else {
  console.log(`User ${to} is not connected right now — message is saved, they'll see it next time they load this conversation`);
}
                
                 
                }
            }
                 catch{
                return ws.send(JSON.stringify({type:"error",message:"Invalid JSON"}));
                }


        });

        ws.on("close", () => {
  if (clients.get(foundUser.id) === ws) {
    clients.delete(foundUser.id);
     broadcast({ type: "presence", userId: foundUser.id, online: false });
    console.log(`User ${foundUser.id} disconnected`);
  }
});

    }catch(err){
        ws.close(4001,"Unauthorized user");

    }

});
 return wss;
}