import "./App.css";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
import Chatbot from "./front/component/Home/Chatbot";
import About from "./front/component/About/About";
import FirstAid from "./front/component/FirstAid/FirstAid";
import Main from "./front/component/Main";
import Navbar from "./front/component/NavBar/Navbar";
import { ThemeProvider } from "./front/context/ThemeContext";

function App() {
  return (
    <ThemeProvider>
      <div className="App">
        <Navbar />
      <Switch>
        <Route exact path="/">
          <Redirect to="/en" />
        </Route>

        <Route exact path="/:lng(en|ar)?" component={Chatbot} />
        <Route exact path="/:lng(en|ar)?/Home">
           <Redirect to="/en" />
        </Route>

        <Route path="/:lng(en|ar)?/Prediction" component={Main} />

        <Route exact path="/:lng(en|ar)?/About" component={About} />
        <Route exact path="/:lng(en|ar)?/FirstAid" component={FirstAid} />

        {/* Support legacy paths */}
        <Route exact path="/Care-Me" render={() => <Redirect to="/en" />} />
        <Route exact path="/First-Care" render={() => <Redirect to="/en" />} />
      </Switch>
    </div>
    </ThemeProvider>
  );
}

export default App;
