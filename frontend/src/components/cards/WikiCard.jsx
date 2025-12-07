import { Link } from "react-router-dom";

function WikiCard({wiki}) {
    return (
        <Link
            to={`/${wiki.urlName}`}
            style={{textDecoration: "none"}}
        >
            <div className="card mb-3">
                <div className="card-body">
                    <h3 className="card-title">{wiki.name}</h3>
                    <p clasName="card-text">{wiki.description}</p>
                </div>
            </div>
        </Link>
    );
}

export default WikiCard;