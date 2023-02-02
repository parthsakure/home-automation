import { createContext, useContext, useState } from "react";


const userExistContext = createContext();

function UserProvider({ children }) {
    const [userExist, setUserExist] = useState(() => localStorage.getItem('access_token') ? true : false);

    return (
        <userExistContext.Provider value={{ 'user': userExist, 'set': setUserExist }}>
            {children}
        </userExistContext.Provider>
    )
}

export const useUserExistContext = ()=>useContext(userExistContext);

export default UserProvider;
