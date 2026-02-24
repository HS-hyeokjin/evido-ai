import Card from "../../components/common/Card";
import Button from "../../components/common/Button";

export default function LoginPage() {

    const handleGoogleLogin = () => {
        window.location.href =
            "http://localhost:8080/oauth2/authorization/google";
    };

    return (
        <div className="max-w-md space-y-4">
            <h1 className="text-xl font-black">로그인</h1>

            <Card>
                <div className="mb-3 text-sm text-slate-500">
                    Google 계정으로 로그인하세요.
                </div>

                <Button
                    className="w-full"
                    onClick={handleGoogleLogin}
                >
                    Google로 로그인
                </Button>
            </Card>
        </div>
    );
}