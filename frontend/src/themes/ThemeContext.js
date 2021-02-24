import React, { Component } from "react";
import { light, dark } from './Themes'

const ThemeContext = React.createContext();

class ThemeProvider extends Component {
    state = {
        theme: dark
    }

    setTheme = (theme) => {
        this.setState((prevState) => ({ theme }))
    }

    render () {
        const { children } = this.props
        const { theme } = this.state
        const { setTheme } = this

        return (
        <ThemeContext.Provider
            value={{
                theme,
                setTheme,
            }}
        >
            {children}
        </ThemeContext.Provider>
        )
    }
}

export default ThemeContext

export {ThemeProvider}