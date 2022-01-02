import React from 'react';
import {Alert, AlertTitle, Button, ButtonGroup, Collapse, Container, Stack, TextField} from "@mui/material";
import {PointCheckerConfig} from "./config";

var globalRegister = undefined;

export class Register extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: false,
            isLogged: false,
            login: undefined,
            password: undefined,
            passwordRepeat: undefined,
            token: undefined
        };
        this.register = this.register.bind(this);
        globalRegister = this;
    };

    clear() {
        document.getElementById("login").value = "";
        document.getElementById("password_first").value = "";
        document.getElementById("password_second").value = "";
    }

    switchToLogin() {
        window.location.pathname = "login";
    }

    switchToInfo() {
        window.location.pathname = "info";
    }

    handleLoginChange = (event) => {
        this.setState({login: event.target.value});
    };

    handlePasswordChange = (event) => {
        this.setState({password: event.target.value});
    };

    handlePasswordRepeatChange = (event) => {
        this.setState({passwordRepeat: event.target.value});
    };

    async register() {
        //console.log(`user: ${globalRegister.state.login}`)
        const response = await fetch(`${PointCheckerConfig.server_url}/registration`, {
            method: 'POST',
            mode: 'cors',
            credentials: 'same-origin',
            body: JSON.stringify({
                login: globalRegister.state.login,
                password: globalRegister.state.password,
                passwordRepeat: globalRegister.state.passwordRepeat,
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const json = await response.json();
        if (response.status !== 200) {
            console.log(`STATUS: ${response.status}`);
            document.getElementById("errorMessage").innerText = json.description;
            globalRegister.setState({'error': true});
        } else {
            localStorage.setItem("token", json.user.token);
            globalRegister.setState({
                isLogged: true,
                token: json.user.token,
                login: undefined,
                password: undefined,
            });
            window.location = '/';
        }
    }

    render() {
        return (
            <Container>
                <Container maxWidth={"xs"} style={{"padding": "32px"}}>
                    <ButtonGroup variant="outlined" aria-label="text button group">
                        <Button size="large" onClick={this.switchToLogin}>Login</Button>
                        <Button size="large" variant="contained">Register</Button>
                        <Button size="large" onClick={this.switchToInfo}>Info</Button>
                    </ButtonGroup>
                </Container>
                <Container maxWidth={"xs"}>
                    <Stack spacing={2}>
                        <Collapse in={globalRegister.state.error}>
                            <Alert severity="error" id="errorAlert">
                                <AlertTitle>Registration Error</AlertTitle>
                                <div id="errorMessage"></div>
                            </Alert>
                        </Collapse>

                        <TextField id="login"
                                   label="Username"
                                   variant="filled"
                                   required={true}
                                   value={this.state.login}
                                   onChange={this.handleLoginChange}/>
                        <TextField id="password_first"
                                   label="Password"
                                   type="password"
                                   variant="filled"
                                   required={true}
                                   value={this.state.password}
                                   onChange={this.handlePasswordChange}/>
                        <TextField id="password_second"
                                   label="Repeat password"
                                   type="password"
                                   variant="filled"
                                   required={true}
                                   value={this.state.passwordRepeat}
                                   onChange={this.handlePasswordRepeatChange}/>
                        <Stack direction={"row-reverse"} spacing={2}>
                            <Button variant="outlined" onClick={globalRegister.clear}>Clear</Button>
                            <Button variant="contained" onClick={globalRegister.register}>Register</Button>
                        </Stack>
                    </Stack>
                </Container>
            </Container>
        )
    }
}