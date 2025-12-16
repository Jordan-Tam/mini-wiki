import React, { useContext, useRef, useState, type JSX } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";
import Modal from "react-modal";
import type { User, UserContext, Wiki } from "../../types.js";

Modal.setAppElement("#root");

interface TransferOwnershipFormResponse {
    wikiId: string;
    currentOwner_uid: string;
    newOwner_uid: string;
}

interface TransferOwnershipModalParams {
    isOpen: boolean;
    wiki: Wiki,
    collaborators: Array<User>;
    onClose: () => any;
    onSubmit: (response: TransferOwnershipFormResponse) => any;
}

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

export const TransferOwnershipModal:React.FC<TransferOwnershipModalParams> = ({
    isOpen,
    wiki,
    collaborators,
    onClose,
    onSubmit
}: TransferOwnershipModalParams): JSX.Element => {
    const currentUser = (useContext(AuthContext) as any).currentUser as UserContext;
    const selectRef = useRef<HTMLSelectElement | null>(null);

    // map collaborators to usernames
    let collab_username_map = {} as {[key:string]: User}
    for(const user of collaborators) {
        collab_username_map[user.username] = user;
    }

    const _handle_submit = async (e:any) => {
        let selected = selectRef.current?.value;
        if(!selected || selected.length < 1) {
            return;
        }

        if(prompt(`Are you sure you wish to transfer ownership of "${wiki.name}" to ${selected}? (THIS ACTION CANNOT BE UNDONE BY YOU).\n\nType "Yes" to confirm.`)?.toLocaleLowerCase() === "yes") {
            onSubmit({
                wikiId: wiki._id.toString(),
                currentOwner_uid: currentUser.uid,
                newOwner_uid: collab_username_map[selected].firebaseUID
            })
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            style={customStyles}
            contentLabel={`Transfer ownership of "${wiki.name}"`}
        >
            <h2>Transfer Ownership</h2>
            <form onSubmit={_handle_submit}>
                <label>Select a collaborator to make as the owner</label>
                <select ref={selectRef}>
                    <option value="">-- Select One --</option>
                    {collaborators.map((c) => (
                        <option value={c.username}>{c.username}</option>
                    ))}
                </select>
            </form>

            <button className="btn btn-danger" onClick={_handle_submit}>Select</button>
        </Modal>
    );
}