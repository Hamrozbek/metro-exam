import React from 'react';
import { Form, Input, Button, Upload, Avatar, Divider, Tabs, Row, Col } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, CameraOutlined, SaveOutlined } from '@ant-design/icons';

const UserProfileSection: React.FC = () => {
    const [form] = Form.useForm();

    const onFinish = (values: any) => {
        console.log('Success:', values);
        // Bu yerda API ga yuborish logikasi bo'ladi
    };

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">

                {/* Header - User Info Summary */}
                <div className="p-8 bg-gradient-to-r from-slate-900 to-[#0f172a] border-b border-slate-800">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="relative group">
                            <Avatar
                                size={100}
                                icon={<UserOutlined />}
                                className="bg-blue-600 border-4 border-slate-800 shadow-2xl"
                            />
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <CameraOutlined className="text-white text-xl" />
                            </div>
                        </div>
                        <div className="text-center md:text-left">
                            <h2 className="text-white text-2xl font-black m-0 tracking-tight">Hamroz Nuriddinov</h2>
                            <p className="text-slate-500 text-sm font-medium mt-1">Frontend Developer • Tashkent, UZ</p>
                            <div className="flex gap-2 mt-3 justify-center md:justify-start">
                                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-bold rounded-full uppercase tracking-wider">Premium Plan</span>
                                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-full uppercase tracking-wider">Verified</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs for Navigation */}
                <div className="px-8 pt-4">
                    <Tabs
                        defaultActiveKey="1"
                        className="custom-profile-tabs"
                        items={[
                            {
                                key: '1',
                                label: <span className="text-xs font-bold uppercase tracking-widest px-2">Ma'lumotlar</span>,
                                children: (
                                    <div className="py-8">
                                        <Form
                                            form={form}
                                            layout="vertical"
                                            onFinish={onFinish}
                                            initialValues={{ name: 'Hamroz Nuriddinov', email: 'hamroz@example.com' }}
                                            className="space-y-4"
                                        >
                                            <Row gutter={24}>
                                                <Col xs={24} md={12}>
                                                    <Form.Item label={<span className="text-slate-400 font-bold text-[11px] uppercase">To'liq ism</span>} name="name">
                                                        <Input prefix={<UserOutlined className="text-slate-600" />} className="h-11 bg-slate-900 border-slate-800 text-slate-200 rounded-xl" />
                                                    </Form.Item>
                                                </Col>
                                                <Col xs={24} md={12}>
                                                    <Form.Item label={<span className="text-slate-400 font-bold text-[11px] uppercase">Email Manzil</span>} name="email">
                                                        <Input prefix={<MailOutlined className="text-slate-600" />} className="h-11 bg-slate-900 border-slate-800 text-slate-200 rounded-xl" />
                                                    </Form.Item>
                                                </Col>
                                                <Col xs={24} md={12}>
                                                    <Form.Item label={<span className="text-slate-400 font-bold text-[11px] uppercase">Telefon</span>} name="phone">
                                                        <Input placeholder="+998 90 123 45 67" className="h-11 bg-slate-900 border-slate-800 text-slate-200 rounded-xl" />
                                                    </Form.Item>
                                                </Col>
                                                <Col xs={24} md={12}>
                                                    <Form.Item label={<span className="text-slate-400 font-bold text-[11px] uppercase">Shahar</span>} name="city">
                                                        <Input placeholder="Toshkent" className="h-11 bg-slate-900 border-slate-800 text-slate-200 rounded-xl" />
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                            <Divider className="border-slate-800 my-8" />
                                            <div className="flex justify-end">
                                                <Button type="primary" icon={<SaveOutlined />} className="h-11 px-8 rounded-xl font-bold shadow-lg shadow-blue-500/20">
                                                    O'zgarishlarni saqlash
                                                </Button>
                                            </div>
                                        </Form>
                                    </div>
                                ),
                            },
                            {
                                key: '2',
                                label: <span className="text-xs font-bold uppercase tracking-widest px-2">Xavfsizlik</span>,
                                children: (
                                    <div className="py-8 space-y-8">
                                        <div className="max-w-md">
                                            <h4 className="text-white font-bold mb-4">Parolni yangilash</h4>
                                            <Form layout="vertical" className="space-y-4">
                                                <Form.Item label={<span className="text-slate-400 font-bold text-[11px] uppercase">Joriy parol</span>} name="oldPassword">
                                                    <Input.Password prefix={<LockOutlined className="text-slate-600" />} className="h-11 bg-slate-900 border-slate-800 text-slate-200 rounded-xl" />
                                                </Form.Item>
                                                <Form.Item label={<span className="text-slate-400 font-bold text-[11px] uppercase">Yangi parol</span>} name="newPassword">
                                                    <Input.Password prefix={<LockOutlined className="text-slate-600" />} className="h-11 bg-slate-900 border-slate-800 text-slate-200 rounded-xl" />
                                                </Form.Item>
                                                <Button className="h-11 bg-slate-800 border-none text-slate-300 font-bold px-6 rounded-xl">
                                                    Parolni o'zgartirish
                                                </Button>
                                            </Form>
                                        </div>

                                        <Divider className="border-slate-800" />

                                        <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10">
                                            <h4 className="text-rose-500 font-bold text-sm m-0">Hisobni o'chirish</h4>
                                            <p className="text-slate-500 text-xs mt-1 mb-4">Hisobingizni o'chirganingizdan so'ng, barcha natijalaringiz butunlay yo'qoladi.</p>
                                            <Button danger type="text" className="font-bold text-xs p-0 hover:bg-transparent">Hisobni o'chirishni so'rash</Button>
                                        </div>
                                    </div>
                                ),
                            },
                        ]}
                    />
                </div>
            </div>

            <style>{`
        .custom-profile-tabs .ant-tabs-nav::before { border-bottom: 1px solid #1e293b !important; }
        .custom-profile-tabs .ant-tabs-tab-active .ant-tabs-tab-btn { color: #3b82f6 !important; }
        .custom-profile-tabs .ant-tabs-ink-bar { background: #3b82f6 !important; height: 3px !important; border-radius: 3px 3px 0 0; }
        .ant-form-item-label > label { height: auto !important; }
      `}</style>
        </div>
    );
};

export default UserProfileSection;