import React from 'react';
import {Alert, AlertTitle, Button, ButtonGroup, Collapse, Container, Stack, TextField} from "@mui/material";
import {PointCheckerConfig} from './config'

var globalLogin = undefined;

export class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: false,
            isLogged: false,
            login: undefined,
            password: undefined,
            token: undefined
        }
        globalLogin = this;
    }

    clear = () => {
        this.setState({
            login: undefined,
            password: undefined
        });
    }

    switchToRegister = () => {
        window.location.pathname = "register";
    }

    switchToInfo = () => {
        window.location.pathname = "info";
    }

    handleLoginChange = (event) => {
        this.setState({login: event.target.value});
    };

    handlePasswordChange = (event) => {
        this.setState({password: event.target.value});
    };

    async login() {
        const response = await fetch(`${PointCheckerConfig.server_url}/login`, {
            method: 'POST',
            mode: 'cors',
            credentials: 'same-origin',
            body: JSON.stringify({
                login: globalLogin.state.login,
                password: globalLogin.state.password
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const json = await response.json();
        if (response.status !== 200) {
            document.getElementById("errorMessage").innerText = json.description;
            globalLogin.setState({'error': true});
        } else {
            localStorage.setItem("token", json.token);
            globalLogin.setState({
                isLogged: true,
                token: json.token,
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
                        <Button size="large" variant="contained" onClick={this.login}>Login</Button>
                        <Button size="large" onClick={this.switchToRegister}>Register</Button>
                        <Button size="large" onClick={this.switchToInfo}>Info</Button>
                    </ButtonGroup>
                </Container>
                <Container maxWidth={"xs"}>
                    <Stack spacing={2}>
                        <Collapse in={globalLogin.state.error}>
                            <Alert severity="error" id="errorAlert">
                                <AlertTitle>Login Error</AlertTitle>
                                <div id="errorMessage"></div>
                            </Alert>
                        </Collapse>
                        <TextField id="login"
                                   label="Username"
                                   variant="filled"
                                   required={true}
                                   value={this.state.login}
                                   onChange={this.handleLoginChange}/>
                        <TextField id="password"
                                   label="Password"
                                   type="password"
                                   variant="filled"
                                   required={true}
                                   value={this.state.password}
                                   onChange={this.handlePasswordChange}/>
                        <Stack direction={"row-reverse"} spacing={2}>
                            <Button variant="outlined" onClick={this.clear}>Clear</Button>
                            <Button variant="contained" onClick={this.login}>Login</Button>
                        </Stack>
                    </Stack>
                </Container>
            </Container>
        )
    }
}