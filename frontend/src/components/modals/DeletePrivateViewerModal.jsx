import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext.jsx";
import Modal from "react-modal";

Modal.setAppElement("#root");

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
		borderRadius: "4px"
	}
};

function deletePrivateViewerModal(props){
    // Auth
	const { currentUser } = useContext(AuthContext);
	const navigate = useNavigate();


    const submitForm = async (e) => {
    
    }
    return (
        <div>
            <Modal
				isOpen={props.isOpen}
				onRequestClose={props.handleClose}
				style={customStyles}
				contentLabel="Create Page Modal"
			>
                <p> DELETE PRIVATE VIEWER MODAL </p>
            
            </Modal>
        </div>
    )

}

export default deletePrivateViewerModal;