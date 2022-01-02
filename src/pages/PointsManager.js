import React from 'react'
import {Graph} from '../graph/graph.js'
import {
    Box,
    Button,
    Container,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    ToggleButton,
    ToggleButtonGroup
} from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import {PointCheckerConfig} from './config'

let graph = undefined;
let globalHolder = undefined;

export class PointsManager extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            point: {
                x: 0,
                y: 0,
                r: 2
            },
            rows: []
        }
        globalHolder = this;
    }

    clear() {
        document.getElementById("yField").value = "";
    }

    logout() {
        fetch(`${PointCheckerConfig.server_url}/logout`, {
            method: 'DELETE',
            mode: 'cors',
            credentials: 'same-origin',
            headers: {
                Token: localStorage.getItem('token')
            }
        });
        localStorage.removeItem('token');
        window.location.pathname = "login";
    }

    createData(ID, X, Y, R, DATETIME, HIT) {
        return {ID, X, Y, R, DATETIME, HIT};
    }

    addRow(point) {
        let lPoint = this.createData(point.id, point.x, point.y, point.r, point.created, point.hit);
        let lRows = this.state.rows;
        lRows.push(lPoint);
        this.setState({
            point: {
                x: this.state.point.x,
                y: this.state.point.y,
                r: this.state.point.r
            },
            rows: lRows
        });
    }

    async loadPoints() {
        try {
            //console.log('loadPoints: START');
            const response = await fetch(`${PointCheckerConfig.server_url}/points`, {
                method: 'GET',
                mode: 'cors',
                credentials: 'same-origin',
                headers: {
                    Token: localStorage.getItem('token')
                }
            });
            const json = await response.json();
            // If the request is  not authorized, then redirect to the Login page
            if (response.status === 401) {
                window.location = '/login';
            }
            let points = json.points;
            this.setState({
                point: {
                    x: this.state.point.x,
                    y: this.state.point.y,
                    r: this.state.point.r
                },
                rows: []
            });
            graph.dots = [];
            points.forEach((point) => {
                this.addRow(point);
                graph.addDot(point.x, point.y, point.hit);
            })
            //console.log('loadPoints: END');
        } catch (error) {
            console.error('ERROR:', error);
        }
    }

    async checkPoint(_x, _y, _r, _holder) {
        try {
            const response = await fetch(`${PointCheckerConfig.server_url}/points`, {
                method: 'POST',
                mode: 'cors',
                credentials: 'same-origin',
                body: JSON.stringify({
                    x: _x,
                    y: _y,
                    r: _r
                }),
                headers: {
                    'Content-Type': 'application/json',
                    Token: localStorage.getItem('token')
                }
            });
            //const json = await response.json();
            // If the request is  not authorized, then redirect to the Login page
            if (response.status === 401) {
                window.location = '/login';
            }
            // let point = json.point;
            //_holder.addRow(point);
            _holder.loadPoints();
        } catch (error) {
            console.error('ERROR:', error);
        }
    }

    formCheckPoint() {
        // console.log("checkPoint: START");
        // console.log(globalHolder);
        globalHolder.checkPoint(globalHolder.state.point.x, globalHolder.state.point.y, globalHolder.state.point.r, globalHolder);
        // console.log("checkPoint: END");
    }

    componentDidMount() {
        graph = new Graph('#graphContainer', 480, 480, "#coordX", "#coordY", this.checkPoint, this);
        graph.animate();
        this.loadPoints();
    }

    handleXChange = (event, newX) => {
        this.setState({
            point: {
                x: newX,
                y: this.state.point.y,
                r: this.state.point.r
            },
            rows: this.state.rows
        });
    };

    handleYChange = (event) => {
        let yVal = event.nativeEvent.target.value;
        if (yVal < graph.LIMITS.y.min ||
            yVal > graph.LIMITS.y.max) {
            yVal = 0.0
        }
        this.setState({
            point: {
                x: this.state.point.x,
                y: yVal,
                r: this.state.point.r
            },
            rows: this.state.rows
        });
    };

    handleRChange = (event, newR) => {
        this.setState({
            point: {
                x: this.state.point.x,
                y: this.state.point.y,
                r: newR
            },
            rows: this.state.rows
        });
        document.getElementById('canvasGraph').graphComponent.setGraphR(newR);
    };

    valuetext(value) {
        return `Y=${value}`;
    }

    render() {
        // Form: X
        const xValues = [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2];
        const xToggleButtons = [];
        xValues.forEach(xVal => {
            xToggleButtons.push(<ToggleButton value={xVal} key={xVal}>{xVal}</ToggleButton>);
        });
        // Form: Y

        // Form: R
        const rValues = [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2];
        const rToggleButtons = [];
        rValues.forEach(rVal => {
            rToggleButtons.push(<ToggleButton value={rVal} key={rVal}>{rVal}</ToggleButton>);
        });

        return (
            <Grid container spacing={1}>
                <Grid item xs={12} md={7} xl={5}>
                    <Container>
                        <Container className="coords">
                            <Container>X: <span id="coordX"/></Container>
                            <Container>Y: <span id="coordY"/></Container>
                        </Container>
                        <Container id="graphContainer"/>
                    </Container>
                </Grid>
                <Grid item xs={12} md={5} xl={7}>
                    <div className="Input-panel">
                        <div className="Input-row">
                            X Value:
                        </div>
                        <div className="Input-row">
                            <ToggleButtonGroup
                                aria-label="rButtons"
                                size="small"
                                exclusive
                                color={"primary"}
                                value={this.state.point.x}
                                onChange={this.handleXChange}>
                                {xToggleButtons}
                            </ToggleButtonGroup>
                        </div>
                        <div className="Input-row">
                            Y Value:
                        </div>
                        <div className="Input-row">
                            <TextField
                                id="yField"
                                size="small"
                                sx={{m: 0, width: '361px'}}
                                label="A number between -3 and 5"
                                type="number"
                                value={this.state.point.y}
                                onChange={(event) => this.handleYChange(event)}
                                InputProps={{
                                    inputProps: {
                                        pattern: '[+-]?[0-9]([.,][0-9])?',
                                        min: -3, max: 5,
                                        step: 0.1
                                    }
                                }}
                                variant="outlined"/>
                        </div>
                        <div className="Input-row">
                            R Value:
                        </div>
                        <div className="Input-row">
                            <ToggleButtonGroup
                                aria-label="rButtons"
                                size="small"
                                exclusive
                                color={"primary"}
                                value={this.state.point.r}
                                onChange={this.handleRChange}>
                                {rToggleButtons}
                            </ToggleButtonGroup>
                        </div>
                        <div className="Input-row">
                            <Box sx={{'& button': {m: 1}}}>
                                <Button variant="contained" onClick={this.formCheckPoint}>Check</Button>
                                <Button variant="outlined" onClick={this.clear}>Clear</Button>
                                <Button variant="outlined" onClick={this.logout}>Log Out</Button>
                            </Box>
                        </div>
                    </div>
                </Grid>
                <Grid item xs={12} md={12} xl={12}>
                    <Container className="Table-container">
                        <Table sx={{minWidth: 650}} aria-label="simple table" id="pointsTable">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Points</TableCell>
                                    <TableCell align="center">X</TableCell>
                                    <TableCell align="center">Y</TableCell>
                                    <TableCell align="center">R</TableCell>
                                    <TableCell align="center">Date and Time</TableCell>
                                    <TableCell align="center">Hit</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {this.state.rows.map((row) => (
                                    <TableRow
                                        key={row.ID}
                                        sx={{'&:last-child td, &:last-child th': {border: 0}}}>
                                        <TableCell component="th" scope="row">
                                            {/*{row.ID}*/}&nbsp;
                                        </TableCell>
                                        <TableCell align="center">{row.X.toFixed(1)}</TableCell>
                                        <TableCell align="center">{row.Y.toFixed(1)}</TableCell>
                                        <TableCell align="center">{row.R.toFixed(1)}</TableCell>
                                        <TableCell align="center">{row.DATETIME}</TableCell>
                                        <TableCell align="center">{row.HIT ? <CheckCircleIcon/> :
                                            <HighlightOffIcon/>}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Container>
                </Grid>
            </Grid>
        );
    }
}