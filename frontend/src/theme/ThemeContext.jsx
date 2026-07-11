import {createContext, useState} from "react";

export const ThemeContext = createContext();


function ThemeProvider({children}) {

    // const [theme,setTheme] = useState("light");
    const [theme,setTheme] = useState("dark");


    const toggleTheme = ()=>{
        setTheme(
            theme === "light" 
            ? "dark" 
            : "light"
        );
    };


    return (
        <ThemeContext.Provider 
            value={{theme,toggleTheme}}
        >
            <div data-theme={theme}>
                {children}
            </div>
        </ThemeContext.Provider>
    );
}


export default ThemeProvider;