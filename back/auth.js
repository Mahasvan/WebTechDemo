import { createHash } from 'crypto';

const generateToken = (user, pass) => {
    const res = user + pass
  
    return createHash('sha256').update(res).digest('hex');
  }

const checkToken = (user, pass, validTokens) => {
    const token = generateToken(user, pass);
    return validTokens.includes(token);
}

export { generateToken, checkToken };