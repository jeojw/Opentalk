import { useState, createContext } from "react";
import useSound from "use-sound";
import alarmSound from "../MP_Door Bell.mp3";

export const soundContext = createContext();

const SoundProvider = ({children}) => {
    const LocalVolume = window.localStorage.setItem('volume', 1);
    const [volume, setVolume] = useState(LocalVolume);
    const [play, { stop }] = useSound(alarmSound, {
        volume: volume
    });

    const setMute = () => {
        stop();
        setVolume(0);
        window.localStorage.setItem('volume', 0);
    };

    const setSound = () => {
        setVolume(1);
        window.localStorage.setItem('volume', 1);
    };

    return (
        <soundContext.Provider value={{ play, volume, setMute, setSound }}>
            {children}
        </soundContext.Provider>
    );
};

export default SoundProvider;