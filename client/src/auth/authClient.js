import {
  signIn,
  signOut,
  signUp,
  confirmSignUp,
  fetchAuthSession,
  resendSignUpCode
} from "aws-amplify/auth";

function tokenToString(t) {
  if (!t) return null;
  if (typeof t === "string") return t;
  if (typeof t.toString === "function") {
    const s = t.toString();
    if (s && s !== "[object Object]") return s;
  }
  if (typeof t.getJwtToken === "function") return t.getJwtToken();
  if (t.jwtToken) return String(t.jwtToken);
  if (t.token) return String(t.token);
  return null;
}

export async function register({
  username,
  email,
  password,
  firstName,
  lastName,
  phoneNumber
}) {
  if (!username) throw new Error("Username is required");

  return signUp({
    username,
    password,
    options: {
      userAttributes: {
        email,
        ...(firstName ? { given_name: firstName } : {}),
        ...(lastName ? { family_name: lastName } : {}),
        ...(phoneNumber ? { phone_number: phoneNumber } : {})
      }
    }
  });
}

export async function confirm({ username, code }) {
  return confirmSignUp({ username, confirmationCode: code });
}

export async function login({ identifier, password }) {
  const username = String(identifier || "").trim();
  return signIn({ username, password });
}

export async function logout() {
  return signOut();
}

export async function getAccessToken() {
  const session = await fetchAuthSession();
  const access = tokenToString(session?.tokens?.accessToken);
  return access || null;
}

export async function getIdToken() {
  const session = await fetchAuthSession();
  const idt = tokenToString(session?.tokens?.idToken);
  return idt || null;
}

export async function resendCode({ username }) {
  if (!username) throw new Error("Username is required");
  return resendSignUpCode({ username });
}
