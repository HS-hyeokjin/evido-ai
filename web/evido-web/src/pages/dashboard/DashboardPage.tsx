import Card from "../../components/common/Card";

export default function DashboardPage() {
    return (
        <div className="space-y-4">
            <h1 className="text-xl font-black">대시보드</h1>

            <div className="grid gap-3 md:grid-cols-3">
                <Card>
                    <div className="font-black">문서</div>
                    <div className="mt-1 text-sm text-slate-500">업로드/버전/인덱싱</div>
                </Card>
                <Card>
                    <div className="font-black">질문/답변</div>
                    <div className="mt-1 text-sm text-slate-500">RAG + 출처</div>
                </Card>
                <Card>
                    <div className="font-black">사용량/감사</div>
                    <div className="mt-1 text-sm text-slate-500">Invoice로 확장</div>
                </Card>
            </div>
        </div>
    );
}
