import {useState, useEffect, useContext} from "react";
import {useParams, Link} from "react-router-dom";
import {AuthContext} from "../context/AuthContext.jsx";

function WikiHomePage() {

    // Auth
    const {currentUser} = useContext(AuthContext);
    const [token, setToken] = useState(
        currentUser ? currentUser.accessToken : ""
    );

    // Fetch
    let {id} = useParams();
    const [loading, setLoading] = useState(true);
    const [wikiData, setWikIData] = useState(undefined);

    // Modal
    // For creating category...

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch(`/api/wiki/${id}`, {
                    method: "GET",
                    headers: {
                        Authorization: "Bearer " + token
                    }
                });
                const result = await response.json();
                setWikIData(result);
                setLoading(false);
            } catch (e) {
                setLoading(false);
                return;
            }
        }
        fetchData();
    }, []);

    if (!currentUser) {
        return <Navigate to="/signin" />;
    }

	if (loading) {
		return (
			<div className="container-fluid">
				<h1>Loading...</h1>
			</div>
		);
	} else if (!wikiData) {
		return (
			<div className="container-fluid">
				<h1>Error</h1>
			</div>
		);
	} else {
        console.log(wikiData);
        return (
            <div className="container-fluid">
                <h1>Welcome.</h1>
            </div>
        )
    }

}