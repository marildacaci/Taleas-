import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

import { initAmplify } from "./amplify.js";

initAmplify();

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

