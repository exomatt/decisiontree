import React, {Component} from 'react';
import {Link} from "react-router-dom";
import {connect} from "react-redux";
import PropTypes from "prop-types";
import {logout} from "../../actions/auth";


export class Header extends Component {
    static propTypes = {
        auth: PropTypes.object.isRequired,
        logout: PropTypes.func.isRequired
    };

    render() {
        const {isAuthenticated, user} = this.props.auth;
        const authLinks = (
            <ul className="navbar-nav mr-auto">
                 <span className="navbar-text mr-3">
                                 <strong>{user ? `Welcome ${user.username}` : ""}
                      </strong>
            </span>
                <li className="nav-item active">
                    <button onClick={this.props.logout} type="button" className="btn btn-secondary">Logout</button>
                </li>
            </ul>
        );
        const guestLinks = (
            <ul className="navbar-nav mr-auto">
                <li className="nav-item active">
                    <Link to={"/register"} className={"nav-link"}>Register</Link>
                </li>
                <li className="nav-item">
                    <Link to={"/login"} className={"nav-link"}>Login</Link>
                </li>
            </ul>
        );
        return (
            <nav className="navbar navbar-expand-sm navbar-dark bg-primary">
                <div className="container">
                    <a className="navbar-brand" href="/">Decision trees</a>
                    <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarColor01"
                            aria-controls="navbarColor01" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse  " id="navbarColor01">
                        {isAuthenticated ? authLinks : guestLinks}
                    </div>
                </div>
            </nav>
        )
    }
}

const mapStateToProps = state => ({
    auth: state.auth
});

export default connect(mapStateToProps, {logout})(Header);