import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  signInWithEmailAndPassword,
  updatePassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  sendPasswordResetEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";

async function doCreateUserWithEmailAndPassword(
  email: string,
  password: string,
  displayName: string
) {
  const auth = getAuth();
  await createUserWithEmailAndPassword(auth, email, password);
  if (auth.currentUser) {
    await updateProfile(auth.currentUser, { displayName: displayName });
  } else {
    console.log("Not logged in!");
  }
}

async function doChangePassword(
  email: string,
  oldPassword: string,
  newPassword: string
) {
  const auth = getAuth();
  let credential = EmailAuthProvider.credential(email, oldPassword);
  console.log(credential);
  if (auth.currentUser) {
    await reauthenticateWithCredential(auth.currentUser, credential);
    await updatePassword(auth.currentUser, newPassword);
    await doSignOut();
  } else {
    console.log("Not logged in!");
  }
}

async function doSignInWithEmailAndPassword(email: string, password: string) {
  let auth = getAuth();
  await signInWithEmailAndPassword(auth, email, password);
}

async function doSocialSignIn(app: string) {
  let auth = getAuth();
  let socialProvider;
  if (app === "google") {
    socialProvider = new GoogleAuthProvider();
  } else if (app === "github") {
    socialProvider = new GithubAuthProvider();
  }
  if (socialProvider) {
    await signInWithPopup(auth, socialProvider);
  }
}

async function doPasswordReset(email: string) {
  let auth = getAuth();
  await sendPasswordResetEmail(auth, email);
}

async function doSignOut() {
  let auth = getAuth();
  await signOut(auth);
}

export {
  doCreateUserWithEmailAndPassword,
  doSocialSignIn,
  doSignInWithEmailAndPassword,
  doPasswordReset,
  doSignOut,
  doChangePassword,
};
