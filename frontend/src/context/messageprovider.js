import { createContext, useContext, useState } from "react";


const messageContext = createContext();

function MessageProvider({ children }) {
    const [messages, setMessages] = useState([])

    function appendMessage(message, status) {
        console.log(message);
        setMessages([...messages, {'message':message,type: status==200 ? 'success':'error'}]);
    }

    return (
        <messageContext.Provider value={{ 'messages': messages, 'set': setMessages,'append':appendMessage }}>
            {children}
        </messageContext.Provider>
    )
}


export const useMessageContext = () => useContext(messageContext);

export default MessageProvider;