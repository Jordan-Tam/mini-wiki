import { useContext, useEffect, useState } from "react";
import { AuthContext, type FbUserContext, type FbUserContextMaybe } from "../context/AuthContext.tsx";
import { FaPlus } from 'react-icons/fa';
import ChangeBioModal from "./modals/ChangeBioModal.tsx"
import WikiCard from "./cards/WikiCard.tsx";
import { useParams } from "react-router-dom"
import { FaLock, FaUnlock } from "react-icons/fa";
import { Link } from "react-router-dom"
import type { User, Wiki, WikisResponse } from "../types.ts";

function Profile() {

  const { id } = useParams();
  
  const [user, setUser] = useState<User | null>(null);
  const [showChangeBioModal, setShowChangeBioModal] = useState(false)

  const { currentUser, setCurrentUser } = useContext(AuthContext) as FbUserContext;

  let token: any;
  
  const [loading, setLoading] = useState(true)
  const [wikis, setWikis] = useState<WikisResponse | null>(null);

  if (currentUser) {
    token = currentUser.accessToken;
  }

  const isUserProfile = (id === currentUser.uid);

  const handleCloseChangeBioModal = () => {
    setShowChangeBioModal(false);
  };

  const handleOpenChangeBioModal = () => {
    setShowChangeBioModal(true);
  };


  useEffect(() => {

		const fetchData = async () => {
			
				const response = await fetch(`/api/users/${id}/profile`, {
					method: "GET",
					headers: {
						Authorization: "Bearer " + currentUser?.accessToken
					}
				});
				if (!response.ok) {
					throw (await response.json()).error;
				}
        
				const data = await response.json();

				setUser(data.user);


        const wikiRes = await fetch(`/api/users/${id}/wikis`, {
          method: "GET",
          headers: { Authorization: "Bearer " + token },
        });

        if (!wikiRes.ok){ 
          throw "failed to fetch wiki"
        }

        const dataWikis = await wikiRes.json();
              // console.log(data);

        //console.log(dataWikis);
        setWikis(dataWikis);

        setLoading(false);
        
		};

		if (currentUser) fetchData();

	}, [currentUser, id]);



  if (loading || !user){
    return (
      <h1>Loading...</h1>
    )
  }
  //console.log(user.username)
  //console.log(isUserProfile)
  return (
    <div className="container-fluid">
      <h2 className="display-5">
        {user.username} 
      </h2>
      { isUserProfile &&
        <Link to="/settings">change username </Link>
      }
      <hr/>
      {isUserProfile && user !== null && (
        user.bio === "" ? (
          <>
    
            <button
              className="btn btn-primary"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
              onClick={() => handleOpenChangeBioModal()}
            >
              <FaPlus />
              Add a bio!
            </button>

              
          </>
        ) : (
          <>
            <h5>Bio</h5>
            <p>{user.bio}</p>
            <button
              className="btn btn-primary"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
              onClick={() => handleOpenChangeBioModal()}
            >
              Edit Bio
            </button>
          </>
        )
      )}

    {!isUserProfile && user !== null && (
        user.bio === "" ? (
          <>
            <h5>Bio</h5>
            <p> No bio yet! </p>
          </>
        ) : (
          <>
            <h5>Bio</h5>
            <p>{user.bio}</p>
          </>
        )
      )}

      <hr/>

      <h3><FaUnlock />{" "}Public Wikis</h3>

      { 
      wikis && wikis.OWNER?.filter(wiki => wiki.access !== "private").length !== 0
      && (
        <>
          <ul>
            {wikis.OWNER?.filter(wiki => wiki.access !== "private")
              .map(wiki => (
                <li key={wiki._id ?? wiki} className="list-group-item d-flex justify-content-between align-items-center">
                  <WikiCard wiki={wiki} />
                </li>
              ))}
          </ul>
        </>
      )
      }

      { 
      wikis && wikis.OWNER?.filter(wiki => wiki.access !== "private").length === 0
      && (
        <>
          <p> You have no public wikis! <Link to="/create"> Make one </Link> </p>
        </>
      )
      }


      { isUserProfile &&
      wikis && wikis.OWNER?.filter(wiki => wiki.access === "private").length !== 0
      && (
        <>
        <h3><FaLock />{" "}Private Wikis</h3>
        <ul>
          {wikis.OWNER?.filter(wiki => wiki.access === "private")
            .map(wiki => (
              <li key={wiki._id ?? wiki} className="list-group-item d-flex justify-content-between align-items-center">
                <WikiCard wiki={wiki} />
              </li>
            ))}
        </ul>
        </>
      )
      }

    { isUserProfile &&
      wikis && wikis.OWNER?.filter(wiki => wiki.access === "private").length === 0
      && (
        <>
        <h3><FaLock />{" "}Private Wikis</h3>
        <p> You have no private wikis! <Link to="/create"> Make one </Link> </p>
        </>
      )
      }
      

      {showChangeBioModal && (
        <ChangeBioModal
          isOpen={showChangeBioModal}
          handleClose={handleCloseChangeBioModal}
          user={user}
          setUser={setUser}
        />
      )}

    </div>
  );
}

export default Profile;
