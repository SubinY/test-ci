import { Canvas, View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useCallback, useEffect, useRef, useState } from "react";
import { Image, Button, Field } from "@taroify/core";
import "./index.less";
import EditImg from "@/components/EditImg";
import ImageMask from "@/services/imageMask";

const Test: React.FC<any> = () => {
  let maskRef = useRef<any>(null);
  const [msg, setMsg] = useState("");
  const [cusStyle, setCusStyle] = useState({ width: 0, height: 0 });
  const [showImgSrc, setShowImgSrc] = useState("");

  useEffect(() => {
    maskRef.current = new ImageMask({ debug: false });
  }, []);

  const handleChooseImg = useCallback(async () => {
    const chooseFile = await Taro.chooseImage({
      count: 1,
      sizeType: ["original", "compressed"],
      sourceType: ["album", "camera"]
    });

    const { errMsg, tempFiles, tempFilePaths } = chooseFile;
    if (errMsg === "chooseImage:ok") {
      setShowImgSrc(tempFilePaths[0]);
    }
  }, []);

  const handleChangeImg = useCallback(src => {
    setShowImgSrc(src);
  }, []);

  const handleDecode = useCallback(async () => {
    const { width: imgW, height: imgH } = cusStyle;
    const message = await maskRef.current.revealText(
      "canvas",
      showImgSrc,
      imgW,
      imgH
    );
    setMsg(message);
  }, [showImgSrc, cusStyle]);

  const imgOnload = v => {
    console.log(v);
    setCusStyle(v.detail);
  };

  return (
    <View className="wrap">
      <View className="top">
        <View className="image-wrap">
          <Image className="image" mode="aspectFit" src={showImgSrc} />
          <Image
            className="hide-image"
            onload={imgOnload}
            mode="aspectFit"
            src={showImgSrc}
            width={cusStyle?.width}
            height={cusStyle?.height}
          />
        </View>
      </View>
      <View className="content">
        <Button
          className="upload-btn"
          color="primary"
          block
          onClick={handleChooseImg}
        >
          上传图片
        </Button>
        <Field
          className="textarea"
          value={msg}
          type="textarea"
          onChange={e => setMsg(e.detail.value)}
        />
        <Button id="decode" className="submit" onClick={handleDecode}>
          翻译
        </Button>
      </View>
      <Canvas
        id="canvas"
        canvasId="canvas"
        className="canvas"
        style={cusStyle}
      />
    </View>
  );
};

export default Test;
