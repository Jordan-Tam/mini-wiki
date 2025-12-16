import { useState, useContext, useEffect } from "react";
import { AuthContext, type FbUserContextWrapper } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { FaHeart, FaRegHeart, FaStar, FaRegStar } from "react-icons/fa";


function Discover(){

	const { currentUser } = useContext(AuthContext) as FbUserContextWrapper;
    //console.log(currentUser)
    const [token, setToken] = useState(
		currentUser ? currentUser.accessToken : ""
	);

	const [wikis, setWikis] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
    const [favorites, setFavorites] = useState([]);
    const [searchTerm, setSearchTerm] = useState(""); 
    const [favoritesOnly, setFavoritesOnly] = useState(false)

    const favorite_or_unfavorite = async (wikiId) => {

        const isFavorite = favorites.some(fav => fav._id === wikiId);
    
        try {

            const routePath = `/api/users/favorites`;
            const response = await fetch(routePath, {
                method: isFavorite ? "DELETE" : "POST",
                headers: {
                    Authorization: "Bearer " + currentUser.accessToken,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    wikiId
                })
            });

            //console.log(response)

            if (!response.ok) {
                throw new Error("Failed to update favorite");
            }
            
            setFavorites((prev) => isFavorite ? prev.filter((fav) => fav._id !== wikiId) 
            : [...prev, wikis.find((w) => w._id === wikiId)]);
            
            
            setWikis(prev =>
                prev.map(w =>
                    w._id === wikiId ? { ...w, favorites: isFavorite ? w.favorites - 1 : w.favorites + 1 } : w
                )
            );


        } catch (e) {

            console.error(e);
            alert("Error occured. Please try again.");

        }
    }
    
    useEffect(() => {
        const fetchData = async () => {
			try {
                //setLoading(true)
                let response;
                if (searchTerm.trim()) {
                    response = await fetch(`/api/wiki/search`, {   
                        method: "POST",                          
                        headers: {
                          Authorization: "Bearer " + token,
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ searchTerm }),
                    });
                } else {
                    response = await fetch(`/api/wiki/wikis/`, {
                        method: "GET",
                        headers: { Authorization: "Bearer " + token },
                    });
                }

				if (!response.ok){ 
                    throw "failed to fetch wiki"
                }

				const data = await response.json();
                // console.log(data);
				setWikis(data);

                const favoriteResponse = await fetch(`/api/users/favorites`, {
					method: "GET",
					headers: { Authorization: "Bearer " + token }
				});

                if (!favoriteResponse.ok){ 
                    throw "failed to fetch favorites"
                }
	
				const favoriteResult = await favoriteResponse.json();

                //console.log(favoriteResult);
				
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
	}, [currentUser, searchTerm, setFavoritesOnly]);

    if (loading) return <p>Loading...</p>;
	if (error) return <p>Error: {error}</p>;

    // console.log(favorites)
    console.log( typeof wikis)
    console.log(wikis.length)
    return (
        <div className="container-fluid">
            {!favoritesOnly &&
                <h1>Discover Wikis</h1>
            }
            {favoritesOnly &&
                <h1>Browse Favorites</h1>
            }
    
            <input
                type="text"
                placeholder="Filter By Wiki Name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <br/>
            <br/>
            {!favoritesOnly &&
                <button
                    onClick={() => setFavoritesOnly(true)}
                >
                    Filter By Favorites
                </button>
            }

            {favoritesOnly &&
                <button
                onClick={() => setFavoritesOnly(false)}
                >
                Show All Wikis
            </button>
            
            }
        <br/>
        <br/>
            <div> 
                {(favoritesOnly ? wikis.filter(w => favorites.some(fav => fav._id === w._id)) : wikis).length > 0 ? 
                (
                    (favoritesOnly ? wikis.filter(w => favorites.some(fav => fav._id === w._id)) : wikis)
                    .map((wiki) => (
                        <div className="card mb-3" key={wiki._id}>
                            <div className="card-body">
                                <Link to={`/${wiki.urlName}`} style={{textDecoration: "none"}}>
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
                                        <>
                                            <FaHeart color="red" />
                                        </>
                                    ) : (
                                        <>
                                            <FaRegHeart color="red" />
                                        </>
                                    )}
                                </button>
                                <p> 
                                    &nbsp;{`${wiki.favorites}`}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <h5>
                        {favoritesOnly ? "You do not have any wikis currently favorited." : "No Wikis Found"}
                    </h5>  
                )}
            </div>
       
        </div>
    );
    
}

export default Discover;