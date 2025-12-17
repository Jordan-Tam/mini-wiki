import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { AuthContext, type FbUserContext, type FbUserContextMaybe } from "../context/AuthContext.jsx";

function CategoryPage() {

    const { currentUser } = useContext(AuthContext) as FbUserContext;

    const {wikiUrlName, categoryUrlName} = useParams();

    const [wiki, setWiki] = useState(undefined);
    const [categoryName, setCategoryName] = useState(undefined);
    const [filteredPages, setFilteredPages] = useState(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(undefined);

    // Sorting
    const [sortByName, setSortByName] = useState(undefined);
    const [sortByLastEdited, setSortByLastEdited] = useState(undefined);
    const [sortByLastEditedBy, setSortByLastEditedBy] = useState(undefined);
    const [sortByFirstCreated, setSortByFirstCreated] = useState(undefined);
    const [sortByFirstCreatedBy, setSortByFirstCreatedBy] = useState(undefined);
    const [displayedList, setDisplayedList] = useState(undefined);
    const [sort, setSort] = useState("name");
    const [reverse, setReverse] = useState(false);

    const [pageNameText, setPageNameText] = useState("Page Name ⬆️");
    const [lastEditedText, setLastEditedText] = useState("Last Edited");
    const [lastEditedByText, setLastEditedByText] = useState("Last Edited By");
    const [firstCreatedText, setFirstCreatedText] = useState("First Created");
    const [firstCreatedByText, setFirstCreatedByText] = useState("First Created By");

    useEffect(() => {
        async function fetchData() {

            try {
                
                // Make the API call
                const response = await fetch(`/api/wiki/${wikiUrlName}`, {
                    method: "GET",
                    headers: {
                        Authorization: "Bearer " + currentUser.accessToken
                    }
                });

                // Check if a bad status code was returned.
                if (!response.ok) {
                    throw (await response.json()).error;
                }

                // Retrieve the returned wiki.
                const result = await (response.json());
                
                // Set wiki to be the wiki object.
                setWiki(result);

                // Set categoryName to be non-slugified category name.
                for (let i = 0; i < result.categories_slugified.length; i++) {
                    if (result.categories_slugified[i] === categoryUrlName) {
                        setCategoryName(result.categories[i]);
                    }
                }

                // Filter pages by the current category.
                setFilteredPages(result.pages.filter((p) => {
                    return p.category_slugified === categoryUrlName
                }));

            } catch (e) {

                setError(`${e}`);
                setLoading(false);

            }
        }
        fetchData();
    }, []);

    // When filteredPages is ready, sort the pages.
    // This is necessary because setState is asynchronous.
    useEffect(() => {

        if (filteredPages === undefined) {
            return;
        }

        // Displayed from A to Z.
        setSortByName(filteredPages.toSorted(
            (a, b) => {
                if (a.name > b.name) {
                    return 1;
                } else if (a.name < b.name) {
                    return -1;
                } else {
                    return 0;
                }
            }
        ))

        // Displayed from most recent to less recent.
        setSortByLastEdited(filteredPages.toSorted(
            (a, b) => {
                if (new Date(a.last_edited) > new Date(b.last_edited)) {
                    return 1;
                } else if (new Date(a.last_edited) < new Date(b.last_edited)) {
                    return -1;
                } else {
                    return 0;
                }
            }
        ));

        // Displayed from most recent to less recent.
        setSortByFirstCreated(filteredPages.toSorted(
            (a, b) => {
                if (new Date(a.first_created) > new Date(b.first_created)) {
                    return -1;
                } else if (new Date(a.first_created) < new Date(b.first_created)) {
                    return 1;
                } else {
                    return 0;
                }
            }
        ));

        // Displayed from A to Z.
        setSortByLastEditedBy(filteredPages.toSorted(
            (a, b) => {
                if (a.last_edited_by > b.last_edited_by) {
                    return 1;
                } else if (a.last_edited_by < b.last_edited_by) {
                    return -1;
                } else {
                    return 0;
                }
            }
        ));

        // Displayed from A to Z.
        setSortByFirstCreatedBy(filteredPages.toSorted(
            (a, b) => {
                if (a.first_created_by > b.first_created_by) {
                    return 1;
                } else if (a.first_created_by < b.first_created_by) {
                    return -1;
                } else {
                    return 0;
                }
            }
        ));

        // Initially sorted in alphabetical order.
        setDisplayedList(filteredPages.toSorted(
            (a, b) => {
                if (a.name > b.name) {
                    return 1;
                } else if (a.name < b.name) {
                    return -1;
                } else {
                    return 0;
                }
            }
        ));

        setLoading(false);

    }, [filteredPages]);

    const switchSort = (s) => {
        if (s === "name") {
            if (sort === "name") {
                setDisplayedList(!reverse ? sortByName.toReversed() : sortByName);
                setPageNameText(!reverse ? "Page Name ⬇️" : "Page Name ⬆️");
                setReverse(!reverse);
            } else {
                setReverse(false);
                setPageNameText("Page Name ⬆️")
                setLastEditedText("Last Edited");
                setLastEditedByText("Last Edited By");
                setFirstCreatedText("First Created");
                setFirstCreatedByText("First Created By");
                setSort("name");
                setDisplayedList(sortByName);
            }
        } else if (s === "last-edited") {
            if (sort === "last-edited") {
                setDisplayedList(!reverse ? sortByLastEdited.toReversed() : sortByLastEdited);
                setLastEditedText(!reverse ? "Last Edited ⬇️" : "Last Edited ⬆️");
                setReverse(!reverse);
            } else {
                setReverse(false);
                setSort("last-edited");
                setLastEditedText("Last Edited ⬆️");
                setPageNameText("Page Name");
                setLastEditedByText("Last Edited By");
                setFirstCreatedText("First Created");
                setFirstCreatedByText("First Created By");
                setDisplayedList(sortByLastEdited);
            }
        } else if (s === "last-edited-by") {
            if (sort === "last-edited-by") {
                setDisplayedList(!reverse ? sortByLastEditedBy.toReversed() : sortByLastEditedBy);
                setLastEditedByText(!reverse ? "Last Edited By ⬇️" : "Last Edited By ⬆️");
                setReverse(!reverse);
            } else {
                setReverse(false);
                setSort("last-edited-by");
                setLastEditedByText("Last Edited By ⬆️");
                setPageNameText("Page Name");
                setLastEditedText("Last Edited");
                setFirstCreatedText("First Created");
                setFirstCreatedByText("First Created By");
                setDisplayedList(sortByLastEditedBy);
            }
        } else if (s === "first-created") {
            if (sort === "first-created") {
                setDisplayedList(!reverse ? sortByFirstCreated.toReversed() : sortByFirstCreated);
                setFirstCreatedText(!reverse ? "First Created ⬇️" : "First Created ⬆️");
                setReverse(!reverse);
            } else {
                setReverse(false);
                setSort("first-created");
                setFirstCreatedText("First Created ⬆️");
                setPageNameText("Page Name");
                setLastEditedText("Last Edited");
                setLastEditedByText("Last Edited By");
                setFirstCreatedByText("First Created By");
                setDisplayedList(sortByFirstCreated);
            }
        } else if (s === "first-created-by") {
            if (sort === "first-created-by") {
                setDisplayedList(!reverse ? sortByFirstCreatedBy.toReversed() : sortByFirstCreatedBy);
                setFirstCreatedByText(!reverse ? "First Created By ⬇️" : "First Created By ⬆️");
                setReverse(!reverse);
            } else {
                setReverse(false);
                setSort("first-created-by");
                setFirstCreatedByText("First Created By ⬆️");
                setPageNameText("Page Name");
                setLastEditedText("Last Edited");
                setLastEditedByText("Last Edited By");
                setFirstCreatedText("First Created");
                setDisplayedList(sortByFirstCreatedBy);
            }
        }
    }

    if (loading) {
        return (
            <p>Loading</p>
        );
    } else if (!wiki) {
        return (
            <p>{error}</p>
        );
    } else {
        return (
            <>
            <div className="container-fluid">
                <h4>
                    <span style={{fontWeight: "bold"}}>Wiki: </span>
                    <Link to={`/${wikiUrlName}`}>{wiki.name}</Link>
                    <span> / </span>				
                    <span style={{fontWeight: "bold"}}>Category: </span>
                    {categoryName}
                </h4>
                <table className="table table-striped table-hover table-bordered" style={{tableLayout: "fixed"}}>
                    <thead>
                        <tr className="table-info">
                            <th scope="col" style={{userSelect: "none"}} onClick={() => switchSort("name")}>{pageNameText}</th>
                            <th scope="col" style={{userSelect: "none"}} onClick={() => switchSort("last-edited")}>{lastEditedText}</th>
                            <th scope="col" style={{userSelect: "none"}} onClick={() => switchSort("last-edited-by")}>{lastEditedByText}</th>
                            <th scope="col" style={{userSelect: "none"}} onClick={() => switchSort("first-created")}>{firstCreatedText}</th>
                            <th scope="col" style={{userSelect: "none"}} onClick={() => switchSort("first-created-by")}>{firstCreatedByText}</th>
                        </tr>
                    </thead>
                    <tbody className="table-group-divider">
                        {displayedList && displayedList.map((page, index) => (
                            <tr key={index}>
                                <td>
                                    <Link to={`/${wikiUrlName}/${page.urlName}`}>
                                        {page.name}
                                    </Link>
                                </td>
                                <td>{page.last_edited}</td>
                                <td>{page.last_edited_by.username}</td>
                                <td>{page.first_created}</td>
                                <td>{page.first_created_by.username}</td>
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
