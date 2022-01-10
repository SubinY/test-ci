import React, { Component } from "react";
import Taro, { Config } from "@tarojs/taro";
import { View, Text } from "@tarojs/components";
import Login from "../../components/login/index";
import "./index.less";

export default class Index extends Component {
  componentWillMount() {}

  componentDidMount() {}

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}

  render() {
    return (
      <View className="index">
        <Login />
      </View>
    );
  }
}
