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
  deleteUser,
  reauthenticateWithPopup,
} from "firebase/auth";

async function doCreateUserWithEmailAndPassword(
  email: string,
  password: string,
  displayName: string
) {
  const auth = getAuth();
  await createUserWithEmailAndPassword(auth, email, password);
  if (auth.currentUser) {
    const token = (auth.currentUser as any).accessToken;
    const response = await fetch("http://localhost:3000/users/registerFB", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    if (!response.ok) {
      console.log("Error adding account to database");
    }

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
    auth = getAuth();
    if (auth.currentUser) {
      const token = (auth.currentUser as any).accessToken;
      const response = await fetch("http://localhost:3000/users/registerFB", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
        },
      });
      if (!response.ok) {
        console.log("Error adding account to database");
      }
    }
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

async function doDeleteUserEmailAndPassword(email: string, password: string) {
  let auth = getAuth();
  let credential = EmailAuthProvider.credential(email, password);
  let currentUser = auth.currentUser;
  if (currentUser && auth.currentUser) {
    await reauthenticateWithCredential(auth.currentUser, credential);
    await deleteUser(currentUser);
  }
}

async function doDeleteUserSocial() {
  let auth = getAuth();
  let currentUser = auth.currentUser;
  let provider;
  if (currentUser && auth.currentUser && auth.currentUser.providerId) {
    console.log;
    if (auth.currentUser.providerData[0].providerId === "google.com") {
      provider = new GoogleAuthProvider();
    } else if (auth.currentUser.providerData[0].providerId === "github.com") {
      provider = new GithubAuthProvider();
    }
    if (provider) {
      await reauthenticateWithPopup(auth.currentUser, provider);
      await deleteUser(currentUser);
    }
  }
}

export {
  doCreateUserWithEmailAndPassword,
  doSocialSignIn,
  doSignInWithEmailAndPassword,
  doPasswordReset,
  doSignOut,
  doChangePassword,
  doDeleteUserEmailAndPassword,
  doDeleteUserSocial,
};
