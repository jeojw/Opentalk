import React, { createContext, useState, useContext } from 'react';

const MemberContext = createContext();

export const MemberProvider = ({ children }) => {
    const [memberId, setMemberId] = useState("");

    return (
        <MemberContext.Provider value={memberId}>
            {children}
        </MemberContext.Provider>
    );
};

export const useMemberContext = () => useContext(MemberContext);