import { useState, createContext } from "react";

export const themeContext = createContext();

const ThemeProvider = ({children}) => {
    const LocalTheme = window.localStorage.getItem('theme') || 'light';
    const [theme, setTheme] = useState(LocalTheme);

    const changeTheme = (newTheme) =>{
        setTheme(newTheme);
        window.localStorage.setItem('theme', newTheme);
    }

    return (
        <themeContext.Provider value={{theme, changeTheme}}>
            {children}
        </themeContext.Provider>
    )
}

export default ThemeProvider;