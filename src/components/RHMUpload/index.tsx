import { promiseHandle } from "@/utils/common";
import GlobalToast from "@/utils/toast";
import { Uploader } from "@taroify/core";
import { View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { PropTypes } from "prop-types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./index.less";
import { getFileExtension } from "./utils";

function RHMUpload(props) {
  const {
    value,
    onChange,
    sizeLimit = 10,
    accept = ".jpg,.png,.gif",
    ...uploadProps
  } = props;
  const filesRef = useRef(value);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (value) {
      filesRef.current = value;
      setFiles(value);
    }
  }, [value]);

  const handleRemove = image => {
    const arr = files.filter(item => item.url !== image.url);
    filesRef.current = arr;
    setFiles(arr);
  };

  const disableType = useMemo(
    () => uploadProps.readonly || uploadProps.disabled,
    [uploadProps]
  );

  const overLimit = useCallback(
    ({ size: imgSize, path: filePath }) => {
      console.log(filePath, imgSize);
      // *号不校验文件类型
      if (accept !== "*") {
        const extension = getFileExtension(filePath);
        // 没有文件类型的并且后缀名不允许的不允许上传
        if (!accept.includes(extension)) {
          GlobalToast.show({ text: "不允许上传该类型的文件" });
          return false;
        }
      }
      if (imgSize > sizeLimit * 1024 * 1024) {
        GlobalToast.show({ text: `文件大小不允许超过${sizeLimit}M` });
        return false;
      }
      return true;
    },
    [sizeLimit]
  );

  // 图片上传
  const handleCustomUpload = async () => {
    try {
      const [chooseErr, chooseFile] = await promiseHandle(
        Taro.chooseImage({
          count: 1,
          sizeType: ["original", "compressed"],
          sourceType: ["album", "camera"]
        })
      );
      if (chooseErr) return;
      const { errMsg, tempFiles, tempFilePaths } = chooseFile;
      console.log(tempFiles[0], "tempFiles[0].size");
      if (!overLimit(tempFiles[0])) return;
      if (errMsg === "chooseImage:ok") {
        console.log(tempFiles, tempFilePaths);
        // const [cosErr, cosFile] = await promiseHandle(
        //   uploadPicture(tempFilePaths[0])
        // );
        // if (cosErr) return;
        // const { url, fileName, fileType, id } = cosFile;
        filesRef.current.push({
          url: tempFilePaths[0]
          // extension: fileType,
          // fileName: fileName,
          // fileId: id
        });
        setFiles([...filesRef.current]);
        onChange?.(filesRef.current);
      }
    } catch (error) {
      console.log(error);
      GlobalToast.show({ text: "上传失败" + JSON.stringify(error) });
    }
  };

  return (
    <View className="upload">
      <Uploader
        value={files}
        multiple
        onUpload={handleCustomUpload}
        onChange={setFiles}
        onRemove={handleRemove}
        {...uploadProps}
      >
        {files.map((image: any) => (
          <Uploader.Image
            key={image.url}
            url={image.url}
            name={image.name}
            type={image.type}
            removable={!disableType}
            onRemove={() => handleRemove(image)}
          ></Uploader.Image>
        ))}
        {!disableType && <Uploader.Upload />}
      </Uploader>
      <View className="upload-tips">{props.tips}</View>
    </View>
  );
}

export default RHMUpload;

RHMUpload.propTypes = {
  value: PropTypes.array,
  onChange: PropTypes.func,
  sizeLimit: PropTypes.number,
  tips: PropTypes.string,
  accept: PropTypes.string,
  maxFiles: PropTypes.number
};
