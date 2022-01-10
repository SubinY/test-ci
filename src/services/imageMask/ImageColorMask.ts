import { ImageMaskType } from "./define";

export class ImageColorMask {
  offset = 0;

  debug = false;
  mixCount = 2;
  colors;

  constructor(colors: Uint8ClampedArray, { debug = true, mixCount = 2 }: ImageMaskType) {
    this.debug = debug;
    this.colors = colors;
    this.mixCount = mixCount;
  }

  static getBit(number: number, location: any) {
    return (number >> location) & 1;
  }

  static setBit(number: number, location, bit) {
    return (number & ~(1 << location)) | (bit << location);
  }

  getBitsFromNumber(number: number, size: number) {
    let bits = [];
    for (let i = 0; i < size; i++) {
      bits.push(<never>ImageColorMask.getBit(number, i));
    }
    return bits;
  }

  writeNumber(number, size) {
    let bits = this.getBitsFromNumber(number, size);
    let pos = 0;
    let mix = 0;
    if (this.debug) console.log(bits.join(""));
    while (pos < bits.length && this.offset < this.colors.length) {
      this.colors[this.offset] = ImageColorMask.setBit(
        this.colors[this.offset],
        mix++,
        bits[pos++]
      );
      while (mix < this.mixCount && pos < bits.length) {
        this.colors[this.offset] = ImageColorMask.setBit(
          this.colors[this.offset],
          mix++,
          bits[pos++]
        );
      }
      if (this.debug) {
        for (let c = mix; c < 8; c++) {
          this.colors[this.offset] = ImageColorMask.setBit(
            this.colors[this.offset],
            c,
            0
          );
        }
      }
      this.offset++;
      mix = 0;
      // set the alpha value in this pixel to 255
      // we have to do this because browsers do premultiplied alpha
      // see for example: http://stackoverflow.com/q/4309364
      if ((this.offset + 1) % 4 == 0) {
        this.colors[this.offset] = 255;
        this.offset++;
      }
    }
  }
  readNumber(size) {
    let bits = this.debug ? [] : null;
    let pos = 0;
    let number = 0;
    let mix = 0;
    while (pos < size && this.offset < this.colors.length) {
      let bit = ImageColorMask.getBit(this.colors[this.offset], mix++);
      number = ImageColorMask.setBit(number, pos++, bit);
      if (this.debug) bits?.push(<never>bit);
      while (mix < this.mixCount && pos < size) {
        bit = ImageColorMask.getBit(this.colors[this.offset], mix++);
        number = ImageColorMask.setBit(number, pos++, bit);
        if (this.debug) bits?.push(<never>bit);
      }

      this.offset++;
      mix = 0;
      if ((this.offset + 1) % 4 == 0) {
        this.offset++;
      }
    }
    if (this.debug) console.log(bits?.join(""));
    return number;
  }
}
