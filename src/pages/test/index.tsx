import { Canvas, View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useCallback, useEffect, useRef, useState } from "react";
import { Image, Button, Field } from "@taroify/core";
import "./index.less";
import EditImg from "@/components/EditImg";
import ImageMask from "@/services/imageMask";

const Test: React.FC<any> = () => {
  let maskRef = useRef<any>(null);
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [showImgSrc, setShowImgSrc] = useState("");
  const [resultImg, setResultImg] = useState("");
  const [cusStyle, setCusStyle] = useState({ width: 0, height: 0 });
  const pixelRatioRef = useRef(2);

  useEffect(() => {
    pixelRatioRef.current = Taro.getSystemInfoSync()['pixelRatioRef'];
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
      setOpen(true);
    }
  }, []);

  const handleChangeImg = useCallback(src => {
    setShowImgSrc(src);
  }, []);

  const handleEncode = useCallback(() => {
    maskRef.current
      .hideText("canvas", showImgSrc, msg, cusStyle?.width, cusStyle?.height, pixelRatioRef.current)
      .then(res => {
        console.log(showImgSrc, res.tempFilePath);
        setResultImg(res.tempFilePath);
      });

    // transformImgRef.current = canvas.toDataURL();
  }, [msg]);

  const previewImage = img => {
    Taro.previewImage({
      current: img, // 当前显示图片的http链接
      urls: [img] // 需要预览的图片http链接列表
    });
  };

  const imgOnload = v => {
    console.log(v.detail);
    setCusStyle(v.detail);
  };

  return (
    <View className="wrap">
      <View className="top">
        <View className="image-wrap">
          <Image
            className="image"
            mode="aspectFit"
            src={showImgSrc}
            onload={imgOnload}
            onClick={() => previewImage(showImgSrc)}
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
        <Button id="encode" className="submit" onClick={handleEncode}>
          加密
        </Button>
        <View className="image-wrap">
          <Image
            className="image"
            src={resultImg}
            onClick={() => previewImage(resultImg)}
          />
        </View>
      </View>
      <EditImg
        open={open}
        onOpen={setOpen}
        onChange={handleChangeImg}
        imgSrc={showImgSrc}
      ></EditImg>
      <Canvas
        id="canvas"
        canvasId="canvas"
        className="canvas"
        style={{
          width: cusStyle?.width + "px",
          height: cusStyle?.height + "px"
        }}
      />
    </View>
  );
};

export default Test;
