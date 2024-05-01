import { useState, createContext } from "react";

export const themeContext = createContext();

const ThemeProvider = ({children}) => {
    const [theme, setTheme] = useState("light");

    const changeTheme = (newTheme) =>{
        setTheme(newTheme);
    }

    return (
        <themeContext.Provider value={{theme, changeTheme}}>
            {children}
        </themeContext.Provider>
    )
}

export default ThemeProvider;