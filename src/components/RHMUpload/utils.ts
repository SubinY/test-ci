// 获取文件后缀
export const getFileExtension = (str) => {
  if (typeof str !== 'string') throw '请传入字符串！'
  const index = str.lastIndexOf('.')
  return str.substr(index)
}
