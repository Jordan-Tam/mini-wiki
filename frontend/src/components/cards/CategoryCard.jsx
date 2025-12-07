import { Link } from "react-router-dom";

function CategoryCard({wikiUrlName, category, numOfPages}) {
    return (
        <Link
            to={`/${wikiUrlName}/category/${category}`}
            style={{textDecoration: "none"}}
        >
            <div className="card mb-3">
                <div className="card-body">
                    <h3 className="card-title">{category}</h3>
                    <p>
                        <span style={{fontWeight: "bold"}}>Number of Pages:</span> {numOfPages}
                    </p>
                </div>
            </div>
        </Link>
    );
}

export default CategoryCard;