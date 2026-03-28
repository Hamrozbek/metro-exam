import React, { useState } from 'react';
import { Button, Card, Radio, Spin } from 'antd';
import { apiFetch } from '../../utils/api'; // O'zingiz yozgan api helper
import { toast } from 'sonner';

export const UserExamsSection: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [questions, setQuestions] = useState<any[]>([]);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [isStarted, setIsStarted] = useState(false);

    // 1. Testni boshlash va savollarni olish
    const handleStart = async () => {
        setLoading(true);
        try {
            // Vaqtni hisoblashni boshlaymiz
            await apiFetch('/results/start/', { method: 'POST' });

            // Savollarni tortib kelamiz
            const data = await apiFetch('/exams/my-questions/');
            setQuestions(data); // Backdan keladigan formatga qarab o'zgartirasiz, masalan data.questions bo'lishi mumkin
            setIsStarted(true);
            toast.success("Test boshlandi! Vaqt ketdi.");
        } catch (error) {
            toast.error("Xatolik: Testni boshlab bo'lmadi");
        } finally {
            setLoading(false);
        }
    };

    // 2. Javobni belgilash
    const handleSelect = (questionId: number, optionId: number) => {
        setAnswers({ ...answers, [questionId]: optionId });
    };

    // 3. Testni yakunlash va javoblarni jo'natish
    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Backend kutayotgan formatga o'tkazamiz (masalan [{question_id: 1, option_id: 2}, ...])
            const formattedAnswers = Object.entries(answers).map(([qId, oId]) => ({
                question_id: Number(qId),
                option_id: oId
            }));

            await apiFetch('/results/submit/', {
                method: 'POST',
                body: JSON.stringify({ answers: formattedAnswers })
            });

            toast.success("Javoblar yuborildi! Natijangiz hisoblanmoqda...");
            setQuestions([]);
            setIsStarted(false);
            setAnswers({});
        } catch (error) {
            toast.error("Javoblarni yuborishda xatolik!");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Spin size="large" className="flex justify-center mt-20" />;

    return (
        <div className="animate-in fade-in duration-500">
            {!isStarted ? (
                <div className="bg-[#0f172a] border border-slate-800 p-10 rounded-xl text-center">
                    <h2 className="text-white text-2xl font-bold mb-4">Sizga biriktirilgan test mavjud</h2>
                    <p className="text-slate-400 mb-6">Testni boshlasangiz vaqt ketadi va orqaga qaytib bo'lmaydi.</p>
                    <Button type="primary" size="large" onClick={handleStart} className="px-8 h-12 rounded-xl text-base font-medium">
                        Testni Boshlash
                    </Button>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800 sticky top-0 z-10 shadow-lg mb-6">
                        <h3 className="text-white m-0">Jami savollar: {questions.length} ta</h3>
                    </div>

                    {questions.map((q, index) => (
                        <Card key={q.id} className="bg-[#0f172a] border-slate-800 text-white rounded-xl shadow-lg">
                            <h3 className="text-lg font-medium text-white mb-4">
                                {index + 1}. {q.text} {/* Backenddagi savol maydoni nomi (q.text yoki q.title bo'lishi mumkin) */}
                            </h3>
                            <Radio.Group
                                onChange={(e) => handleSelect(q.id, e.target.value)}
                                value={answers[q.id]}
                                className="flex flex-col gap-3 w-full"
                            >
                                {q.options?.map((opt: any) => (
                                    <Radio key={opt.id} value={opt.id} className="text-slate-300 hover:text-white transition-colors bg-slate-800/50 p-3 rounded-lg w-full border border-slate-700/50">
                                        {opt.text} {/* Backenddagi variant maydoni nomi */}
                                    </Radio>
                                ))}
                            </Radio.Group>
                        </Card>
                    ))}

                    <Button
                        type="primary"
                        size="large"
                        onClick={handleSubmit}
                        className="w-full h-14 text-lg font-bold rounded-xl mt-6 bg-green-600 hover:bg-green-500 border-none"
                    >
                        Javoblarni yuborish
                    </Button>
                </div>
            )}
        </div>
    );
};