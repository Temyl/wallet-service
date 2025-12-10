import * as bcrypt from 'bcrypt'

export async function hashKey( 
    key: string, 
    salt: number
): Promise<string> {
    const defaultSalt = await bcrypt.genSalt(10)
    return bcrypt.hash(key, salt ?? defaultSalt);
}

export function verifyHash(
    key: string,
    hashedKey: string
): Promise<boolean> {
    return bcrypt.compare(key, hashedKey);
}
 