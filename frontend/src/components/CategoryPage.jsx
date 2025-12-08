import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

function CategoryPage() {

    const { currentUser } = useContext(AuthContext);

    const {wikiUrlName, category} = useParams();

    const [data, setData] = useState(undefined);
    const [loading, setLoading] = useState(true);

    const [sort, setSort] = useState("");

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch(`/api/wiki/${wikiUrlName}/category/${category}`, {
                    method: "GET",
                    headers: {
                        Authorization: "Bearer " + currentUser.accessToken
                    }
                });
                if (!response.ok) {
                    throw (await response.json()).error;
                }
                const result = await (response.json());
                setData(result);
                setLoading(false);
            } catch (e) {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) {
        return (
            <p>Loading</p>
        );
    } else if (!data) {
        return (
            <p>Page Not Found</p>
        );
    } else {
        return (
            <div className="container-fluid">
                <h1>{category}</h1>
                <ul style={{listStyleType: "none"}}>
                    {data && data.map((page) => (
                        <li>
                            <Link to={`/${wikiUrlName}/${page.urlName}`}>{page.name}</Link>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }

}

export default CategoryPage;