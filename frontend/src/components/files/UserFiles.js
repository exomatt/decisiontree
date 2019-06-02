import React, {Fragment} from "react";
import AddFiles from "./AddFiles";
import Files from "./Files";


export default function UserFiles() {
    return (
        <Fragment>
            <AddFiles/>
            <Files/>
        </Fragment>
    );
}