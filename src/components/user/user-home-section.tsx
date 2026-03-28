import React from 'react';
import { Row, Col, Progress, Tag, Table } from 'antd';
import {
    RightOutlined
} from '@ant-design/icons';

const UserHomeSection: React.FC = () => {

    // Statistika - faqat raqamlar va aniq ko'rsatkichlar
    const stats = [
        { title: 'Umumiy Ball', value: '1,250', detail: 'Top-5 talikda', color: '#3b82f6' },
        { title: 'O\'rtacha Aniqlik', value: '82%', detail: '+2.4% o\'sish', color: '#10b981' },
        { title: 'Yechilgan Testlar', value: '18', detail: 'Jami 24 tadan', color: '#6366f1' },
        { title: 'Kutilayotgan', value: '3', detail: 'Muddati yaqin', color: '#f59e0b' },
    ];

    // Jadval uchun ma'lumotlar (Topshirish kerak bo'lgan testlar)
    const dataSource = [
        { key: '1', name: 'React Architecture', time: '30 min', questions: 20, level: 'High' },
        { key: '2', name: 'Next.js App Router', time: '20 min', questions: 15, level: 'Medium' },
        { key: '3', name: 'TypeScript Core', time: '45 min', questions: 30, level: 'Hard' },
    ];

    const columns = [
        { title: 'Test Nomi', dataIndex: 'name', key: 'name', render: (text: string) => <span className="text-white font-medium">{text}</span> },
        { title: 'Savollar', dataIndex: 'questions', key: 'questions', render: (q: number) => <span className="text-slate-400">{q} ta</span> },
        { title: 'Vaqt', dataIndex: 'time', key: 'time', render: (t: string) => <span className="text-slate-400">{t}</span> },
        { title: 'Daraja', dataIndex: 'level', key: 'level', render: (l: string) => <Tag className="bg-slate-800 border-none text-slate-300">{l}</Tag> },
        { title: '', key: 'action', render: () => <RightOutlined className="text-slate-600 group-hover:text-blue-500 transition-colors" /> },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* 1. Yaxlit Statistika Paneli */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-[1px] bg-slate-800 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
                {stats.map((s, i) => (
                    <div key={i} className="bg-[#0f172a] p-6">
                        <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest m-0">{s.title}</p>
                        <div className="flex items-baseline gap-2 mt-2">
                            <h2 className="text-white text-3xl font-light m-0">{s.value}</h2>
                            <span className="text-[10px] font-medium" style={{ color: s.color }}>{s.detail}</span>
                        </div>
                    </div>
                ))}
            </div>

            <Row gutter={[24, 24]}>
                {/* 2. Asosiy Jadval - Faol testlar */}
                <Col xs={24} xl={16}>
                    <div className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden h-full">
                        <div className="p-5 border-b border-slate-800 flex justify-between items-center">
                            <h3 className="text-white font-bold m-0 text-base">Topshirish kerak bo'lgan testlar</h3>
                            <span className="text-slate-500 text-xs">Jami: 3 ta faol</span>
                        </div>
                        <Table
                            dataSource={dataSource}
                            columns={columns}
                            pagination={false}
                            className="user-table"
                            rowClassName="group cursor-pointer hover:bg-slate-800/30 transition-colors"
                        />
                    </div>
                </Col>

                {/* 3. Yon Panel - Shaxsiy Progress */}
                <Col xs={24} xl={8}>
                    <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6 space-y-8">
                        <div>
                            <h3 className="text-white font-bold m-0 text-sm mb-4">Sizning Progressingiz</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs mb-2">
                                        <span className="text-slate-400">Umumiy o'zlashtirish</span>
                                        <span className="text-white font-bold">78%</span>
                                    </div>
                                    <Progress percent={78} showInfo={false} strokeColor="#2563eb" trailColor="#1e293b" strokeWidth={6} />
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-2">
                                        <span className="text-slate-400">Keyingi darajagacha</span>
                                        <span className="text-white font-bold">120 ball</span>
                                    </div>
                                    <Progress percent={45} showInfo={false} strokeColor="#10b981" trailColor="#1e293b" strokeWidth={6} />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-800">
                            <h3 className="text-white font-bold m-0 text-sm mb-4 italic">Oxirgi Natijalar</h3>
                            <div className="space-y-3">
                                {[
                                    { label: 'JavaScript Dasar', score: 95 },
                                    { label: 'CSS Flexbox', score: 88 }
                                ].map((item, i) => (
                                    <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-slate-900/50 border border-slate-800/50 text-xs">
                                        <span className="text-slate-300">{item.label}</span>
                                        <span className="text-blue-400 font-bold">{item.score} ball</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>

            {/* CSS overrides for Ant Design Table in Dark Mode */}
            <style>{`
        .user-table .ant-table { background: transparent !important; color: #94a3b8 !important; }
        .user-table .ant-table-thead > tr > th { background: #0f172a !important; border-bottom: 1px solid #1e293b !important; color: #64748b !important; font-size: 12px; text-transform: uppercase; }
        .user-table .ant-table-tbody > tr > td { border-bottom: 1px solid #1e293b !important; }
      `}</style>
        </div>
    );
};

export default UserHomeSection;