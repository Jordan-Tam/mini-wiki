import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

function Browse(){

	const { currentUser } = useContext(AuthContext);
	const [wikis, setWikis] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

    useEffect(() => {
        const fetchWiki = async () => {
			try {
				const response = await fetch(`/api/wiki/wikis/`, {
					method: "GET",
					headers: {
						Authorization: "Bearer " + currentUser?.accessToken
					}
				});
                console.log(response)
				if (!response.ok){ 
                    throw new Error("Failed to fetch wiki");
                }
				const data = await response.json();
				setWikis(data)
			} catch (e) {
				setError(e.message);
			} finally {
				setLoading(false);
			}
		};

		if (currentUser){
            fetchWiki();
        }
	}, [currentUser]);

    if (loading) return <p>Loading...</p>;
	if (error) return <p>Error: {error}</p>;

    return (
        <>
            <h1>Browse Public Wikis</h1>
    
            <p> (Search will go here) </p>
            
            {wikis && wikis.length > 0 ? (
                <div>
                    {wikis.map((wiki) => (
                        <Link to={`/wiki/${wiki._id}`} style={{textDecoration: "none"}}>
                        <div className="card mb-3">
                            <div className="card-body">
                                <h3 className="card-title">
                                    {wiki.name}
                                </h3>
                                <p className="card-text">
                                    {wiki.description}
                                </p>
                            </div>
                        </div>
                    </Link>
                    ))}
                </div>
            ) : (
                <p> No Wikis Found</p>
            )}
        </>
    );
    
}

export default Browse;