import { createClient } from 'redis';
import { sendMail } from '../services/nodemailer';

const TOKEN_COUNT = 15;
const TOKEN_REFRESH_TIME = 1000 * 60; // ? 1 minute

const VERIFICATION_CODE_EXPIRE_TIME = 60 * 10; // ? 10 minutes

// ? Why are these field names so short?
// ? simply, to save memory
type Bucket = {
    c: number; // ? token count
    t: number; // ? timestamp
}

type VerificationCode = {
    c: number; // ? code
    p: string; // ? password linked to this verification
}

const client = createClient();
client.on('error', err => console.log('Redis Client Error', err));
await client.connect();

export async function updateTokens(ip: string) {
    const cachedValue = await client.get(ip);
    const timestamp = Date.now();
    const bucket = (cachedValue != null? JSON.parse(cachedValue) : { c: TOKEN_COUNT, t: timestamp }) as Bucket;

    if (timestamp - bucket.t > TOKEN_REFRESH_TIME) {
        bucket.c = TOKEN_COUNT - 1;
        bucket.t = timestamp;

        return true;
    } else if (bucket.c > 0) {
        bucket.c--;

        return true;
    }

    return false;
}

export async function createVerificationCode(email: string, password: string) {
    const code = Math.floor(100_000 + Math.random() * 900_000);

    await client.set(email, JSON.stringify({ c: code, p: password } as VerificationCode));
    await client.expire(email, VERIFICATION_CODE_EXPIRE_TIME);

    // TODO: make it 'fancy' - add html
    await sendMail(email, `Your verification code is ${code}`);
}

export async function getVerificationCode(email: string, code: string) {
    const cachedCode = await client.get(email);

    if (!cachedCode) return null;

    return JSON.parse(cachedCode) as VerificationCode;
}