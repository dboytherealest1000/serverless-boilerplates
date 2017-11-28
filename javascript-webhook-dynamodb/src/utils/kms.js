import { KMS } from 'aws-sdk'

const kms = new KMS()
const decryptedDictionary = new Map()
const isBase64 = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/

async function kmsDecrypt (ciphertext) {
  if (decryptedDictionary.has(ciphertext)) {
    return decryptedDictionary.get(ciphertext)
  } else if (!isBase64.test(ciphertext)) {
    // useful in development mode.
    // Pass an unencrypted string, get back the same string.
    return ciphertext
  }

  const params = { CiphertextBlob: Buffer.from(ciphertext, 'base64') }
  const result = await kms.decrypt(params).promise()

  const decrypted = result.Plaintext ? result.Plaintext.toString() : ciphertext

  decryptedDictionary.set(ciphertext, decrypted)

  return decrypted
}

export default async function decrypt (ciphertext) {
  if (typeof ciphertext === 'string') {
    return kmsDecrypt(ciphertext)
  }

  return Promise.all(ciphertext.map(text => kmsDecrypt(text)))
}