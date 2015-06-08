var React = require('react');
var $ = require('jquery');

var Dispatcher = require('./dispatcher');
var Helpers = require('./helpers');

var CellComponent = React.createClass({displayName: "CellComponent",

    getInitialState: function() {
        return {
            editing: this.props.editing,
            changedValue: this.props.value
        };
    },

    render: function() {
        var selected = (this.props.selected) ? 'selected' : '',
            ref = 'input_' + this.props.uid.join('_'),
            emptyValueSymbol = this.props.config.emptyValueSymbol || '',
            displayValue = (this.props.value === '' || !this.props.value) ? emptyValueSymbol : this.props.value,
            cellClasses = (this.props.cellClasses.length > 0) ? this.props.cellClasses + ' ' + selected : selected,
            cellContent;

        // Check if header - if yes, render it
        var header = this.renderHeader();
        if (header) {
            return header;
        }        

        // If not a header, check for editing and return 
        if (this.props.selected && this.props.editing) {
            cellContent = (
                React.createElement("input", {className: "mousetrap", 
                       onChange: this.handleChange, 
                       onBlur: this.handleBlur, 
                       ref: ref, 
                       defaultValue: this.props.value})
            )
        }

        return (
            React.createElement("td", {className: cellClasses, ref: this.props.uid.join('_')}, 
                React.createElement("div", {className: "reactTableCell"}, 
                    cellContent, 
                    React.createElement("span", {onDoubleClick: this.handleDoubleClick, onClick: this.handleClick}, 
                        displayValue
                    )
                )
            )
        );
    },

    componentDidUpdate: function(prevProps, prevState) {
        if (this.props.editing && this.props.selected) {
            var node = React.findDOMNode(this.refs['input_' + this.props.uid.join('_')]);
            node.focus();
        }

        if (prevProps.selected && prevProps.editing && this.state.changedValue !== this.props.value) {
            this.props.onCellValueChange(this.props.uid, this.state.changedValue);
        }
    },

    handleClick: function (e) {
        var cellElement = React.findDOMNode(this.refs[this.props.uid.join('_')]);
        this.props.handleSelectCell(this.props.uid, cellElement);
    },

    handleHeadClick: function (e) {
        var cellElement = React.findDOMNode(this.refs[this.props.uid.join('_')]);
        Dispatcher.publish('headCellClicked', cellElement, this.props.spreadsheetId);
    },

    handleDoubleClick: function (e) {
        e.preventDefault();
        this.props.handleDoubleClickOnCell(this.props.uid);
    },

    handleBlur: function (e) {
        var newValue = React.findDOMNode(this.refs['input_' + this.props.uid.join('_')]).value;

        this.props.onCellValueChange(this.props.uid, newValue, e);
        this.props.handleCellBlur(this.props.uid);
        Dispatcher.publish('cellBlurred', this.props.uid, this.props.spreadsheetId);
    },

    handleChange: function (e) {
        var newValue = React.findDOMNode(this.refs['input_' + this.props.uid.join('_')]).value;

        this.setState({changedValue: newValue});
    },

    /**
     * Checks if a header exists - if it does, it returns a header object
     * @return {false|react} [Either false if it's not a header cell, a react object if it is]
     */
    renderHeader: function () {
        var selected = (this.props.selected) ? 'selected' : '',
            uid = this.props.uid,
            config = this.props.config,
            emptyValueSymbol = this.props.config.emptyValueSymbol || '',
            displayValue = (this.props.value === '' || !this.props.value) ? emptyValueSymbol : this.props.value,
            cellClasses = (this.props.cellClasses.length > 0) ? this.props.cellClasses + ' ' + selected : selected;
        
        // Cases
        var headRow = (uid[0] === 0),
            headColumn = (uid[1] === 0),
            headRowAndEnabled = (config.hasHeadRow && uid[0] === 0),
            headColumnAndEnabled = (config.hasHeadColumn && uid[1] === 0)

        // Head Row enabled, cell is in head row
        // Head Column enabled, cell is in head column
        if (headRowAndEnabled || headColumnAndEnabled) {
            if (headColumn && config.hasLetterNumberHeads) {
                displayValue = uid[0];
            } else if (headRow && config.hasLetterNumberHeads) {
                displayValue = Helpers.countWithLetters(uid[1]);
            }

            if ((config.isHeadRowString && headRow) || (config.isHeadColumnString && headColumn)) {
                return (
                    React.createElement("th", {className: cellClasses, ref: this.props.uid.join('_')}, 
                        React.createElement("div", null, 
                            React.createElement("span", {onClick: this.handleHeadClick}, 
                                displayValue
                            )
                        )
                    )
                );
            } else {
                return (
                    React.createElement("th", {ref: this.props.uid.join('_')}, 
                        displayValue
                    )
                );
            }
        } else {
            return false;
        }
    }
});

module.exports = CellComponent;