import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { FaHeart, FaRegHeart, FaStar, FaRegStar } from "react-icons/fa";


function Browse(){

	const { currentUser } = useContext(AuthContext);
    //console.log(currentUser)
    const [token, setToken] = useState(
		currentUser ? currentUser.accessToken : ""
	);

	const [wikis, setWikis] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
    const [favorites, setFavorites] = useState([]);

    const favorite_or_unfavorite = async (wikiId) => {
        //console.log(wikiId)
        const isFavorite = favorites.some(fav => fav._id === wikiId);
    
        try {

            const routePath = `/api/wiki/${isFavorite ? "unfavorite":"favorite"}/${wikiId}`
            //console.log(routePath)
            const response = await fetch(
                routePath,
                {
                method: isFavorite ? "DELETE":"POST",
                headers: {
                    Authorization: "Bearer " + currentUser.accessToken,
                },
                }
            );

            //console.log(response)

            if (!response.ok) {
                throw new Error("Failed to update favorite");
            }
            
            setFavorites((prev) => isFavorite ? prev.filter((fav) => fav._id !== wikiId) 
            : [...prev, wikis.find((w) => w._id === wikiId)]
);


        } catch (e) {

            console.error(e);
            alert("Error occured. Please try again.");

        }
    }
    
    useEffect(() => {
        const fetchData = async () => {
			try {
				const response = await fetch(`/api/wiki/wikis/`, {
					method: "GET",
					headers: {
						Authorization: "Bearer " + currentUser?.accessToken
					}
				});
                //console.log(response)
				if (!response.ok){ 
                    throw new Error("Failed to fetch wiki");
                }
				const data = await response.json();
				setWikis(data)

                const favoriteResponse = await fetch(`/api/users/${currentUser.uid}/favorites`, {
					method: "GET",
					headers: { Authorization: "Bearer " + token }
				});
	
				const favoriteResult = await favoriteResponse.json();

                console.log(favoriteResult)
				
                setFavorites(favoriteResult);

			} catch (e) {
				
                setError(e.message);
			
            } finally {
				
                setLoading(false);
			
            }
		};

		if (currentUser){
            fetchData();
        }
	}, [currentUser]);

    if (loading) return <p>Loading...</p>;
	if (error) return <p>Error: {error}</p>;

    // console.log(favorites)
    return (
        <>
            <h1>Browse Public Wikis</h1>
    
            <p> (Search will go here) </p>

            {wikis && wikis.length > 0 ? (
                <div>
                    {wikis.map((wiki) => (
                        <div className="card mb-3" key={wiki._id}>
                            <div className="card-body">
                                <Link to={`/wiki/${wiki._id}`} style={{textDecoration: "none"}}>
                                    <h3 className="card-title">
                                        {wiki.name}
                                    </h3>
                                </Link>
                                <p className="card-text">
                                    {wiki.description}
                                </p>    
                                <button 
                                    onClick={() => favorite_or_unfavorite(wiki._id)}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        padding: 0,
                                        cursor: "pointer"
                                    }}
                                >
                                    {favorites.some(favoriteWiki => favoriteWiki._id === wiki._id) ? (
                                        <FaHeart color="red" />
                                    ) : (
                                        <FaRegHeart color="red" />
                                    )}
                                </button>


                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p> No Wikis Found</p>
            )}
        </>
    );
    
}

export default Browse;