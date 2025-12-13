import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { FaPlus } from 'react-icons/fa';
import ChangeBioModal from "./modals/ChangeBioModal"

function Profile() {
  
  const [user, setUser] = useState(null);
  const [showChangeBioModal, setShowChangeBioModal] = useState(false)

  const { currentUser, setCurrentUser } = useContext(AuthContext);

  let token: any;
  
  if (currentUser) {
    token = currentUser.accessToken;
  }

  const handleCloseChangeBioModal = () => {
    setShowChangeBioModal(false);
  };

  const handleOpenChangeBioModal = () => {
    setShowChangeBioModal(true);
  };


  useEffect(() => {
		const fetchUser = async () => {
			
				const response = await fetch(`/api/users/${currentUser.uid}`, {
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

		};

		if (currentUser) fetchUser();

	}, [currentUser]);

  console.log(user)

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
