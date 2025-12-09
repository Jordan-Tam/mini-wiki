import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

function CategoryPage() {

    const { currentUser } = useContext(AuthContext);

    const {wikiUrlName, category} = useParams();

    const [data, setData] = useState(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(undefined);

    // Sorting
    const [sortByName, setSortByName] = useState(undefined);
    const [sortByLastEdited, setSortByLastEdited] = useState(undefined);
    const [sortByFirstCreated, setSortByFirstCreated] = useState(undefined);
    const [reverse, setReverse] = useState(false);

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
                setError(`${e}`);
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
            <p>{error}</p>
        );
    } else {
        return (
            <>
            <div className="container-fluid">
                <h1>{category}</h1>
                <table className="table table-striped table-hover table-bordered" style={{tableLayout: "fixed"}}>
                    <thead>
                        <tr className="table-info">
                            <th scope="col" onClick={() => {console.log("yippee")}}>Page Name</th>
                            <th scope="col">Last Edited</th>
                            <th scope="col">Last Edited By</th>
                            <th scope="col">First Created</th>
                            <th scope="col">First Created By</th>
                        </tr>
                    </thead>
                    <tbody className="table-group-divider">
                        {data && data.map((page) => (
                            <tr>
                                <td>
                                    <Link to={`/${wikiUrlName}/${page.urlName}`}>
                                        {page.name}
                                    </Link>
                                </td>
                                <td>{page.last_edited}</td>
                                <td>{page.last_edited_by}</td>
                                <td>{page.first_created}</td>
                                <td>{page.first_created_by}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            </>
        );
    }

}

export default CategoryPage;