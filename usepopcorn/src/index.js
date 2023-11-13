import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import AppV2 from "./AppV2.js";
import AppV1 from "./AppV1.js";
import StarRating from "./StarRating";

function Test() {
  const [state, setState] = useState(0);
  return (
    <>
      <StarRating color="blue" handleState={setState} maxRating={5} />
      <span>This is the rating {state}</span>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    {/* <AppV1 /> */}
    <AppV2 />
    {/* <StarRating
      maxRating={5}
      message={["terrible", "Bad", "Okay", "Good", "best"]}
      defaultRating={3}
    />
    <StarRating size={50} color={"red"} maxRating={10} className="test" />
    <Test /> */}
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
