import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * 驗證 Google ID Token
 * @param {string} idToken - Google ID Token
 * @returns {Promise<Object>} - 用戶資料
 */
export async function verifyGoogleToken(idToken) {
  try {
    const ticket = await client.verifyIdToken({ idToken });

    const payload = ticket.getPayload();
    console.log(`express_back/services/googleAuth.js: verifyGoogleToken`);
    console.log(`透過 idToken 取得的用戶資料 payload:`);
    console.log(JSON.stringify(payload, null, 4));

    return {
      googleId: payload.sub,
      email: payload.email,
      emailVerified: payload.email_verified,
      name: payload.name,
      picture: payload.picture,
      givenName: payload.given_name,
      familyName: payload.family_name,
    };
  } catch (error) {
    throw new Error("無效的 Google Token");
  }
}
