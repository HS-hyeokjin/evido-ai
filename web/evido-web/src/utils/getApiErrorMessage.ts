import { ApiError } from "../api/ApiError";

export function getApiErrorMessage(error: unknown): string {
    if (error instanceof ApiError) {
        switch (error.code) {
            case "INVALID_INPUT_VALUE":
                return error.message;

            case "UNAUTHORIZED":
                return "로그인이 필요합니다.";

            case "FORBIDDEN":
                return "접근 권한이 없습니다.";

            case "WORKSPACE_NOT_FOUND":
                return "워크스페이스를 찾을 수 없습니다.";

            case "WORKSPACE_ACCESS_DENIED":
                return error.message || "워크스페이스 접근 권한이 없습니다.";

            case "CONVERSATION_NOT_FOUND":
                return "대화를 찾을 수 없습니다.";

            case "DOCUMENT_NOT_FOUND":
                return "문서를 찾을 수 없습니다.";

            case "FILE_SIZE_EXCEEDED":
                return "업로드 가능한 최대 용량을 초과했습니다.";

            case "RAG_SERVER_ERROR":
                return "답변 생성 서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.";

            case "NETWORK_ERROR":
                return "서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요.";

            case "REQUEST_TIMEOUT":
                return "요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.";

            default:
                return error.message || "오류가 발생했습니다.";
        }
    }

    return "알 수 없는 오류가 발생했습니다.";
}