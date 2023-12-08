import { FormEvent, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Textarea } from "../components/ui/textarea"
import { Button } from "../components/ui/button"



const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "ws://localhost:3001";
const CONNECTION_COUNT_UPDATE_CHANNEL = "chat:connection-count-updated";
const NEW_MESSAGE_CHANNEL = "chat:new-message";


type Message ={
  message: string,
  id: string,
  createdAt: string,
  port: string,
}

function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketIo = io(SOCKET_URL, {
      reconnection: true,
      upgrade: true,
      transports: ["websocket", "polling"],
    });

    setSocket(socketIo);

    return function () {
      socketIo.disconnect();
    };
  }, []);

  return socket; 
}

export default function Home() {
  const meassageListRef = useRef<HTMLOListElement |null>(null)
  const [newMessage,setNewMessage] =useState('')
  const [message,setMessage] =useState<Array<Message>>([])
  const [connectionCount,setConnectionCount]= useState(0)

  const socket = useSocket();

  function scrollToBottom(){
    if(meassageListRef.current){
      meassageListRef.current.scrollTop = meassageListRef.current.scrollHeight +1000;
    }
  }

   
  useEffect(() => {
    socket?.on("connect", () => {
      console.log('connected to socket');
    });

    //Receive new message

    socket?.on(NEW_MESSAGE_CHANNEL,(message:Message)=>{
       setMessage((prevMessages)=> [message,...prevMessages])
        
       setTimeout(()=>{
        scrollToBottom()
       },0)

      

    })

   socket?.on(CONNECTION_COUNT_UPDATE_CHANNEL,({count}:{
    count:number
   })=>{
    setConnectionCount(count)
   })
  },[socket]); 
   
function handleSubmit(e: FormEvent<HTMLFormElement>){
  e.preventDefault()

  socket?.emit(NEW_MESSAGE_CHANNEL,{
    message:newMessage,
  })



  setNewMessage('')

}

  return <main className="flex flex-col p-4 w-full max-3-3xl m-auto">
    <h1 className="text-4xl font-bold text-center mb-4">
   Chat {connectionCount}
    </h1>
    <ol className=""
        ref={meassageListRef}
    >  
    {message.map(m=>{
      return <li  className="bg-gray-100 rounded-lg p-4 my-2 break-all" 
      key={m.id}>{m.message}
        <p className="text-small text-gray-500">{m.createdAt}</p>
        <p className="text-small text-gray-500">{m.port}</p>
      
      </li>
    
     })}
    </ol>
    
     <form onSubmit={handleSubmit}>
       <Textarea className="rounded-lg mr-4"
        placeholder="Tell is what's on your mind"
        value={newMessage}
        onChange={(e)=>setNewMessage(e.target.value)}
        maxLength={255}
       />
    <Button variant="outline">Send Message</Button>
  


     </form>
  </main>;
}
