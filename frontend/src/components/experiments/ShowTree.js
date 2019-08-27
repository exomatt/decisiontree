import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import Tree from 'react-d3-tree';

const myTreeData = [
    {
        name: 'Top Level',
        attributes: {
            keyA: 'val A',
            keyB: 'val B',
            keyC: 'val C',
        },
        children: [
            {
                name: 'Level 2: A',
                attributes: {
                    keyA: 'val A',
                    keyB: 'val B',
                    keyC: 'val C',
                },
            },
            {
                name: 'Level 2: B',
            },
        ],
    },
];

class ShowTree extends Component {
    static propTypes = {
        tree: PropTypes.array.isRequired,
    };

    render() {
        console.log(this.props.tree);
        console.log(myTreeData);
        // const parse = JSON.parse(this.tree);
        // console.log(parse)
        if (this.props.tree.length === 0) {
            return (
                <div id="treeWrapper" style={{width: '70em', height: '50em'}}>
                </div>
            );
        } else {
            return (
                <div id="treeWrapper" style={{width: '100em', height: '250em'}}>
                    <Tree data={this.props.tree} orientation={'vertical'} separation={{siblings: 2, nonSiblings: 2}}
                          translate={{x: 600, y: 200}} zoom={0.5}/>
                </div>
            );
        }
    }
}

const mapStateToProps = state => ({
    tree: state.experiments.tree
});

export default connect(mapStateToProps)(ShowTree);
