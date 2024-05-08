import { useState, createContext } from "react";

export const alarmContext = createContext();

const AlarmProvider = ({children}) => {
    const [alarms, setAlarms] = useState([]);

    return (
        <alarmContext.Provider value={{alarms, setAlarms}}>
            {children}
        </alarmContext.Provider>
    )
}

export default AlarmProvider;