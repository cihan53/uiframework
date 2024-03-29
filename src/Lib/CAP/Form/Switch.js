/*
 * Copyright (c) 2019. Crypttech Yazılım
 * Author: Cihan Öztürk
 * Email: cihanozturk@crypttech.com
 */

import React from "react";
import {AppSwitch} from "@coreui/react";
import PropTypes from "prop-types";
import Utils from "../Utils/Utils";


export default class SwitchField extends React.Component {
    static defaultProps = {
        id: Utils.ShortId.generate(),
        defaultChecked: false,
        onChange: (e, v) => {
        },
        variant: "pill",
        className: "mx-1",
        color: "primary",
        label:{
            on:Utils.__t("On")  ,
            off:Utils.__t("Off")
        }
    };

    render() {

        return <AppSwitch defaultChecked={this.props.defaultChecked}
                          onChange={this.props.onChange}
                          className={this.props.className}
                          variant={this.props.variant}
                          color={this.props.color}
        />
    }
}

SwitchField.propTypes = {
    onChange: PropTypes.func,
};
