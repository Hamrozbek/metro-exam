import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Modal, Typography, Tooltip, Space, Avatar, Tag } from 'antd';
import {
  SearchOutlined,
  FileTextOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { apiFetch } from '../../utils/api';
import { toast } from 'sonner';

const { Text } = Typography;

const ManagerResultsSection: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<any>(null);

  const pageSize = 10;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/results/manager-report/');

      // 🔥 BACKENDDAN KELAYOTGAN MA'LUMOTNI KONSOLDA KO'RISH UCHUN
      console.log("🔥 MANAGER TEST NATIJALARI:", data);

      if (data && data.results) {
        setResults(data.results || []);
      } else if (Array.isArray(data)) {
        setResults(data);
      } else {
        setResults([]);
      }
    } catch {
      toast.error("Natijalarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleViewResult = (record: any) => {
    setSelectedResult(record);
    setIsViewModalOpen(true);
  };

  // Qidiruv filtri
  const filtered = results.filter((item: any) => {
    const fullName = `${item?.employee?.first_name || ''} ${item?.employee?.last_name || ''}`.toLowerCase();
    const examTitle = (item?.exam?.title || item?.exam_title || '').toLowerCase();
    return fullName.includes(searchText.toLowerCase()) ||
      (item?.employee?.username || '').toLowerCase().includes(searchText.toLowerCase()) ||
      examTitle.includes(searchText.toLowerCase());
  });

  // --- MOBILE CARD ---
  const MobileCard = ({ record }: { record: any }) => {
    const isPassed = record?.score >= (record?.exam?.passing_score || 35);
    const examTitle = record?.exam?.title || record?.exam_title || '_';

    return (
      <div className="bg-[#1e293b]/40 border border-slate-800/60 rounded-2xl p-4 mb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 flex items-center gap-3">
            <Avatar className="bg-blue-500/10 text-blue-500 shrink-0" icon={<UserOutlined />} />
            <div>
              <p className="text-white font-semibold text-sm m-0 truncate">
                {record?.employee?.first_name || '_'} {record?.employee?.last_name || '_'}
              </p>
              <p className="text-slate-500 text-xs m-0">@{record?.employee?.username || '_'}</p>
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined className="text-blue-400" />}
              onClick={() => handleViewResult(record)}
              className="hover:bg-blue-500/10 rounded-lg"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-slate-800/50">
          <div className="flex items-center gap-1.5 text-slate-300 text-xs font-medium">
            <FileTextOutlined className="text-blue-400" />
            <span className="truncate">{examTitle}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-mono">
              <CalendarOutlined />
              <span>{record?.date || record?.created_at || '_'}</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              {isPassed ? <CheckCircleOutlined className="text-emerald-500" /> : <CloseCircleOutlined className="text-red-500" />}
              <span className={`font-bold ${isPassed ? 'text-emerald-400' : 'text-red-400'}`}>
                {record?.score ?? 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- DESKTOP COLUMNS ---
  const columns = [
    {
      title: '#',
      width: 50,
      render: (_: any, __: any, index: number) => <span className="text-slate-500">{(currentPage - 1) * pageSize + index + 1}</span>,
    },
    {
      title: 'Xodim',
      key: 'employee',
      render: (r: any) => (
        <Space>
          <Avatar className="bg-blue-500/10 text-blue-500" icon={<UserOutlined />} />
          <div className="flex flex-col">
            <span className="text-white font-medium text-sm">{`${r?.employee?.first_name || '_'} ${r?.employee?.last_name || '_'}`}</span>
            <span className="text-slate-500 text-[11px]">@{r?.employee?.username || '_'}</span>
          </div>
        </Space>
      ),
    },
    {
      title: "Test Nomi",
      key: 'exam_info',
      render: (r: any) => {
        const examTitle = r?.exam?.title || r?.exam_title || '_';
        return (
          <div className="flex flex-col gap-1">
            <Text className="text-slate-200 font-semibold text-sm truncate max-w-[200px]">{examTitle}</Text>
            <span className="text-slate-500 text-[10px] font-mono flex items-center gap-1">
              <CalendarOutlined /> {r?.date || r?.created_at || '_'}
            </span>
          </div>
        );
      },
    },
    {
      title: 'O\'tish / Olgan balli',
      key: 'scores',
      responsive: ['md'] as any,
      render: (r: any) => {
        const passingScore = r?.exam?.passing_score || 35;
        const actualScore = r?.score ?? 0;
        return (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">{passingScore}%</span>
            <span className="text-slate-600">/</span>
            <span className={`font-bold text-sm ${actualScore >= passingScore ? 'text-emerald-400' : 'text-red-400'}`}>
              {actualScore}%
            </span>
          </div>
        );
      },
    },
    {
      title: 'Holati',
      key: 'status',
      responsive: ['sm'] as any,
      render: (r: any) => {
        const isPassed = r?.score >= (r?.exam?.passing_score || 35);
        return (
          <Tag color={isPassed ? 'success' : 'error'} className="border-none px-3 font-bold uppercase tracking-wider text-[10px] m-0">
            {isPassed ? 'O\'tdi' : 'Yiqildi'}
          </Tag>
        );
      },
    },
    {
      title: 'Amallar',
      key: 'actions',
      width: 80,
      align: 'right' as const,
      render: (r: any) => (
        <Tooltip title="Natijani ko'rish">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewResult(r)}
            className="text-blue-400 hover:bg-blue-500/10"
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="p-3 sm:p-6 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-8 bg-slate-900/40 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800/50">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white m-0">Test Natijalari</h1>
          <Text className="text-slate-500 text-sm">Bo'limingizga tegishli barcha topshirilgan testlar</Text>
        </div>
        <Input
          placeholder="Xodim yoki test nomi orqali qidirish..."
          prefix={<SearchOutlined className="text-slate-500" />}
          onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }}
          className="w-full sm:w-80 h-11 sm:h-12 bg-[#0f172a] border-slate-700 text-white rounded-xl focus:border-blue-500 self-start sm:self-auto"
        />
      </div>

      {/* Jadval / Mobile kartalar */}
      {isMobile ? (
        <div>
          {filtered.length === 0 && !loading ? (
            <div className="text-center py-12 text-slate-500 text-sm">Natijalar topilmadi</div>
          ) : (
            filtered
              .slice((currentPage - 1) * pageSize, currentPage * pageSize)
              .map((res: any, idx: number) => <MobileCard key={idx} record={res} />)
          )}
        </div>
      ) : (
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <Table
            columns={columns}
            dataSource={filtered}
            loading={loading}
            rowKey="id"
            className="custom-dark-table"
            pagination={{
              pageSize,
              current: currentPage,
              onChange: (page) => setCurrentPage(page),
              className: 'p-4 m-0 border-t border-slate-800/50',
              showSizeChanger: false
            }}
            scroll={{ x: 600 }}
          />
        </div>
      )}

      {/* VIEW RESULT MODAL */}
      <Modal
        title={null}
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={null}
        width="95%"
        style={{ maxWidth: 500 }}
        centered
        closeIcon={null}
        modalRender={(modal) => (
          <div className="bg-[#0b1120] border border-slate-800 rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-2xl">
            {modal}
          </div>
        )}
      >
        {selectedResult && (
          <div className="p-5 sm:p-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-6 gap-3">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <Avatar
                  size={56}
                  className="bg-blue-600 text-white shrink-0 border-2 border-slate-700 shadow-lg"
                  icon={<UserOutlined />}
                />
                <div className="min-w-0">
                  <h2 className="text-white text-lg sm:text-xl font-bold m-0 truncate">
                    {selectedResult?.employee?.first_name || '_'} {selectedResult?.employee?.last_name || '_'}
                  </h2>
                  <p className="text-blue-400 text-xs font-mono mt-1 mb-0 bg-blue-500/10 px-2 py-0.5 rounded w-fit">
                    @{selectedResult?.employee?.username || '_'}
                  </p>
                </div>
              </div>
              <Button
                type="text"
                onClick={() => setIsViewModalOpen(false)}
                className="text-slate-500 hover:text-white hover:bg-slate-800 rounded-full shrink-0 flex items-center justify-center w-8 h-8 p-0"
              >✕</Button>
            </div>

            {/* Test Details Card */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 sm:p-5 mb-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-purple-500/10 p-2.5 rounded-xl border border-purple-500/20 shrink-0">
                  <TrophyOutlined className="text-purple-400 text-xl" />
                </div>
                <div className="min-w-0">
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-wider mb-1 m-0">Topshirilgan Test</p>
                  <p className="text-white text-sm sm:text-base font-bold m-0 truncate">
                    {selectedResult?.exam?.title || selectedResult?.exam_title || '_'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800/50">
                <div>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-wider m-0 mb-1">O'tish balli</p>
                  <p className="text-slate-300 font-bold m-0">{selectedResult?.exam?.passing_score || 35}%</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-wider m-0 mb-1">Topshirilgan vaqt</p>
                  <p className="text-slate-400 font-mono text-[10px] m-0 flex items-center gap-1 mt-1">
                    <ClockCircleOutlined /> {selectedResult?.date || selectedResult?.created_at || '_'}
                  </p>
                </div>
              </div>
            </div>

            {/* Natija */}
            {(() => {
              const isPassed = selectedResult?.score >= (selectedResult?.exam?.passing_score || 35);
              return (
                <div className={`p-5 rounded-2xl border flex items-center justify-between shadow-inner ${isPassed ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                  <div className="flex items-center gap-3">
                    {isPassed ? <CheckCircleOutlined className="text-emerald-400 text-3xl" /> : <CloseCircleOutlined className="text-red-400 text-3xl" />}
                    <div>
                      <p className={`text-[10px] font-black uppercase tracking-wider m-0 ${isPassed ? 'text-emerald-500' : 'text-red-500'}`}>
                        Yakuniy Holat
                      </p>
                      <p className={`text-base font-bold uppercase m-0 ${isPassed ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isPassed ? "Muvaffaqiyatli O'tdi" : 'Testdan Yiqildi'}
                      </p>
                    </div>
                  </div>
                  <div className={`text-3xl font-black ${isPassed ? 'text-emerald-400' : 'text-red-400'}`}>
                    {selectedResult?.score ?? 0}%
                  </div>
                </div>
              );
            })()}

            <Button
              block
              onClick={() => setIsViewModalOpen(false)}
              className="mt-6 sm:mt-8 h-11 sm:h-12 bg-slate-800 hover:bg-slate-700 border-none text-white rounded-2xl font-bold"
            >
              Yopish
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManagerResultsSection;