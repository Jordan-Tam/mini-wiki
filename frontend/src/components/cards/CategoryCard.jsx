import { Link } from "react-router-dom";

function CategoryCard({wikiUrlName, category, numOfPages, setCategory, setShowEditCategoryModal, setShowDeleteCategoryModal}) {
    return (
        <div className="card mb-3">
            <div className="card-body">
                <Link
                    to={`/${wikiUrlName}/category/${category}`}
                    style={{textDecoration: "none"}}
                >
                    <h3 className="card-title">{category}</h3>
                </Link>
                <p>
                    <span style={{fontWeight: "bold"}}>Number of Pages:</span> {numOfPages}
                </p>
                <button
                    className="btn btn-warning me-3"
                    onClick={() => {
                        setCategory(category);
                        setShowEditCategoryModal(true)
                    }}
                >Edit</button>
                <button
                    className="btn btn-danger"
                    onClick={() => setShowDeleteCategoryModal(true)}
                >Delete</button>
            </div>
        </div>
    );
}

export default CategoryCard;