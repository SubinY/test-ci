export default {
  pages: ["pages/test/index", "pages/home/index", "pages/index/index"],
  window: {
    backgroundTextStyle: "light",
    navigationBarBackgroundColor: "#fff",
    navigationBarTitleText: "WeChat",
    navigationBarTextStyle: "black"
  },
  cloud: true,
  tabBar: {
    color: "#333333",
    selectedColor: "#D92500",
    backgroundColor: "#fafafa",
    borderStyle: "black",
    list: [
      {
        pagePath: "pages/test/index",
        text: "ๆ็"
      },
      {
        pagePath: "pages/home/index",
        text: "้ฆ้กต"
      }
    ]
  }
};
