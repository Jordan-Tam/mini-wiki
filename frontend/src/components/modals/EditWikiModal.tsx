import React, { useRef, type JSX } from "react";
import Modal from "react-modal";
import type { Wiki } from "../../types.js";
import * as helpers from "../../../helpers.ts";

Modal.setAppElement("#root");

interface EditWikiFormResponse {
    name: string;
    description: string;
}

interface EditWikiModalParams {
    isOpen: boolean;
    wiki: Wiki,
    onClose: () => any;
    onSubmit: (response: EditWikiFormResponse) => any;
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

export const EditWikiModal:React.FC<EditWikiModalParams> = ({
    isOpen,
    wiki,
    onClose,
    onSubmit
}: EditWikiModalParams): JSX.Element => {
    const wikiNameRef = useRef<HTMLInputElement | null>(null);
    const wikiDescriptionRef = useRef<HTMLInputElement | null>(null);

    const _handle_submit = async () => {
        const res_proto = {
            name: wikiNameRef.current?.value,
            description: wikiDescriptionRef.current?.value
        };

        try {
            helpers.checkWikiOrPageName(res_proto.name as string);
        } catch (e) {
            alert("Invalid Wiki Name.");
            return;
        }

        try {
            helpers.checkDescription(res_proto.description as string);
        } catch (e) {
            alert(`Invalid Description.`);
            return;
        }

        // submit
        onSubmit(res_proto as EditWikiFormResponse);
    }

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            style={customStyles}
            contentLabel={`Edit "${wiki.name}"`}
        >
            <h2>Edit Wiki</h2>
            <form onSubmit={_handle_submit}>
                <div className="form-floating mb-3">
                    <input className="form-control" placeholder="name" type="text" ref={wikiNameRef} id="name" name="name" defaultValue={wiki.name}/>
                    <label htmlFor="name">Wiki Name</label>
                </div>
                <div className="form-floating mb-3">
                    <input className="form-control" placeholder="description" type="text" ref={wikiDescriptionRef} id="description" name="description" defaultValue={wiki.description}/>
                    <label htmlFor="name">Wiki Description</label>
                </div>
            </form>

            <button className="btn btn-primary me-2" onClick={_handle_submit}>Update</button>
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        </Modal>
    );
}