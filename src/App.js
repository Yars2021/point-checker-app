import './styles/App.css';
import {Login} from "./pages/Login";
import {Register} from "./pages/Register";
import {Info} from "./pages/Info";
import {PointsManager} from "./pages/PointsManager";
import {Routes, Route} from "react-router";

function App() {
    return (
        <div className="App">
            <Routes>
                <Route exact path="/login" element={<Login/>}/>
                <Route exact path="/register" element={<Register/>}/>
                <Route exact path="/info" element={<Info/>}/>
                <Route exact path="/" element={<PointsManager/>}/>
            </Routes>
        </div>
    );
}

export default App;
