import { doSocialSignIn } from "../firebase/FirebaseFunctions";

const SocialSignIn = () => {
  const socialSignOn = async (app:string) => {
    try {
      await doSocialSignIn(app);
    } catch (error) {
      alert(error);
    }
  };
  return (
    <div>
      <img
        onClick={() => socialSignOn("google")}
        alt="google signin"
        src="/imgs/btn_google_signin.png"
      />
      <img
        onClick={() => socialSignOn("github")}
        alt="github signin"
        src="/imgs/btn_github_signin.png"
      />
    </div>
  );
};

export default SocialSignIn;
