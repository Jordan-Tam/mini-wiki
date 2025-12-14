/**
 * Added bio and made a user customized profile page,
 * I havent finished it so that anyone can view your profile
 * (or linked your profile where it is mentioned) but it will be done tn
 * or tomorrow morning for sure 
 */

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { FaPlus } from 'react-icons/fa';
import ChangeBioModal from "./modals/ChangeBioModal"
import WikiCard from "./cards/WikiCard.jsx";
import { useParams } from "react-router-dom"

function Profile() {

  const { id } = useParams();
  
  const [user, setUser] = useState(null);
  const [showChangeBioModal, setShowChangeBioModal] = useState(false)

  const { currentUser, setCurrentUser } = useContext(AuthContext);

  let token: any;
  
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState([]);
  const [wikis, setWikis] = useState([]);

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
			
				const response = await fetch(`/api/users/${id}`, {
					method: "GET",
					headers: {
						Authorization: "Bearer " + currentUser?.accessToken
					}
				});
				if (!response.ok) {
					throw (await response.json()).error;
				}
        
				const data = await response.json();

				setUser(data);

        const favoriteResponse = await fetch(`/api/users/favorites`, {
          method: "GET",
          headers: { Authorization: "Bearer " + token }
        });

        if (!favoriteResponse.ok){ 
            throw "failed to fetch favorites"
        }
        
        const favoriteResult = await favoriteResponse.json();
        
        setFavorites(favoriteResult);

        const wikiRes = await fetch(`/api/wiki/`, {
          method: "GET",
          headers: { Authorization: "Bearer " + token },
        });

        if (!wikiRes.ok){ 
          throw "failed to fetch wiki"
        }

        const dataWikis = await wikiRes.json();
              // console.log(data);

        console.log(dataWikis);
        setWikis(dataWikis);

        setLoading(false);
        
		};

		if (currentUser) fetchData();

	}, [currentUser]);



  if (loading){
    return (
      <h1>Loading...</h1>
    )
  }
  //console.log(user)
  console.log(wikis.OWNER)
  return (
    <div className="container-fluid">
      <h2>{currentUser.username}'s Account Page</h2>
      
      {user !== null && (
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

      <br/>


      <h3>Wikis</h3>
      {wikis.OWNER?.filter(wiki => wiki.access !== "private")
        .map(wiki => (
          <li
            key={wiki._id ?? wiki}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <WikiCard wiki={wiki} />
          </li>
        ))}
      


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
