import { randomBytes } from 'crypto'

export function getTimestampForV6(timestamp?: number): bigint {
  const dateUnixEpoch = timestamp || Date.now()
  return BigInt(dateUnixEpoch) * BigInt(10000) + BigInt(0x01b21dd213814000)
}

export function getTimestampForV7(timestamp?: number): bigint {
  const dateUnixEpoch = timestamp || Date.now()
  return BigInt(dateUnixEpoch)
}

export function getRandomClockSeq(randomNum?: number): bigint {
  return BigInt(Math.floor((randomNum ? randomNum : Math.random()) * 0x3fff))
}

export function getRandomNode(): bigint {
  return BigInt(Math.floor(Math.random() * 0xffffffffffff))
}

export function getRandomValues(): bigint {
  return BigInt(Math.floor(Math.random() * 0x3fffffffffffffff))
}

export function formatTimeLow(timeLow: bigint): string {
  return (timeLow & BigInt('0xFFFFFFFF')).toString(16).padStart(8, '0')
}

export function formatTimeMid(timeMid: bigint): string {
  return (timeMid & 0xffffn).toString(16).padStart(4, '0')
}

export function formatTimeHighAndVersion(timeHi: bigint, version: bigint): string {
  return (((timeHi << 4n) | version) & 0xffffn).toString(16).padStart(4, '0')
}

export function formatClockSeq(clockSeq: bigint): string {
  return ((clockSeq >> 8n) & 0xffn).toString(16).padStart(2, '0') + (clockSeq & 0xffn).toString(16).padStart(2, '0')
}
export function formatNode(node: bigint): string {
  return node.toString(16).padStart(12, '0')
}

export function generateUuidV6(): string {
  const timestamp = getTimestampForV6()
  const timeLow = (timestamp & BigInt(0xffffffff00000000)) >> 32n
  const timeMid = (timestamp & BigInt(0x00000000ffff0000)) >> 16n
  const timeHi = timestamp & BigInt(0x0000000000000fff)
  const clockSeq = getRandomClockSeq()
  const node = getRandomNode()

  return (
    formatTimeLow(timeLow) +
    '-' +
    formatTimeMid(timeMid) +
    '-' +
    formatTimeHighAndVersion(timeHi, 6n) +
    '-' +
    formatClockSeq(clockSeq) +
    '-' +
    formatNode(node)
  )
}

type Version7Params<RetTS extends boolean> = {
  dateTime?: Date
  randA?: bigint
  randB?: bigint
  returnTimestamp?: RetTS
}

type UUID = string
type Timestamp = Date
type Version7Return = [UUID, Timestamp]

export function generateUuidV7<RetTS extends boolean = false>({
  dateTime,
  randA: inputRandA,
  randB: inputRandB,
  returnTimestamp,
}: Version7Params<RetTS> = {}): RetTS extends true ? Version7Return : string {
  const selectedDate = dateTime || new Date()

  const unixTsMs = BigInt(selectedDate.getTime()) & 0xffffffffffffn // Ensure 48 bits
  const version = 0x7

  const randA = (inputRandA ?? BigInt(randomBytes(2).readUInt16BE(0))) & 0xfffn // Ensure 12 bits
  const varField = BigInt(0x2)
  const randB = (inputRandB ?? BigInt(randomBytes(8).readBigUInt64BE(0))) & 0x3fffffffffffffffn // Ensure 62 bits

  const unixTsMsBits = unixTsMs << BigInt(80)
  const versionBits = BigInt(version) << BigInt(76)
  const randABits = randA << BigInt(64)
  const varBits = varField << BigInt(62)
  const randBBits = randB

  const uuidBigInt = unixTsMsBits | versionBits | randABits | varBits | randBBits
  const uuidHex = uuidBigInt.toString(16).padStart(32, '0')

  const uuid = [
    uuidHex.slice(0, 8),
    uuidHex.slice(8, 12),
    uuidHex.slice(12, 16),
    uuidHex.slice(16, 20),
    uuidHex.slice(20),
  ].join('-')

  if (returnTimestamp) {
    // Explicitly assert the type of the returned object
    return [uuid, selectedDate] as RetTS extends true ? Version7Return : string
  }

  // Explicitly assert the type of the returned string
  return uuid as RetTS extends true ? Version7Return : string
}

export const uuidV7DT = () => {
  return generateUuidV7({ returnTimestamp: true })
}

// expect a string of length 36 (32 hexadecimal characters + 4 dashes):
export function isValidUuid(uuid: string) {
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
  return uuidRegex.test(uuid)
}

