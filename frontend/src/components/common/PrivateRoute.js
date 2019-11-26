import React from 'react';
import {Redirect, Route} from "react-router-dom";
import {connect} from "react-redux";
import PropTypes from "prop-types";
import {checkAuthority} from "../../actions/auth";

const PrivateRoute = ({component: Component, auth, ...rest}) => {
    return (
        <Route {...rest}
               render={props => {
                   // console.log(auth);
                   if (auth.isLoading) {
                       return (
                           <div className="spinner-border text-secondary" role="status">
                               <span className="sr-only">Loading...</span>
                           </div>
                       )
                   } else if (!checkAuthority()) {
                       return <Redirect to={"/login"}/>
                   } else {
                       return <Component {...props}/>
                   }
               }}/>
    )
};

const mapStateToProps = state => ({
    auth: state.auth
});

export default connect(mapStateToProps)(PrivateRoute);