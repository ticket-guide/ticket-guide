'use client';

import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, LogIn, UserPlus, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuthStore } from './store';
import { signIn, signUp, signOut, fetchProfile } from './logic';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { UserType } from './types';

/* ───────────────────────────────────────────────
   AuthModal — 로그인 / 회원가입 모달
─────────────────────────────────────────────── */
export const AuthModal = () => {
    const { isModalOpen, modalMode, closeModal, setUser, openModal, setLoading, isLoading } = useAuthStore();
    const [mode, setMode] = useState(modalMode);

    // 외부에서 mode 변경 시 동기화
    useEffect(() => { setMode(modalMode); }, [modalMode]);

    // Supabase 세션 복원
    useEffect(() => {
        if (!isSupabaseConfigured) return;
        supabase.auth.getSession().then(async ({ data }) => {
            if (data.session?.user) {
                const profile = await fetchProfile(data.session.user.id);
                if (profile) setUser(profile);
            }
        });
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT') setUser(null);
            if (session?.user) {
                const profile = await fetchProfile(session.user.id);
                if (profile) setUser(profile);
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    if (!isModalOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
            <div className="relative bg-card rounded-3xl w-full max-w-md shadow-card-lg animate-slide-up z-10 border border-border overflow-hidden">

                {/* 닫기 */}
                <button onClick={closeModal} className="absolute right-4 top-4 z-10 text-foreground-muted hover:text-foreground bg-background-secondary rounded-full p-1.5 transition-colors">
                    <X size={18} />
                </button>

                {/* 탭 */}
                <div className="flex border-b border-border">
                    {(['login', 'signup'] as const).map((m) => (
                        <button
                            key={m}
                            onClick={() => setMode(m)}
                            className={`flex-1 py-4 text-sm font-bold transition-colors ${mode === m ? 'text-primary border-b-2 border-primary' : 'text-foreground-muted hover:text-foreground'}`}
                        >
                            {m === 'login' ? '로그인' : '회원가입'}
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {mode === 'login'
                        ? <LoginForm onSuccess={closeModal} />
                        : <SignupForm onSuccess={closeModal} />}
                </div>
            </div>
        </div>
    );
};

/* ───────────────────────────────────────────────
   LoginForm
─────────────────────────────────────────────── */
const LoginForm = ({ onSuccess }: { onSuccess: () => void }) => {
    const { setUser, setLoading, isLoading } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await signIn(email, password);
            setUser(user);
            onSuccess();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="text-center mb-2">
                <div className="w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center mx-auto mb-3">
                    <LogIn className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-lg font-extrabold text-foreground">로그인</h2>
                <p className="text-xs text-foreground-muted mt-1">계정에 로그인하여 서비스를 이용하세요</p>
            </div>

            {error && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
            )}

            <InputField icon={<Mail className="w-4 h-4" />} type="email" placeholder="이메일" value={email} onChange={setEmail} required />
            <InputField icon={<Lock className="w-4 h-4" />} type={showPw ? 'text' : 'password'} placeholder="비밀번호" value={password} onChange={setPassword}
                suffix={<button type="button" onClick={() => setShowPw(!showPw)} className="text-foreground-muted hover:text-foreground">{showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>} required />

            <button type="submit" disabled={isLoading}
                className="w-full py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-1">
                {isLoading ? '로그인 중...' : '로그인'}
            </button>

            {!isSupabaseConfigured && (
                <p className="text-center text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                    ⚠️ Supabase 미설정 — .env.local에 키를 입력해주세요
                </p>
            )}
        </form>
    );
};

/* ───────────────────────────────────────────────
   SignupForm
─────────────────────────────────────────────── */
const SignupForm = ({ onSuccess }: { onSuccess: () => void }) => {
    const { setUser, setLoading, isLoading } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [nickname, setNickname] = useState('');
    const [userType] = useState<UserType>('buyer'); // 현재 buyer만 활성화
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPw) { setError('비밀번호가 일치하지 않습니다.'); return; }
        if (password.length < 6) { setError('비밀번호는 6자 이상이어야 합니다.'); return; }
        if (!nickname.trim()) { setError('닉네임을 입력해주세요.'); return; }

        setLoading(true);
        try {
            const user = await signUp(email, password, nickname.trim(), userType);
            setUser(user);
            onSuccess();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="text-center mb-2">
                <div className="w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center mx-auto mb-3">
                    <UserPlus className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-lg font-extrabold text-foreground">회원가입</h2>
                <p className="text-xs text-foreground-muted mt-1">계정을 만들고 서비스를 이용하세요</p>
            </div>

            {error && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
            )}

            <InputField icon={<Mail className="w-4 h-4" />} type="email" placeholder="이메일" value={email} onChange={setEmail} required />
            <InputField icon={<User className="w-4 h-4" />} type="text" placeholder="닉네임" value={nickname} onChange={setNickname} required />
            <InputField icon={<Lock className="w-4 h-4" />} type={showPw ? 'text' : 'password'} placeholder="비밀번호 (6자 이상)" value={password} onChange={setPassword}
                suffix={<button type="button" onClick={() => setShowPw(!showPw)} className="text-foreground-muted hover:text-foreground">{showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>} required />
            <InputField icon={<Lock className="w-4 h-4" />} type={showPw ? 'text' : 'password'} placeholder="비밀번호 확인" value={confirmPw} onChange={setConfirmPw} required />

            {/* 유저 타입 — 현재 buyer만 활성화 */}
            <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 border-primary bg-primary-light cursor-default">
                    <span className="text-sm font-bold text-primary">구매자</span>
                    <span className="ml-auto text-xs text-primary font-medium">선택됨</span>
                </div>
                <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border bg-background-secondary cursor-not-allowed opacity-50">
                    <span className="text-sm font-medium text-foreground-muted">판매자</span>
                    <span className="ml-auto text-xs text-foreground-muted">준비중</span>
                </div>
            </div>

            <button type="submit" disabled={isLoading}
                className="w-full py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-1">
                {isLoading ? '가입 중...' : '회원가입'}
            </button>

            {!isSupabaseConfigured && (
                <p className="text-center text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                    ⚠️ Supabase 미설정 — .env.local에 키를 입력해주세요
                </p>
            )}
        </form>
    );
};

/* ───────────────────────────────────────────────
   InputField 공통 컴포넌트
─────────────────────────────────────────────── */
interface InputFieldProps {
    icon: React.ReactNode;
    type: string;
    placeholder: string;
    value: string;
    onChange: (v: string) => void;
    suffix?: React.ReactNode;
    required?: boolean;
}

const InputField = ({ icon, type, placeholder, value, onChange, suffix, required }: InputFieldProps) => (
    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border bg-background focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
        <span className="text-foreground-muted shrink-0">{icon}</span>
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-foreground-muted outline-none"
        />
        {suffix}
    </div>
);

/* ───────────────────────────────────────────────
   UserAvatarButton — 헤더 로그인 후 표시
─────────────────────────────────────────────── */
export const UserAvatarButton = () => {
    const { user, logout } = useAuthStore();
    const [open, setOpen] = useState(false);

    if (!user) return null;

    const handleLogout = async () => {
        await signOut();
        logout();
        setOpen(false);
    };

    return (
        <div className="relative">
            <button onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:border-primary/40 bg-card transition-colors text-sm font-semibold text-foreground">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                    {user.nickname.charAt(0).toUpperCase()}
                </div>
                {user.nickname}
            </button>
            {open && (
                <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-card-md py-1 w-40 z-50">
                    <div className="px-3 py-2 border-b border-border">
                        <p className="text-xs font-semibold text-foreground">{user.nickname}</p>
                        <p className="text-xs text-foreground-muted truncate">{user.email}</p>
                    </div>
                    <button onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">
                        로그아웃
                    </button>
                </div>
            )}
        </div>
    );
};
