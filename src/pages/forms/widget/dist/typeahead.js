"use strict";
exports.__esModule = true;
var BasicTypeAhead_1 = require("@/components_source/Forms/Widget/TypeAhead/BasicTypeAhead");
var BloodHound_1 = require("@/components_source/Forms/Widget/TypeAhead/BloodHound");
var CustomTemplates_1 = require("@/components_source/Forms/Widget/TypeAhead/CustomTemplates");
var MultipleSectionsWithHeaders_1 = require("@/components_source/Forms/Widget/TypeAhead/MultipleSectionsWithHeaders");
var PreFetch_1 = require("@/components_source/Forms/Widget/TypeAhead/PreFetch");
var RtlSupport_1 = require("@/components_source/Forms/Widget/TypeAhead/RTL/RtlSupport");
var RemoteTypeAhead_1 = require("@/components_source/Forms/Widget/TypeAhead/RemoteTypeAhead");
var ScrollableDropdownMenu_1 = require("@/components_source/Forms/Widget/TypeAhead/ScrollableDropdownMenu");
var Breadcrumbs_1 = require("CommonElements/Breadcrumbs");
var reactstrap_1 = require("reactstrap");
var Constant_1 = require("utils/Constant");
var TypeAhead = function () {
    return (React.createElement("div", { className: "page-body" },
        React.createElement(Breadcrumbs_1["default"], { mainTitle: Constant_1.TypeAheadHeading, parent: Constant_1.FormWidgetsHeading, title: Constant_1.TypeAheadHeading }),
        React.createElement(reactstrap_1.Container, { fluid: true },
            React.createElement("div", { className: "typeahead typeahead-wrapper" },
                React.createElement(reactstrap_1.Row, null,
                    React.createElement(BasicTypeAhead_1["default"], null),
                    React.createElement(PreFetch_1["default"], null),
                    React.createElement(BloodHound_1["default"], null),
                    React.createElement(RemoteTypeAhead_1["default"], null),
                    React.createElement(CustomTemplates_1["default"], null),
                    React.createElement(MultipleSectionsWithHeaders_1["default"], null),
                    React.createElement(ScrollableDropdownMenu_1["default"], null),
                    React.createElement(RtlSupport_1["default"], null))))));
};
exports["default"] = TypeAhead;
