import React from "react";
import {render} from "react-dom";
import {target} from './const';
import init from "./init";

// Load components
import Loader from "./components/Loader/Loader";

render(<Loader text="Initializing TexDocs"/>, target);

init();
