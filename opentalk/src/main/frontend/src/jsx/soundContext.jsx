import { useState, createContext } from "react";
import useSound from "use-sound";
import alarmSound from "../MP_Door Bell.mp3";

export const soundContext = createContext();

const SoundProvider = ({children}) => {
    const [volume, setVolume] = useState(1);
    const [play, { stop }] = useSound(alarmSound, {
        volume: volume
    });

    const setMute = () => {
        stop();
        setVolume(0);
    };

    const setSound = () => {
        setVolume(1);
    };

    return (
        <soundContext.Provider value={{ play, volume, setMute, setSound }}>
            {children}
        </soundContext.Provider>
    );
};

export default SoundProvider;