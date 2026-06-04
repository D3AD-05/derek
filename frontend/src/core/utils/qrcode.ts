
import QRCode from 'qrcode'

export const generateQRCode = async (
  text: string,
  options?: QRCode.QRCodeToDataURLOptions
) => {
  try {
    return await QRCode.toDataURL(text, {
      width: 300,
      margin: 2,
      ...options,
    })
  } catch (error) {
    console.error('QR generation failed:', error)
    throw error
  }
}