import { useEffect } from "react";
import { useMessageContext } from "../../context/messageprovider";
import "./style.css"


function Messages(params) {
    const msgcontext = useMessageContext();
    useEffect(() => {
        const timer = setTimeout(() => {
            msgcontext.set([]);
        }, 4000);
        return () => clearTimeout(timer);
    }, [msgcontext]);

    return (
        <div className="messages-container">
            {msgcontext.messages.map((item, i) => {
                return (
                    <div className={"message "+item.type}>
                        <p>{item.message}</p>
                    </div>
                );
            })}
        </div>
        
    )
}

export default Messages;