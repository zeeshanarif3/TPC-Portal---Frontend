import {createContext, useState} from "react";

export const ThemeContext = createContext();


function ThemeProvider({children}) {

    const [theme,setTheme] = useState("light"); //default
    // const [theme,setTheme] = useState("dark");


const toggleTheme = () => {
    const changeTheme = () => {
        setTheme(prev => prev === "light" ? "dark" : "light");
    };

    if (!document.startViewTransition) {
        changeTheme();
        return;
    }

    document.startViewTransition(() => {
        changeTheme();
    });
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