export const getUuidV7Date = (uuid: string) => {
  const extracted = extractTimestampFromUuidV7(uuid)
  const date = new Date(Number(extracted.timestamp))
  return date
}
export function extractTimestampFromUuidV7(uuid: string): {
  timestamp: BigInt
  version: BigInt
} {
  const uuidHex = uuid.replace(/-/g, '') // Remove hyphens
  const uuidBigInt = BigInt(`0x${uuidHex}`)

  // Extracting the timestamp: it is the most significant 48 bits, so we shift right by (128 - 48) = 80 bits.
  const timestamp = uuidBigInt >> BigInt(80)

  // Extracting the version: it's 4 bits after the timestamp. First, we mask off the timestamp bits by doing a bitwise AND with a mask that is 1 for the version bits and 0 elsewhere. Then, we shift right by (128 - 48 - 4) = 76 bits.
  const versionMask = BigInt(`0x${'0'.repeat(12)}${'F'.repeat(1)}${'0'.repeat(19)}`)
  const version = (uuidBigInt & versionMask) >> BigInt(76)

  return { timestamp, version }
}

export function extractRandomValuesFromUuidV7(uuid: string) {
  const uuidWithoutHyphens = uuid.replace(/-/g, '')
  const randA = BigInt(`0x${uuidWithoutHyphens.slice(12, 15)}`)
  const varField = BigInt(`0x${uuidWithoutHyphens.slice(15, 16)}`)
  const randB = BigInt(`0x${uuidWithoutHyphens.slice(16)}`)
  return { randA, varField, randB }
}

export function extractTimestampFromUuidV6(uuid: string) {
  const uuidWithoutHyphens = uuid.replace(/-/g, '')
  const timeHigh = BigInt(`0x${uuidWithoutHyphens.slice(0, 8)}`)
  const timeMid = BigInt(`0x${uuidWithoutHyphens.slice(8, 12)}`)
  const timeLow = BigInt(`0x${uuidWithoutHyphens.slice(12, 16)}`) >> 4n
  const version = BigInt(`0x${uuidWithoutHyphens.slice(15, 16)}`)

  const timestamp = (timeHigh << 32n) | (timeMid << 16n) | timeLow

  return { timestamp, version }
}

export function extractClockSeqAndNodeFromUuidV6(uuid: string) {
  const clockSeq = BigInt(`0x${uuid.slice(16, 20)}`)
  const node = BigInt(`0x${uuid.slice(20)}`)

  return { clockSeq, node }
}

export function extractCustomDataFromUuidV8(uuid: string) {
  // Removing hyphens and converting UUID to a BigInt
  const uuidWithoutHyphens = uuid.replace(/-/g, '')
  const uuidBigInt = BigInt(`0x${uuidWithoutHyphens}`)

  // Extracting custom_a (48 bits from the start)
  const customA = (uuidBigInt >> 80n) & 0xffffffffffffn

  // Extracting ver (4 bits after custom_a)
  const ver = (uuidBigInt >> 76n) & 0xfn

  // Extracting custom_b (12 bits after ver)
  const customB = (uuidBigInt >> 64n) & 0xfffn

  // Extracting var (2 bits after custom_b)
  const varField = (uuidBigInt >> 62n) & 0x3n

  // Extracting custom_c (remaining 62 bits)
  const customC = uuidBigInt & 0x3fffffffffffffffn

  return { customA, ver, customB, varField, customC }
}

export function generateUuidV8(customData: bigint[] = [0n, 0n, 0n]): string {
  if (customData.length !== 3) {
    console.error('Invalid custom data', customData)
    throw new Error(`Invalid custom data for UUIDv8 must be 3 bigints`)
  }

  const version = 0x8n
  const variant = 0x2n

  const custom_a = customData[0] & 0xffffffffffffn
  const ver = version & 0xfn
  const custom_b = customData[1] & 0xfffn
  const varField = variant & 0x3n
  const custom_c = customData[2] & 0x3fffffffffffffffn

  const uuidBigInt = (custom_a << 80n) | (ver << 76n) | (custom_b << 64n) | (varField << 62n) | custom_c

  const uuidHex = uuidBigInt.toString(16).padStart(32, '0')

  return [
    uuidHex.slice(0, 8),
    uuidHex.slice(8, 12),
    uuidHex.slice(12, 16),
    uuidHex.slice(16, 20),
    uuidHex.slice(20),
  ].join('-')
}

export const uuidV7ToDate = (uuid: string) => {
  const validUuid = isValidUuid(uuid)
  if (!validUuid) {
    throw new Error('Invalid UUID: ')
  }
  const { timestamp, version } = extractTimestampFromUuidV7(uuid)
  if (version !== 7n) {
    console.error('Invalid UUID version', version)
    throw new Error('Invalid UUID version')
  }
  const date = new Date(Number(timestamp))
  return date
}

type UuidVersion = 6 | 7 | 8
export function generateUuid<Ver extends number | UuidVersion>(version: Ver, customData?: bigint[]): string {
  if (version === 6) {
    return generateUuidV6()
  } else if (version === 7) {
    return generateUuidV7()
  } else if (version === 8) {
    return generateUuidV8(customData)
  } else {
    throw new Error('Invalid version or custom data for UUIDv8')
  }
}
