"use client";

import { Provider } from "react-redux";
import store from "../config/redux/store";
import app from "./app";


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Provider store={store}>
          {children}
          <div>hello</div>
          <app>

          </app>
        </Provider>

      </body>
    </html>
  );
}
