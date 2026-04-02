import QRCode from "qrcode";

// CRC16-CCITT calculation for VietQR
function crc16(str: string): string {
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
  }
  crc &= 0xFFFF;
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

// Format TLV (Tag-Length-Value)
function tlv(tag: string, value: string): string {
  const length = value.length.toString().padStart(2, '0');
  return `${tag}${length}${value}`;
}

export async function generateVietQR({
  amount,
  description,
  bankBin,
  accountNumber,
  accountName,
}: {
  amount: number;
  description?: string;
  bankBin: string;
  accountNumber: string;
  accountName: string;
}) {
  const guid = "A000000727"; // NAPAS GUID
  const serviceCode = "QRIBFTTC"; // Transfer to account
  
  // Tag 01 inside Tag 38 is a nested TLV: 00=BIN, 01=Account
  const bankAccountInfo = tlv("00", bankBin) + tlv("01", accountNumber);
  
  // Build Merchant Account Information (Tag 38)
  // Format: 00-GUID, 01-Nested(BIN+Account), 02-ServiceCode
  const merchantAccountInfo = 
    tlv("00", guid) + 
    tlv("01", bankAccountInfo) + 
    tlv("02", serviceCode);
  
  // Build Additional Data (Tag 62) - Purpose of transaction
  const additionalData = description ? tlv("08", description.slice(0, 25)) : "";
  
  // Build main payload
  let payload = "";
  payload += tlv("00", "01"); // Payload Format Indicator
  payload += tlv("01", "12"); // Point of Initiation Method (12 = Dynamic QR)
  payload += tlv("38", merchantAccountInfo); // Merchant Account Information
  payload += tlv("52", "0000"); // Merchant Category Code
  payload += tlv("53", "704"); // Transaction Currency (VND)
  
  if (amount > 0) {
    payload += tlv("54", Math.round(amount).toString()); // Transaction Amount
  }
  
  payload += tlv("58", "VN"); // Country Code
  payload += tlv("59", accountName.slice(0, 25)); // Merchant Name
  payload += tlv("60", "HANOI"); // Merchant City
  
  if (additionalData) {
    payload += tlv("62", additionalData); // Additional Data Field
  }
  
  // Add CRC placeholder and calculate
  payload += "6304";
  const crc = crc16(payload);
  payload += crc;
  
  const qrDataUrl = await QRCode.toDataURL(payload, { 
    width: 480, 
    margin: 2,
    errorCorrectionLevel: 'M'
  });
  
  return { payload, qrDataUrl };
}
