import React, {Component} from 'react';
import {Link, Redirect} from "react-router-dom";
import {connect} from "react-redux";
import PropTypes from "prop-types";
import {login, register} from "../../actions/auth";
import {createMessage} from "../../actions/messages";
import ReCAPTCHA from "react-google-recaptcha";


class Register extends Component {
    state = {
        username: '',
        email: '',
        password: '',
        password2: ''
    };
    static propTypes = {
        register: PropTypes.func.isRequired,
        isAuthenticated: PropTypes.bool
    };
    onSubmit = e => {
        e.preventDefault();
        const {username, email, password, password2} = this.state;
        if (!/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(this.state.email)) {
            this.props.createMessage({passwordNotMatch: 'Incorrect email'});
            return;
        }
        if (this.captcha === false) {
            this.props.createMessage({passwordNotMatch: 'Please fill captcha input'});
            return;
        }
        if (username.length > 150) {
            this.props.createMessage({passwordNotMatch: 'Username is too long'});
            return;
        }
        if (password.length <= 5) {
            this.props.createMessage({passwordNotMatch: 'Password is too short - must be at least 6 characters'});
            return;
        }
        if (password.length >= 50) {
            this.props.createMessage({passwordNotMatch: 'Password is too long'});
            return;
        }
        if (password !== password2) {
            this.props.createMessage({passwordNotMatch: 'Password do not match'});
        } else {
            const newUser = {
                username,
                password,
                email
            };
            this.props.register(newUser);
        }
    };
    onChange = e => this.setState({[e.target.name]: e.target.value});

    captcha = false;

    onChange2 = value => {
        this.captcha = true;
    };

    render() {
        if (this.props.isAuthenticated) {
            return <Redirect to="/"/>
        }
        const {username, email, password, password2} = this.state;
        return (
            <div className="col-md-6 m-auto">
                <div className="card card-body mt-5">
                    <h2 className="text-center">Register</h2>
                    <form onSubmit={this.onSubmit}>
                        <div className="form-group">
                            <label>Username</label>
                            <input
                                type="text"
                                className="form-control"
                                name="username"
                                onChange={this.onChange}
                                value={username}
                            />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                className="form-control"
                                name="email"
                                onChange={this.onChange}
                                value={email}
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                className="form-control"
                                name="password"
                                onChange={this.onChange}
                                value={password}
                            />
                        </div>
                        <div className="form-group">
                            <label>Confirm Password</label>
                            <input
                                type="password"
                                className="form-control"
                                name="password2"
                                onChange={this.onChange}
                                value={password2}
                            />
                        </div>

                        <div className="form-group">
                            <ReCAPTCHA
                                sitekey="6LfYqMQUAAAAACi0SDY4GJ19b_OA-715TXSFPQ8F"
                                // sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                                onChange={this.onChange2}
                            /></div>
                        <div className="form-group">
                            <button type="submit" className="btn btn-primary">
                                Register
                            </button>
                        </div>
                        <p>
                            Already have an account? <Link to="/login">Login</Link>
                        </p>
                    </form>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    isAuthenticated: state.auth.isAuthenticated
});

export default connect(mapStateToProps, {register, createMessage})(Register);