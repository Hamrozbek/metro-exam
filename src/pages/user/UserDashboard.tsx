import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Layout, Button, Card, Radio, Spin,
  Typography, Modal, ConfigProvider, theme, Progress, App,
} from 'antd';
import {
  LogoutOutlined, CheckCircleOutlined, CloseCircleOutlined,
  ExclamationCircleOutlined, FileTextOutlined,
  ClockCircleOutlined, WarningOutlined,
} from '@ant-design/icons';
import { toast } from 'sonner';

const { Content, Header } = Layout;
const { Title, Text } = Typography;

// ─── Types ────────────────────────────────────────────────────────────────────
interface Option { id: number; text: string }
interface Question { id: number; text: string; options: Option[] }

interface CheckInData {
  id: number;
  user: number;
  username: string;
  full_name: string;
  exam: number;
  exam_title: string;
  exam_duration?: number;
  duration?: number;
  status: string;
  ip_address: string;
  created_at: string;
}

interface SubmitResult {
  score?: number;
  total?: number;
  correct?: number;
  wrong?: number;
  passed?: boolean;
  [key: string]: unknown;
}

// ─── API helper — token bloklangandan keyin 401 ni maxsus handle qilamiz ───────
const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

const getToken = () => localStorage.getItem('access_token') || '';

const apiFetch = async (
  url: string,
  options: RequestInit = {},
  ignoreUnauthorized = false
) => {
  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...(options.headers || {}),
    },
  });

  // 401 — submit dan keyin token bloklanadi, bu normal holat
  if (res.status === 401) {
    if (ignoreUnauthorized) {
      // 401 ni xato sifatida ko'tarmay, null qaytaramiz
      return null;
    }
    localStorage.clear();
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (res.status === 204) return null;

  const data = await res.json();

  if (!res.ok) {
    console.error('Server xatosi:', data);
    throw Object.assign(new Error(JSON.stringify(data)), { data });
  }

  return data;
};

