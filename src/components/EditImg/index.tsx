import { View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useCallback, useEffect, useRef, useState } from "react";
import { Image, Button, Field, Backdrop } from "@taroify/core";
import "./index.less";
import Cropper from "../Cropper";

type EditImgType = {
  open: boolean;
  onOpen: (v) => void;
  onChange: (v) => void;
  imgSrc: string;
};

const linearStyle = {
  background: "linear-gradient(to right, #ff6034, #ee0a24)",
  color: "#fff"
};

const EditImg: React.FC<EditImgType> = ({
  open = false,
  onOpen,
  onChange,
  imgSrc = ""
}) => {
  const cropperRef = useRef<any>(null);
  useEffect(() => {
    // if (imgSrc) setSrc(imgSrc);
  }, [imgSrc]);

  // const handleChooseImg = useCallback(async () => {
  //   const chooseFile = await Taro.chooseImage({
  //     count: 1,
  //     sizeType: ["original", "compressed"],
  //     sourceType: ["album", "camera"]
  //   });

  //   const { errMsg, tempFiles, tempFilePaths } = chooseFile;
  //   if (errMsg === "chooseImage:ok") {
  //     setShowImgSrc(tempFilePaths[0]);
  //   }
  // }, []);

  const onCropImg = () => {
    if (!cropperRef.current) {
      return;
    }
    cropperRef.current.fnCrop({
      success: (res: any) => {
        const cropperImg = res.tempFilePath;
        // setSrc(cropperImg);
        onChange?.(cropperImg);
        onOpen?.(false)
      },
      fail: (err: any) => {
        console.log(err);
      }
    });
  };

  return (
    <Backdrop
      className="back-drop"
      open={open}
      closeable
      // onClose={() => onOpen?.(false)}
    >
      <View className="content-wrapper">
        <Cropper
          imgSrc={imgSrc}
          aspectRatio={1}
          // hideBox={true}
          ref={ele => (cropperRef.current = ele)}
        />
      </View>
      <View className="back-drop-footer">
        <Button className="back-drop-footer-btn" style={linearStyle}>
          上传
        </Button>
        <Button
          className="back-drop-footer-btn"
          style={linearStyle}
          onClick={onCropImg}
        >
          确定
        </Button>
      </View>
    </Backdrop>
  );
};

export default EditImg;
