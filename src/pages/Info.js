import React from 'react';
import {Alert, AlertTitle, Button, ButtonGroup, Container, Grid, Stack} from "@mui/material";

export class Info extends React.Component {
    switchToLogin() {
        window.location.pathname = "login";
    }

    switchToRegister() {
        window.location.pathname = "register";
    }

    render() {
        return (
            <Container>
                <Container maxWidth={"xs"} style={{"padding": "32px"}}>
                    <ButtonGroup variant="outlined" aria-label="text button group">
                        <Button size="large" onClick={this.switchToLogin}>Login</Button>
                        <Button size="large" onClick={this.switchToRegister}>Register</Button>
                        <Button size="large" variant="contained">Info</Button>
                    </ButtonGroup>
                </Container>
                <Container maxWidth={"xs"}>
                    <Stack spacing={2}>
                        <Alert severity="info">
                            <AlertTitle className="Info-title">Information card</AlertTitle>
                            <Grid container spacing={2}>
                                <Grid className="Info-line" item xs={6} md={4}>
                                    Author:
                                </Grid>
                                <Grid className="Info-line" item xs={6} md={8}>
                                    Yaroslav Sukhovey
                                </Grid>
                                <Grid className="Info-line" item xs={6} md={4}>
                                    Group:
                                </Grid>
                                <Grid className="Info-line" item xs={6} md={8}>
                                    P3214
                                </Grid>
                                <Grid className="Info-line" item xs={6} md={4}>
                                    Variant:
                                </Grid>
                                <Grid className="Info-line" item xs={6} md={8}>
                                    30360
                                </Grid>
                            </Grid>
                        </Alert>
                        <Alert severity="success">
                            <AlertTitle>
                                <a
                                    href="https://github.com/Yars2021/point-checker-app"
                                    target="_blank"
                                    rel="noreferrer"
                                >Github link</a>
                            </AlertTitle>
                        </Alert>
                    </Stack>
                </Container>
            </Container>
        )
    }
}