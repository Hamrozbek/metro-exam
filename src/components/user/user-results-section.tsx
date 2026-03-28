import React from 'react';
import { Table, Progress, Input, Select, Button, ConfigProvider, theme } from 'antd';
import { SearchOutlined, FileTextOutlined, DownloadOutlined, BarChartOutlined, TrophyOutlined } from '@ant-design/icons';

const { Option } = Select;

const UserResultsSection: React.FC = () => {
    // Mock data - Natijalar tarixi
    const resultsData = [
        {
            key: '1',
            title: 'React Architecture & Performance',
            date: '2026-03-15',
            score: 92,
            totalQuestions: 25,
            correctAnswers: 23,
            timeSpent: '32 min',
            grade: 'A+',
        },
        {
            key: '2',
            title: 'Next.js 14 Fundamentals',
            date: '2026-03-10',
            score: 75,
            totalQuestions: 20,
            correctAnswers: 15,
            timeSpent: '18 min',
            grade: 'B',
        },
        {
            key: '3',
            title: 'TypeScript Utility Types',
            date: '2026-02-28',
            score: 45,
            totalQuestions: 30,
            correctAnswers: 14,
            timeSpent: '45 min',
            grade: 'F',
        },
    ];

    const columns = [
        {
            title: 'Test Nomi va Sana',
            dataIndex: 'title',
            key: 'title',
            render: (text: string, record: any) => (
                <div className="py-2">
                    <div className="text-slate-200 font-bold text-sm tracking-tight">{text}</div>
                    <div className="text-[10px] text-slate-500 font-medium mt-1 uppercase tracking-wider italic">
                        Topshirilgan: {record.date}
                    </div>
                </div>
            ),
        },
        {
            title: 'Natija (Foizda)',
            dataIndex: 'score',
            key: 'score',
            width: 250,
            render: (score: number) => {
                let strokeColor = '#10b981'; // green
                if (score < 80) strokeColor = '#3b82f6'; // blue
                if (score < 60) strokeColor = '#f59e0b'; // yellow
                if (score < 50) strokeColor = '#ef4444'; // red

                return (
                    <div className="flex items-center gap-3">
                        <div className="flex-1">
                            <Progress
                                percent={score}
                                size="small"
                                strokeColor={strokeColor}
                                trailColor="#1e293b"
                                showInfo={false}
                            />
                        </div>
                        <span className="text-xs font-black w-8 text-right" style={{ color: strokeColor }}>{score}%</span>
                    </div>
                );
            },
        },
        {
            title: 'To\'g\'ri javoblar',
            key: 'answers',
            render: (_: any, record: any) => (
                <div className="text-xs font-medium text-slate-400">
                    <span className="text-slate-200">{record.correctAnswers}</span> / {record.totalQuestions}
                </div>
            ),
        },
        {
            title: 'Vaqt sarfi',
            dataIndex: 'timeSpent',
            key: 'timeSpent',
            render: (time: string) => <span className="text-slate-500 text-xs font-mono">{time}</span>,
        },
        {
            title: 'Baho',
            dataIndex: 'grade',
            key: 'grade',
            align: 'center' as const,
            render: (grade: string) => (
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black border
          ${grade === 'A+' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                        grade === 'F' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                            'bg-blue-500/10 border-blue-500/20 text-blue-400'}`}>
                    {grade}
                </div>
            ),
        },
        {
            title: '',
            key: 'action',
            align: 'right' as const,
            render: () => (
                <Button
                    type="text"
                    icon={<DownloadOutlined />}
                    className="text-slate-500 hover:text-blue-500 hover:bg-blue-500/5 transition-all"
                />
            ),
        },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* 1. Yuqori Statistika (Minimal) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: 'O\'rtacha Ball', value: '70.6%', color: 'text-blue-500', icon: <BarChartOutlined /> },
                    { label: 'Eng Yuqori', value: '92%', color: 'text-emerald-500', icon: <TrophyOutlined className="text-amber-500" /> },
                    { label: 'Jami Sertifikatlar', value: '4 ta', color: 'text-purple-500', icon: <FileTextOutlined /> },
                ].map((item, i) => (
                    <div key={i} className="bg-[#0f172a] border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest m-0">{item.label}</p>
                            <h3 className={`text-xl font-black m-0 mt-1 ${item.color}`}>{item.value}</h3>
                        </div>
                        <div className="text-xl opacity-20">{item.icon}</div>
                    </div>
                ))}
            </div>

            {/* 2. Filterlar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[#0f172a] p-4 rounded-xl border border-slate-800">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Input
                        placeholder="Natijalardan qidirish..."
                        prefix={<SearchOutlined className="text-slate-500" />}
                        className="h-10 bg-slate-900 border-slate-800 text-slate-300 w-full md:w-64 rounded-lg"
                    />
                    <Select defaultValue="newest" className="h-10 w-40">
                        <Option value="newest">Yangi natijalar</Option>
                        <Option value="highest">Eng yuqori ball</Option>
                    </Select>
                </div>
                <Button icon={<DownloadOutlined />} className="bg-slate-800 border-none text-slate-300 font-bold text-xs h-10 px-6 rounded-lg">
                    Hisobotni yuklash (.PDF)
                </Button>
            </div>

            {/* 3. Natijalar Jadvali */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                <ConfigProvider
                    theme={{
                        algorithm: theme.darkAlgorithm,
                        components: {
                            Table: {
                                headerBg: 'transparent',
                                headerColor: '#64748b',
                                headerSplitColor: 'transparent',
                            }
                        }
                    }}
                >
                    <Table
                        dataSource={resultsData}
                        columns={columns}
                        pagination={false}
                        rowClassName="hover:bg-slate-800/10 transition-colors border-b border-slate-800/50"
                    />
                </ConfigProvider>
            </div>
        </div>
    );
};

export default UserResultsSection;