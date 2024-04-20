import React, { createContext, useState } from 'react';

export const TokenContext = createContext();

export const TokenProvider = ({ children }) => {
    const [loginToken, setLoginToken] = useState("");

    const updateToken = (newToken) => {
        setLoginToken(newToken);
    };

    return (
        <TokenContext.Provider value={{ loginToken, updateToken }}>
            {children}
        </TokenContext.Provider>
    );
};