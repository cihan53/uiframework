/*
 * Copyright (c) 2019. Crypttech Yazılım
 * Author: Cihan Öztürk
 * Email: cihanozturk@crypttech.com
 */

import React from "react";

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    componentDidCatch(error, info) {
        // Display fallback UI
        this.setState({ hasError: true });
        // You can also log the error to an error reporting service
        // logErrorToMyService(error, info);

    }



    render() {


        if (this.state.hasError) {
            // You can render any custom fallback UI
            return <h1>I listened to your problems, now listen to mine: {this.state.exception}</h1>;
        }
        return this.props.children;
    }
}