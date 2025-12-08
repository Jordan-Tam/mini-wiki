import type React from "react";

interface ChatParams {
    wikiId: string;
    userId: string;
}

export const Chat:React.FC<ChatParams> = ({
    wikiId,
    userId
}: ChatParams) => {
    
}