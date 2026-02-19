import {
  signIn,
  signOut,
  signUp,
  confirmSignUp,
  fetchAuthSession,
  resendSignUpCode
} from "aws-amplify/auth";

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
  return session?.tokens?.accessToken?.toString() || null;
}

export async function getIdToken() {
  const session = await fetchAuthSession();
  return session?.tokens?.idToken?.toString() || null;
}

export async function resendCode({ username }) {
  if (!username) throw new Error("Username is required");
  return resendSignUpCode({ username });
}
