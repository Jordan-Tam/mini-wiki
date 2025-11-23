import { doSignOut } from "../firebase/FirebaseFunctions";

const SignOutButton = () => {
  return (
    <button type="button" onClick={doSignOut}>
      Sign Out
    </button>
  );
};

export default SignOutButton;
