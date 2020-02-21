import crypto from 'crypto'

export default function(source:string): string {
  return crypto.createHash('md5').update(source).digest('hex')
}