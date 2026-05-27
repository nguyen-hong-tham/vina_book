import { useState } from "react";

export default function ChatWidget(){

  const [open,setOpen]=useState(false);
  const [message,setMessage]=useState("");
  const [messages,setMessages]=useState([]);
  const [loading,setLoading]=useState(false);

  const sendMessage = async()=>{

    if(!message.trim()) return;

    const userText = message;

    setMessages(prev=>[
      ...prev,
      {
        sender:"user",
        text:userText
      }
    ]);

    setMessage("");
    setLoading(true);

    try{

      const res = await fetch("/api/chat",{

        method:"POST",

        headers:{
          "Content-Type":"application/json"
        },

        body:JSON.stringify({
          message:userText
        })

      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Lỗi kết nối chatbot.");
      }

      setMessages(prev=>[
        ...prev,
        {
          sender:"bot",
          text:data.reply
        }
      ]);

    }catch(err){

      setMessages(prev=>[
        ...prev,
        {
          sender:"bot",
          text:err.message || "Lỗi kết nối chatbot."
        }
      ]);

    }finally{

      setLoading(false);

    }

  };

  return(
    <>
      <button
        onClick={()=>setOpen(!open)}
        className="
        fixed
        bottom-6
        right-6
        z-50
        w-16
        h-16
        rounded-full
        bg-blue-600
        text-white
        shadow-lg
        "
      >
        CHAT BOX
      </button>

      {open && (

        <div
          className="
          fixed
          right-6
          bottom-24
          w-[360px]
          h-[520px]
          bg-white
          rounded-2xl
          shadow-2xl
          border
          flex
          flex-col
          z-50
          "
        >

          <div className="p-4 border-b font-bold">

            Vinabook Assistant

          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">

            {messages.map((msg,index)=>(

              <div
                key={index}
                className={
                  msg.sender==="user"
                  ? "text-right"
                  : "text-left"
                }
              >

                <div
                  className={
                    msg.sender==="user"
                    ? "inline-block bg-blue-600 text-white px-4 py-2 rounded-xl whitespace-pre-wrap max-w-[85%] text-left"
                    : "inline-block bg-gray-100 px-4 py-2 rounded-xl whitespace-pre-wrap max-w-[85%]"
                  }
                >

                  {msg.text}

                </div>

              </div>

            ))}

            {loading && (

              <p className="text-sm text-gray-500">

                AI đang suy nghĩ...

              </p>

            )}

          </div>

          <div className="p-4 border-t flex gap-2">

            <input
              value={message}
              onChange={(e)=>setMessage(e.target.value)}
              onKeyDown={(e)=>{

                if(e.key==="Enter"){

                  sendMessage();

                }

              }}
              placeholder="Hỏi về sách..."
              className="
              flex-1
              border
              rounded-lg
              px-3
              py-2
              "
            />

            <button
              onClick={sendMessage}
              className="
              bg-blue-600
              text-white
              px-4
              rounded-lg
              "
            >
              Send
            </button>

          </div>

        </div>

      )}

    </>
  );

}