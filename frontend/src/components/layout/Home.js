import React from "react";

export default function Home() {
    return <div className="card homeCard shadow p-3 mb-5 bg-white rounded">
        <div className="card-body">
            <h2 className="card-title">Welcome!</h2>
            <p className="card-text homeCardText">The Decision Tree application enables easy and transparent handling of
                the GDT
                system. GDT is a system written in C++ by the employees of the Białystok University of Technology, which
                enables the generation of decision trees. On this page you will be able to build your own decision trees
                and manage them in a simple way. The application was written by Mateusz Pernal as part of his
                engineering work. </p>
        </div>
    </div>

}