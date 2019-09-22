import React, {Component} from 'react';
import {connect} from "react-redux";
import PropTypes from "prop-types";
import {changeFileName, deleteFiles, getFiles} from "../../actions/files";
import {Modal} from "react-bootstrap";


class Files extends Component {
    static propTypes = {
        files: PropTypes.array.isRequired,
        getFiles: PropTypes.func.isRequired,
        deleteFiles: PropTypes.func.isRequired,
        changeFileName: PropTypes.func.isRequired
    };
    // state = {
    //     isShowingModal: false,
    //     name: '',
    //     filename: ''
    // };

    componentDidMount() {
        this.props.getFiles();
    }

    //
    // onChange = e => this.setState({[e.target.name]: e.target.value});
    // handleShow = () => {
    //     var $text = $(this).closest("tr")   // Finds the closest row <tr>
    //         .siblings(":first")    // Gets a descendent with class="nr"
    //         .text();
    //     console.log(text)
    //     this.setState({isShowingModal: true, filename: text});
    // };
    //
    // handleClose = () => this.setState({isShowingModal: false});
    // handleSubmit = () => {
    //     // let object = {
    //     //     filename: this.state.filename,
    //     //     new_name: this.state.name
    //     // };
    //     // console.log(object);
    //     // this.props.changeFileName(object);
    //     // this.setState({
    //     //     isShowingModal: false,
    //     //     name: '',
    //     //     filename: ''
    //     // });
    //     this.props.getFiles();
    // };

    render() {
        // const name = this.state.name;
        return (
            <div>
                {/*<Modal show={this.state.isShowingModal} onHide={this.handleClose} animation={true}>*/}
                {/*    <Modal.Header closeButton>*/}
                {/*        <Modal.Title>New name form</Modal.Title>*/}
                {/*    </Modal.Header>*/}
                {/*    <Modal.Body>New file name: </Modal.Body>*/}
                {/*    <input type="text"*/}
                {/*           className="form-control"*/}
                {/*           name="name"*/}
                {/*           value={name}*/}
                {/*           placeholder="Enter new name"*/}
                {/*           onChange={this.onChange}/>*/}
                {/*    <Modal.Footer>*/}
                {/*        <button type="button"*/}
                {/*                className="btn btn-secondary" onClick={this.handleClose}>*/}
                {/*            Close*/}
                {/*        </button>*/}
                {/*        <button type="submit"*/}
                {/*                className="btn btn-primary" onClick={this.handleSubmit.bind()}>*/}
                {/*            Save Changes*/}
                {/*        </button>*/}
                {/*    </Modal.Footer>*/}
                {/*</Modal>*/}
                <h1>Files:</h1>
                <table className="table table-striped">
                    <thead>
                    <tr>
                        <th>Name</th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.props.files.map(file => (
                        <tr key={file}>
                            <td>{file}</td>
                            <td>
                                <button onClick={this.props.deleteFiles.bind(this, file)} type="button"
                                        className="btn btn-primary">Delete
                                </button>
                            </td>
                            {/*<td>*/}
                            {/*    <button type="button"*/}
                            {/*            className="btn btn-primary" onClick={(event) => {*/}
                            {/*        this.handleShow.bind();*/}
                            {/*        var text = $(this).closest("tr")   // Finds the closest row <tr>*/}
                            {/*            .siblings(":first")    // Gets a descendent with class="nr"*/}
                            {/*            .text();*/}
                            {/*        console.log(text)*/}

                            {/*    }*/}
                            {/*    }>*/}
                            {/*        Change name*/}
                            {/*    </button>*/}
                            {/*</td>*/}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    files: state.files.files
});

export default connect(mapStateToProps, {getFiles, deleteFiles, changeFileName})(Files);