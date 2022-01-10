import { ImageMaskType } from "./define";
import { ImageColorMask } from "./ImageColorMask";
import Taro from "@tarojs/taro";

class ImageMask {
  debug = false;
  charSize = 16;
  mixCount = 2;
  lengthSize = 24;

  constructor({
    debug,
    charSize = 16,
    mixCount = 2,
    lengthSize = 24
  }: ImageMaskType) {
    this.debug = debug
    if (mixCount < 1) this.mixCount = 1;
    if (mixCount > 5) this.mixCount = 5;
    if (charSize % this.mixCount != 0)
      this.charSize += this.mixCount - (charSize % this.mixCount);
    if (lengthSize % this.mixCount != 0)
      this.lengthSize += this.mixCount - (lengthSize % this.mixCount);
  }

  async hideText(
    canvasId: string,
    originSrc: string,
    text: string = "",
    ctxW: number,
    ctxH: number,
    pixelRatio: number = 2
  ) {
    const ctx = Taro.createCanvasContext(canvasId);
    ctx.drawImage(originSrc, 0, 0, ctxW, ctxH);
    ctx.draw();

    let pixelCount = ctxW * ctxH;
    if (
      this.lengthSize + text.length * this.charSize >
      pixelCount * 3 * this.mixCount
    ) {
      throw "text is too long for the image.";
    }

    const defaultCanvasOpts = {
      canvasId,
      x: 0,
      y: 0,
      width: ctxW,
      height: ctxH
    };

    const imgData: {
      data: Uint8ClampedArray;
    } = await Taro.canvasGetImageData(defaultCanvasOpts);
    const colorMask = new ImageColorMask(imgData.data, this);
    colorMask.writeNumber(text.length, this.lengthSize);
    for (var i = 0; i < text.length; i++) {
      colorMask.writeNumber(text.charCodeAt(i), this.charSize);
    }
    console.log(colorMask.colors, 'imgData1')
    await Taro.canvasPutImageData({
      ...defaultCanvasOpts,
      data: imgData.data
    });
    return Taro.canvasToTempFilePath({
      canvasId,
      destHeight: ctxW,
      destWidth: ctxH,
      width: ctxW,
      height: ctxH
    });
  }

  async revealText(
    canvasId: string,
    originSrc: string,
    imgW: number,
    imgH: number
  ) {
    const ctxW = imgW;
    const ctxH = imgH;
    const ctx = Taro.createCanvasContext(canvasId);
    ctx.drawImage(originSrc, 0, 0, ctxW, ctxH);
    ctx.draw();

    let pixelCount = ctxW * ctxH;
    const imgData: {
      data: Uint8ClampedArray;
    } = await Taro.canvasGetImageData({
      canvasId,
      x: 0,
      y: 0,
      width: ctxW,
      height: ctxH
    });
    let colorMask = new ImageColorMask(imgData.data, {
      debug: this.debug,
      mixCount: this.mixCount
    });

    let textLength = colorMask.readNumber(this.lengthSize);
    if (
      this.lengthSize + textLength * this.charSize >
      pixelCount * 3 * this.mixCount
    ) {
      return "";
    }

    console.log(textLength);
    if (textLength <= 0) {
      return "";
    }

    let text = [];
    for (let i = 0; i < textLength; i++) {
      let code = colorMask.readNumber(this.charSize);
      text.push(<never>String.fromCharCode(code));
    }
    return await Promise.resolve(text.join(""));
  }

  maxTextLength(canvas: any) {
    const ctx = canvas.getContext("2d");
    const pixelCount = ctx.canvas.width * ctx.canvas.height;
    return (pixelCount * 3 * this.mixCount - this.lengthSize) / this.charSize;
  }

  maxFileSize(canvas: any) {
    const ctx = canvas.getContext("2d");
    const pixelCount = ctx.canvas.width * ctx.canvas.height;
    return (
      (pixelCount * 3 * this.mixCount -
        8 -
        this.lengthSize -
        255 * this.charSize) /
      8
    );
  }

  hideFile(canvas: any, file, handler: (_: any) => {}) {
    let fileReader = new FileReader();
    let self = this;
    fileReader.addEventListener("loadend", function(event: ProgressEvent<any>) {
      let data = new Uint8Array(event?.target?.result);
      let fileName = file.name;

      let ctx = canvas.getContext("2d");
      let pixelCount = ctx.canvas.width * ctx.canvas.height;
      if (
        8 +
          fileName.length * self.charSize +
          self.lengthSize +
          data.length * 8 >
        pixelCount * 3 * self.mixCount
      ) {
        handler({ success: false, message: "file is too big for the image." });
      } else {
        let imgData = ctx.getImageData(
          0,
          0,
          ctx.canvas.width,
          ctx.canvas.height
        );
        let colorMask = new ImageColorMask(imgData.data, self);
        colorMask.writeNumber(fileName.length, 8);
        for (let i = 0; i < fileName.length; i++) {
          colorMask.writeNumber(fileName.charCodeAt(i), self.charSize);
        }

        colorMask.writeNumber(data.length, self.lengthSize);
        for (let i = 0; i < data.length; i++) {
          colorMask.writeNumber(data[i], 8);
        }

        ctx.putImageData(imgData, 0, 0);
        handler({ success: true });
      }
    });
    fileReader.readAsArrayBuffer(file);
  }

  revealFile(canvas: any) {
    let ctx = canvas.getContext("2d");
    let pixelCount = ctx.canvas.width * ctx.canvas.height;
    let imgData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    let colorMask = new ImageColorMask(imgData.data, this);

    let fileNameLength = colorMask.readNumber(8);
    if (8 + fileNameLength * this.charSize > pixelCount * 3 * this.mixCount) {
      return null;
    }
    let fileName = [];
    for (let i = 0; i < fileNameLength; i++) {
      let code = colorMask.readNumber(this.charSize);
      fileName.push(<never>String.fromCharCode(code));
    }

    let fileLength = colorMask.readNumber(this.lengthSize);

    if (
      8 + fileNameLength * this.charSize + this.lengthSize + fileLength * 8 >
      pixelCount * 3 * this.mixCount
    ) {
      return null;
    }

    if (fileLength <= 0) {
      return null;
    }

    let buffer = new ArrayBuffer(fileLength);
    let data = new Uint8Array(buffer);
    for (let i = 0; i < fileLength; i++) {
      let b = colorMask.readNumber(8);
      data[i] = b;
    }
    return { name: fileName.join(""), data: data };
  }
}

export default ImageMask;
