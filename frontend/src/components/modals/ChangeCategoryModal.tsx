import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import ReactModal from "react-modal";

ReactModal.setAppElement("#root");

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    width: "50%",
    border: "1px solid #28547a",
    borderRadius: "4px",
  },
};

function ChangeCategoryModal(props) {
    //console.log("ENTER MODAL")
    const { isOpen, handleClose, wikiUrlName, pageUrlName, wiki } = props;
    const { currentUser } = useContext(AuthContext);
    const [selectedCategory, setSelectedCategory] = useState("");

    
    useEffect(() => {
        if (isOpen) setSelectedCategory("");
    }, [isOpen]);

    const submitForm = async (event) => {
        event.preventDefault();
        if (!selectedCategory) return;

        try {
        const res = await fetch(
            `/api/wiki/${wikiUrlName}/pages/${pageUrlName}`,
            {
            method: "PATCH",
            headers: {
                Authorization: "Bearer " + currentUser.accessToken,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ newCategory: selectedCategory }),
            }
        );

        if (!res.ok){
            throw new Error("Failed to change category");
        }

        handleClose();
        alert("Category changed");
    
        } catch (e) {
        alert(`${e}`);
        }
    };

    return (
        <ReactModal
            name="changeCategoryModal"
            isOpen={isOpen}
            onRequestClose={handleClose}
            contentLabel="Change Category"
            style={customStyles}
        >

        <h3>Change Category</h3>

        <form onSubmit={submitForm}>
            <div className="form-group">
            {wiki?.categories?.map((category) => (
                <div key={category} className="form-check">
                <input
                    className="form-check-input"
                    type="radio"
                    name="category"
                    id={category}
                    value={category}
                    checked={selectedCategory === category}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                />
                <label className="form-check-label">
                    {category}
                </label>
                </div>
            ))}
            </div>

            <div className="mt-3 d-flex justify-content-end">
            <button
                type="button"
                className="btn btn-secondary me-2"
                onClick={handleClose}
            >
                Cancel
            </button>
            <button
                type="submit"
                className="btn btn-primary"
            >
                Change Category
            </button>
            </div>
        </form>
        </ReactModal>
    );
}

export default ChangeCategoryModal;