// ─── Vaqt formati ─────────────────────────────────────────────────────────────
const formatTime = (sec: number) => {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

// ─── Inner component ──────────────────────────────────────────────────────────
const ExamInner: React.FC = () => {
  const { modal } = App.useApp();

  const [pageLoading, setPageLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [checkIn, setCheckIn] = useState<CheckInData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [attemptId, setAttemptId] = useState<number | null>(null);

  const [screen, setScreen] = useState<
    'loading' | 'already-done' | 'start' | 'exam' | 'result'
  >('loading');

  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);
  const [isLogoutModal, setIsLogoutModal] = useState(false);

  const DEFAULT_DURATION = 30 * 60;
  const [timeLeft, setTimeLeft] = useState(DEFAULT_DURATION);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoSubmittedRef = useRef(false);
  const answersRef = useRef<Record<number, number>>({});
  const attemptIdRef = useRef<number | null>(null);

  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { attemptIdRef.current = attemptId; }, [attemptId]);

  // ── Anti-cheat ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const blockRight = (e: MouseEvent) => e.preventDefault();
    const blockKeys = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key)) ||
        (e.ctrlKey && e.key === 'U')
      ) e.preventDefault();
    };
    document.addEventListener('contextmenu', blockRight);
    document.addEventListener('keydown', blockKeys);
    return () => {
      document.removeEventListener('contextmenu', blockRight);
      document.removeEventListener('keydown', blockKeys);
    };
  }, []);

  // ── Check-in ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('Token topilmadi!');
        setTimeout(() => { window.location.href = '/login'; }, 1200);
        return;
      }
      try {
        const data: CheckInData = await apiFetch('/attendance/check-in/', { method: 'POST' });
        setCheckIn(data);
        const dur = data.exam_duration ?? data.duration;
        if (dur && dur > 0) setTimeLeft(dur * 60);

        if (data.status === 'TUGALLANGAN' || data.status === 'COMPLETED') {
          setScreen('already-done');
        } else {
          setScreen('start');
        }
      } catch {
        toast.error("Kirish ma'lumotlari yuklanmadi!");
        setScreen('start');
      } finally {
        setPageLoading(false);
      }
    };
    init();
  }, []);

  // ── Submit (faqat BIR MARTA chaqiriladi) ────────────────────────────────────
  const doSubmit = useCallback(async (
    currentAnswers: Record<number, number>,
    currentAttemptId: number | null
  ) => {
    // Ikki marta submit bo'lmasligi uchun guard
    if (autoSubmittedRef.current) return;
    autoSubmittedRef.current = true;

    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setSubmitLoading(true);

    const payload = {
      attempt_id: currentAttemptId,
      answers: Object.entries(currentAnswers).map(([q_id, opt_id]) => ({
        question: Number(q_id),
        selected_option: Number(opt_id),
      })),
    };

    try {
      // ignoreUnauthorized=true — submit qilingach token bloklanadi, 401 normal
      const result = await apiFetch(
        '/results/submit/',
        { method: 'POST', body: JSON.stringify(payload) },
        true  // ← 401 ni xato sifatida ko'tarmaydi
      );

      // result null bo'lishi mumkin (401 kelsa) — bu ham muvaffaqiyat (token bloklandi)
      setSubmitResult(result as SubmitResult ?? {});
      setScreen('result');
      toast.success('Test muvaffaqiyatli yakunlandi!');
    } catch (e: unknown) {
      // Boshqa xato bo'lsa (400, 500) — baribir natija ekraniga o'tamiz
      console.error('Submit xato:', e);
      toast.error('Javoblar yuborildi, lekin natija yuklanmadi.');
      setScreen('result');
    } finally {
      setSubmitLoading(false);
    }
  }, []);

  // ── Timer ───────────────────────────────────────────────────────────────────
  const startTimer = useCallback((seconds: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(seconds);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          toast.warning('Vaqt tugadi! Test avtomatik yakunlandi.');
          doSubmit(answersRef.current, attemptIdRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [doSubmit]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  // ── Testni boshlash ─────────────────────────────────────────────────────────
  const handleStart = async () => {
    if (!checkIn) return;
    setPageLoading(true);
    try {
      // POST /results/start/ → { exam_id: <id> }
      const startResp = await apiFetch('/results/start/', {
        method: 'POST',
        body: JSON.stringify({ exam_id: checkIn.exam }),
      });

      // attempt_id ni saqlash — submit uchun kerak
      const newAttemptId = startResp?.id ?? startResp?.attempt_id ?? startResp?.attempt ?? null;
      setAttemptId(newAttemptId);
      attemptIdRef.current = newAttemptId;

      // Savollarni olish
      const raw = await apiFetch('/exams/my-questions/');
      const list: Question[] = (Array.isArray(raw) ? raw : raw?.results ?? [])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((q: any) => ({
          id: q.id,
          text: q.text ?? q.question ?? 'Savol yo\'q',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          options: (q.options ?? q.choices ?? []).map((o: any) => ({
            id: o.id,
            text: o.text ?? o.option ?? 'Variant yo\'q',
          })),
        }));

      if (!list.length) { toast.error('Savollar topilmadi!'); setPageLoading(false); return; }

      setQuestions(list);
      setAnswers({});
      answersRef.current = {};
      autoSubmittedRef.current = false;
      setScreen('exam');

      const dur = checkIn.exam_duration ?? checkIn.duration;
      startTimer(dur && dur > 0 ? dur * 60 : DEFAULT_DURATION);
      toast.success(`Test boshlandi — ${list.length} ta savol`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(`Test boshlashda xato: ${msg}`);
    } finally {
      setPageLoading(false);
    }
  };

  const handleSelect = (qId: number, optId: number) =>
    setAnswers(prev => ({ ...prev, [qId]: optId }));

  // ── Qo'lda yuborish ─────────────────────────────────────────────────────────
  const handleManualSubmit = () => {
    modal.confirm({
      title: 'Testni yakunlamoqchimisiz?',
      content: `${Object.keys(answers).length}/${questions.length} ta savolga javob berdingiz. Yuborilgach o'zgartirib bo'lmaydi.`,
      okText: 'Yuborish', cancelText: 'Bekor', centered: true,
      onOk: () => doSubmit(answersRef.current, attemptIdRef.current),
    });
  };

  const handleLogout = () => { localStorage.clear(); window.location.href = '/login'; };

  const answeredCount = Object.keys(answers).length;
  const progress = questions.length ? Math.round((answeredCount / questions.length) * 100) : 0;

  const timeColor = timeLeft <= 60 ? 'text-red-400' : timeLeft <= 300 ? 'text-yellow-400' : 'text-green-400';
  const timeBg = timeLeft <= 60 ? 'bg-red-500/10 border-red-500/30'
    : timeLeft <= 300 ? 'bg-yellow-500/10 border-yellow-500/30'
      : 'bg-slate-800/50 border-slate-700';

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#020617' }}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <Header className="border-b border-slate-800 px-4 sm:px-6 flex justify-between items-center text-white sticky top-0 z-50 h-14"
        style={{ background: '#0f172a' }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-sm shrink-0">T</div>
          <span className="font-bold text-base hidden sm:block">Test Platformasi</span>
        </div>
        <div className="flex items-center gap-3">
          {screen === 'exam' && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono font-bold text-sm ${timeBg} ${timeColor}`}>
              <ClockCircleOutlined />
              {formatTime(timeLeft)}
            </div>
          )}
          {checkIn && screen !== 'exam' && screen !== 'result' && (
            <span className="text-slate-300 text-sm hidden sm:block">{checkIn.full_name}</span>
          )}
          {screen !== 'exam' && screen !== 'result' && (
            <Button danger size="small" icon={<LogoutOutlined />}
              onClick={() => setIsLogoutModal(true)}
              className="bg-red-500/10 border-red-500/20 text-red-400">
              <span className="hidden sm:inline">Chiqish</span>
            </Button>
          )}
        </div>
      </Header>

      <Content className="flex justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-3xl">

          {/* ── LOADING ─────────────────────────────────────────────────── */}
          {(screen === 'loading' || pageLoading) && (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <Spin size="large" />
              <p className="text-slate-400 text-sm">Yuklanmoqda...</p>
            </div>
          )}

          {/* ── AVVAL TOPSHIRILGAN ──────────────────────────────────────── */}
          {screen === 'already-done' && !pageLoading && (
            <div className="bg-[#0f172a] border border-slate-800 p-8 sm:p-12 rounded-3xl text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-orange-500" />
              <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <WarningOutlined className="text-5xl text-yellow-400" />
              </div>
              <Title level={2} className="!text-white mb-3">Test allaqachon topshirilgan!</Title>
              {checkIn && (
                <p className="text-slate-400 mb-2">
                  <span className="text-white font-semibold">{checkIn.full_name}</span>
                  {' — '}
                  <span className="text-blue-400">{checkIn.exam_title}</span>
                </p>
              )}
              <p className="text-slate-500 text-sm mb-8">
                Siz ushbu testni avval topshirgansiz. Qayta topshirish mumkin emas.
              </p>
              <Button type="primary" danger size="large" onClick={handleLogout}
                className="h-12 px-12 rounded-xl font-bold w-full max-w-xs">
                Tizimdan chiqish
              </Button>
            </div>
          )}

          {/* ── BOSHLASH EKRANI ─────────────────────────────────────────── */}
          {screen === 'start' && !pageLoading && (
            <div className="relative bg-[#0f172a] border border-slate-800/60 p-8 sm:p-14 rounded-[2rem] text-center shadow-xl overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10">
                <div className="w-20 h-20 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
                  <FileTextOutlined className="text-4xl text-blue-400" />
                </div>
                {checkIn && (
                  <>
                    <Text className="text-slate-400 text-sm block">Xush kelibsiz,</Text>
                    <Title level={3} className="!text-white !mt-1 !mb-1">{checkIn.full_name}</Title>
                    <Title level={2} className="!text-white !mb-0">{checkIn.exam_title}</Title>
                    <div className="flex justify-center gap-3 mt-5 mb-8 flex-wrap">
                      {(checkIn.exam_duration ?? checkIn.duration) && (
                        <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700/50 px-4 py-3 rounded-xl">
                          <ClockCircleOutlined className="text-blue-400" />
                          <div className="text-left">
                            <div className="text-[10px] text-slate-500 uppercase tracking-wider">Vaqt</div>
                            <div className="text-white font-bold text-sm">
                              {checkIn.exam_duration ?? checkIn.duration} daqiqa
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700/50 px-4 py-3 rounded-xl">
                        <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                        <div className="text-left">
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Holat</div>
                          <div className="text-white font-bold text-sm">{checkIn.status}</div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                <Text className="text-slate-400 block mb-8">
                  Boshlash tugmasini bosganingizdan so'ng vaqt boshlanadi
                </Text>
                <Button type="primary" size="large" onClick={handleStart}
                  className="px-12 h-14 rounded-2xl font-bold text-lg bg-blue-600 border-none shadow-xl shadow-blue-500/20 w-full sm:w-auto">
                  Testni Boshlash
                </Button>
              </div>
            </div>
          )}

          {/* ── SAVOLLAR EKRANI ─────────────────────────────────────────── */}
          {screen === 'exam' && (
            <div className="space-y-4 pb-8">
              {/* Sticky progress + timer */}
              <div className="border border-slate-800 rounded-2xl p-3 sm:p-4 sticky top-14 z-40 shadow-xl"
                style={{ background: '#0f172a' }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono font-bold text-sm shrink-0 ${timeBg} ${timeColor}`}>
                    <ClockCircleOutlined />
                    {formatTime(timeLeft)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-400 text-[11px]">
                        <span className="text-white font-bold">{answeredCount}</span>/{questions.length}
                      </span>
                      <span className="text-blue-400 text-[11px] font-bold">{progress}%</span>
                    </div>
                    <div className="bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  <Button type="primary" onClick={handleManualSubmit}
                    loading={submitLoading} disabled={answeredCount === 0}
                    className="bg-blue-600 border-none rounded-xl font-semibold shrink-0 h-9 px-4">
                    Yuborish
                  </Button>
                </div>
                {timeLeft <= 60 && timeLeft > 0 && (
                  <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/5 border border-red-500/20 rounded-xl px-3 py-2">
                    <WarningOutlined /> Vaqt deyarli tugadi! Javoblarni tezda yuboring.
                  </div>
                )}
              </div>

              {questions.map((q, i) => (
                <Card key={q.id}
                  className={`rounded-2xl shadow-lg transition-all duration-200 ${answers[q.id] ? 'border-blue-500/40' : 'border-slate-800'}`}
                  style={{ background: '#0f172a' }}
                  styles={{ body: { padding: '18px 20px' } }}
                >
                  <div className="flex items-start gap-3 mb-4">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${answers[q.id] ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                      {i + 1}
                    </span>
                    <h3 className="text-sm sm:text-base font-medium text-white leading-relaxed">{q.text}</h3>
                  </div>
                  <Radio.Group onChange={e => handleSelect(q.id, e.target.value)}
                    value={answers[q.id]} className="flex flex-col gap-2 w-full">
                    {q.options.map(opt => (
                      <Radio key={opt.id} value={opt.id}
                        className={`px-4 py-3 rounded-xl border transition-all w-full text-sm ${answers[q.id] === opt.id
                          ? 'bg-blue-600/10 border-blue-500/60 text-white'
                          : 'bg-slate-800/40 border-slate-700/50 text-slate-300 hover:border-slate-500'
                          }`}>
                        <span className="ml-1 leading-relaxed">{opt.text}</span>
                      </Radio>
                    ))}
                  </Radio.Group>
                </Card>
              ))}

              <Button type="primary" size="large" onClick={handleManualSubmit}
                loading={submitLoading} disabled={answeredCount === 0}
                className="w-full h-14 text-base font-bold rounded-2xl bg-blue-600 border-none shadow-lg">
                Javoblarni Yuborish ({answeredCount}/{questions.length})
              </Button>
            </div>
          )}

          {/* ── NATIJA EKRANI ───────────────────────────────────────────── */}
          {screen === 'result' && (
            <div className="bg-[#0f172a] border border-slate-800 p-8 sm:p-12 rounded-3xl text-center shadow-2xl relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${submitResult?.passed !== false ? 'from-green-500 to-emerald-400' : 'from-red-500 to-rose-400'
                }`} />

              <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${submitResult?.passed !== false ? 'bg-green-500/10' : 'bg-red-500/10'
                }`}>
                {submitResult?.passed !== false
                  ? <CheckCircleOutlined className="text-5xl text-green-400" />
                  : <CloseCircleOutlined className="text-5xl text-red-400" />
                }
              </div>

              <Title level={2} className="!text-white mb-1">Test Yakunlandi!</Title>
              {checkIn && (
                <p className="text-slate-400 mb-6 text-sm">
                  <span className="text-white font-medium">{checkIn.full_name}</span>
                  {' — '}
                  <span className="text-blue-400">{checkIn.exam_title}</span>
                </p>
              )}

              {submitResult && Object.keys(submitResult).length > 0 && (
                <div className="flex justify-center gap-3 mb-6 flex-wrap">
                  {submitResult.score !== undefined && (
                    <div className="bg-blue-500/10 p-5 rounded-2xl border border-blue-500/20 flex-1 min-w-[80px]">
                      <div className="text-3xl font-black text-blue-400">{submitResult.score}%</div>
                      <div className="text-slate-400 text-xs mt-1 uppercase tracking-wider">Ball</div>
                    </div>
                  )}
                  {submitResult.correct !== undefined && (
                    <div className="bg-green-500/10 p-5 rounded-2xl border border-green-500/20 flex-1 min-w-[80px]">
                      <div className="text-3xl font-black text-green-400">{submitResult.correct}</div>
                      <div className="text-slate-400 text-xs mt-1 uppercase tracking-wider">To'g'ri</div>
                    </div>
                  )}
                  {submitResult.wrong !== undefined && (
                    <div className="bg-red-500/10 p-5 rounded-2xl border border-red-500/20 flex-1 min-w-[80px]">
                      <div className="text-3xl font-black text-red-400">{submitResult.wrong}</div>
                      <div className="text-slate-400 text-xs mt-1 uppercase tracking-wider">Xato</div>
                    </div>
                  )}
                  {submitResult.total !== undefined && (
                    <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700 flex-1 min-w-[80px]">
                      <div className="text-3xl font-black text-white">{submitResult.total}</div>
                      <div className="text-slate-400 text-xs mt-1 uppercase tracking-wider">Jami</div>
                    </div>
                  )}
                </div>
              )}

              {submitResult?.score !== undefined && (
                <div className="flex justify-center mb-6">
                  <Progress type="circle" percent={submitResult.score as number} size={100}
                    strokeColor={submitResult.passed !== false ? '#22c55e' : '#ef4444'}
                    trailColor="#1e293b"
                    format={p => <span className="text-white font-bold text-lg">{p}%</span>}
                  />
                </div>
              )}

              {submitResult?.passed !== undefined && (
                <div className={`inline-flex items-center gap-2 px-8 py-3 rounded-2xl mb-8 font-bold text-base ${submitResult.passed
                  ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                  : 'bg-red-500/10 border border-red-500/30 text-red-400'
                  }`}>
                  {submitResult.passed
                    ? <><CheckCircleOutlined /> Siz testdan muvaffaqiyatli o'tdingiz!</>
                    : <><CloseCircleOutlined /> Afsuski, testdan o'ta olmadingiz</>
                  }
                </div>
              )}

              <Button type="primary" danger size="large" onClick={handleLogout}
                className="h-12 px-12 rounded-xl font-bold w-full max-w-xs block mx-auto">
                Tugatdim — Chiqish
              </Button>
            </div>
          )}

        </div>
      </Content>

      {/* Logout Modal */}
      <Modal
        title={<div className="flex items-center gap-2 text-white"><ExclamationCircleOutlined className="text-red-500" /> Chiqish</div>}
        open={isLogoutModal} onOk={handleLogout} onCancel={() => setIsLogoutModal(false)}
        okText="Ha, chiqish" cancelText="Bekor"
        okButtonProps={{ danger: true, size: 'large', className: 'rounded-xl' }}
        cancelButtonProps={{ type: 'text', size: 'large' }}
        centered closable={false}
      >
        <p className="text-slate-300 py-2">Tizimdan chiqmoqchimisiz?</p>
      </Modal>
    </Layout>
  );
};

// ─── Wrapper ──────────────────────────────────────────────────────────────────
const EmployeeExam: React.FC = () => (
  <ConfigProvider theme={{
    algorithm: theme.darkAlgorithm,
    token: {
      colorPrimary: '#2563eb', colorBgBase: '#020617',
      colorBgContainer: '#0f172a', borderRadius: 12, colorBorderSecondary: '#1e293b',
    },
  }}>
    <App>
      <ExamInner />
    </App>
  </ConfigProvider>
);

export default EmployeeExam;