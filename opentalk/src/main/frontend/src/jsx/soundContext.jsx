import { createContext } from "react";
import useSound from "use-sound";
import alarmSound from "../MP_Door Bell.mp3";

export const soundContext = createContext();

const SoundProvider = ({children}) => {
    const [play] = useSound(alarmSound);

    return (
        <soundContext.Provider value={{play}}>
            {children}
        </soundContext.Provider>
    )
}

export default SoundProvider;