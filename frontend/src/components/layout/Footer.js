import React from "react";
import "./index.css"

export default function Footer() {
    return <footer className={"navbar-dark bg-primary footer"}>
            <div className={"container"}>
           <span className="navbar-text mr-3 footerText">
               <strong>Copyright © 2019 Decision tree</strong>
               </span><br/>
                <span className="navbar-text mr-3 footerText">
                    <strong>Created by Mateusz Pernal</strong>
                </span>
            </div>
        </footer>

}