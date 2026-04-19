# 상품권 예약판매 안내 가이드 웹

## 기술 스택
- Next.js 15, React 19, TypeScript, Tailwind CSS, Zustand
- Supabase (Auth + PostgreSQL + Realtime) — 무료 tier
- `@supabase/supabase-js` 설치 시 `--legacy-peer-deps` 플래그 필요

## 로컬 개발
- `npm run dev` — 로컬 개발 서버 (포트 3000)
- **주의**: dev 서버가 멈추면 React hydration이 안 됨 → `npm run dev` 재실행 필요
- dev 서버가 꺼진 상태에서 PM2 정적 서버만 실행되면 JS 번들이 404로 뜸

## 배포 (AWS Ubuntu 환경)
- 로컬 개발 후 `main` 브랜치에 코드를 `git push` 하여 백업 및 전송
- AWS 서버에서 `git pull` 진행 후 아래 과정 순차 실행
  1. `npm install` (신규 패키지 추가 시)
  2. `npm run build` (정적 HTML 파일 `out/` 결과물 신규 생성)
  3. `pm2 restart ticket-guide` (최신 빌드 버전으로 서버 갱신)

## 코드 관리
- main 브랜치로 코드 관리

## 아키텍처
- 클린 아키텍처 (features/ 단위 캡슐화)
- 정적 export (`output: 'export'`) 유지 — Supabase는 클라이언트 전용으로만 사용
- 각 feature: `components.tsx` / `logic.ts` / `store.ts` / `types.ts` 분리

## 환경변수 (.env.local 필요)
```
NEXT_PUBLIC_SUPABASE_URL=https://jegthxwoexzmczzqlorc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```
- 미설정 시 UI에 ⚠️ 경고 표시 (빌드는 통과됨 — placeholder fallback 처리됨)
- `src/lib/supabase.ts`에 `isSupabaseConfigured` 플래그로 guard 처리

## 색상 테마 캡슐화
- **Primary 색상**: 보라 (`#7C3AED`, violet-600) — 2026-04-17 확정
- CSS 변수 `--primary`, `--primary-dark`, `--primary-light`만 바꾸면 전체 테마 전환
- `src/app/globals.css` → CSS 변수 정의
- `tailwind.config.ts` → 변수를 Tailwind 토큰으로 매핑
- 컴포넌트는 `bg-primary`, `text-primary` 등 토큰만 사용 (하드코딩 금지)

## 레이아웃 2가지 모드
- **PC 스케일 모드** (기본): `body.style.zoom`으로 1280px 기준 스케일, 모바일에서도 PC 화면처럼
- **반응형 모드**: 완전 반응형, 모바일 최적화
- 우측 하단 플로팅 토글 버튼으로 전환, `localStorage` 저장
- `src/app/DesktopScaleWrapper.tsx`에서 관리

## Supabase 프로젝트 정보
- 프로젝트 ID: `jegthxwoexzmczzqlorc`
- 리전: 서울 (ap-northeast-2)
- 플랜: Free tier

## Supabase DB 스키마 (전체 생성 완료)
```sql
-- profiles 테이블
CREATE TABLE profiles (
  id        uuid references auth.users PRIMARY KEY,
  user_type text CHECK (user_type IN ('buyer', 'seller')),
  nickname  text,
  created_at timestamp DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- notices 테이블
CREATE TABLE notices (
  id         serial PRIMARY KEY,
  title      text NOT NULL,
  content    text NOT NULL,
  is_pinned  boolean DEFAULT false,
  author_id  uuid references profiles(id),
  created_at timestamp DEFAULT now()
);
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read notices" ON notices FOR SELECT USING (true);

-- chat_rooms 테이블
CREATE TABLE chat_rooms (
  id        serial PRIMARY KEY,
  buyer_id  uuid references profiles(id) ON DELETE CASCADE,
  seller_id uuid references profiles(id) ON DELETE CASCADE,
  created_at timestamp DEFAULT now()
);
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "room_select" ON chat_rooms FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "room_insert" ON chat_rooms FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- chat_messages 테이블
CREATE TABLE chat_messages (
  id         serial PRIMARY KEY,
  room_id    integer references chat_rooms(id) ON DELETE CASCADE,
  sender_id  uuid references profiles(id) ON DELETE CASCADE,
  content    text NOT NULL,
  created_at timestamp DEFAULT now()
);
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "msg_select" ON chat_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM chat_rooms WHERE id = chat_messages.room_id AND (buyer_id = auth.uid() OR seller_id = auth.uid()))
);
CREATE POLICY "msg_insert" ON chat_messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (SELECT 1 FROM chat_rooms WHERE id = chat_messages.room_id AND (buyer_id = auth.uid() OR seller_id = auth.uid()))
);

-- Realtime 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
```

## 주요 파일 구조
```
src/
├── app/
│   ├── layout.tsx              — Header, Footer, AuthModal 포함
│   ├── page.tsx                — 홈 (CompanyListSection만 — 가이드는 공지사항으로 이전)
│   ├── globals.css             — CSS 변수 테마 정의
│   ├── DesktopScaleWrapper.tsx — PC↔반응형 토글 (body.style.zoom 방식)
│   ├── notices/
│   │   └── page.tsx            — 공지사항 (Suspense + NoticesContent) ✅
│   └── chat/
│       └── page.tsx            — 채팅 페이지 ✅
├── features/
│   ├── header/components.tsx   — 헤더 (로고 + 공지사항 + 채팅 nav + 로그인) ✅
│   ├── footer/components.tsx   — 푸터 (3단 컬럼 + 사업자정보) ✅
│   ├── auth/
│   │   ├── components.tsx      — AuthModal, LoginForm, SignupForm, UserAvatarButton ✅
│   │   ├── store.ts            — Zustand auth store ✅
│   │   ├── logic.ts            — signIn/signUp/signOut/fetchProfile ✅
│   │   └── types.ts            — UserProfile, UserType, AuthMode ✅
│   ├── notices/
│   │   ├── components.tsx      — NoticesContent, NoticeList, NoticeRow, NoticeDetail ✅
│   │   ├── logic.ts            — fetchNotices, fetchNotice, formatDate ✅
│   │   └── types.ts            — Notice ✅
│   ├── chat/
│   │   ├── components.tsx      — ChatContent, ChatLayout, MessageView, NewChatModal ✅
│   │   ├── logic.ts            — fetchRooms, getOrCreateRoom, sendMessage, subscribeToMessages ✅
│   │   ├── store.ts            — Zustand chat store ✅
│   │   └── types.ts            — ChatRoom, ChatMessage ✅
│   └── ticket-consulting/      — 업체목록(삽니다) + 팝니다 게시판 + SellPostFormModal ✅
└── lib/
    └── supabase.ts             — Supabase 클라이언트 초기화 ✅
```

## 채팅 기능 사용 방법
- `/chat` 페이지 — 로그인 필수
- `+` 버튼 → 상대방 닉네임 검색 → 대화 시작
- `getOrCreateRoom(buyerId, sellerId)` — 기존 방 있으면 재사용
- Supabase Realtime으로 실시간 메시지 수신 (`subscribeToMessages`)
- 두 계정으로 테스트: 두 브라우저 탭에서 각각 로그인

## 공지사항 관리
- Supabase Studio에서 직접 INSERT로 등록
- `is_pinned = true` 설정 시 목록 상단 고정
- 거래 가이드 3건 고정 공지로 등록 완료 (예약판매란? / 주의사항 / 법적 처벌)
- 기존 `src/features/guide-content/` 폴더 삭제 완료 (공지사항으로 이전)

## 개발 주요 내용
- 기존 참고 사이트 기획 추출 및 반영 완료
- 디자인은 최신 UI / UX를 참고하여 트렌디하게 퀄리티를 유지할 것
- pc / mobile 반응형으로 만들 것
- 전체적으로 캡슐화를 잘 해놓아 추후 변경되어도 수정이 용이하게 만들 것
- 최신 클린 아키텍처를 준수할 것
- 상품권 상담하기 버튼, 문의하기 버튼, 상품권 판매하기 버튼이 클릭되면 네이버 라인 or 카카오 상담으로 연결될 QR 코드를 보여주는 것으로 수정이 용이하도록 구현할 것
- 문서 참조는 notbookLM MCP를 활용할 것
- UI 크롤링/분석 시 `mcp__gemini__analyze_media`로 스크린샷 분석 가능 (Claude 사용량 절감)

## 추가 개발 요구사항 (원본)
- https://www.ticketsoc.com/ 사이트 참고
- 밝은 색 테마, primary는 초록 아닌 다른 색 (→ 보라색 확정)
- 업체 조회 TOP 제외, 실시간 거래 체결 제외
- 레이아웃 2가지 버전 (반응형 / PC스케일)
- 업체목록 로테이션 유지, 이미지를 카드 배경으로
- Footer 참고사이트처럼
- 로그인: 구매자/판매자 구분, 현재는 구매자만 가입
- 채팅: 1:1 채팅 (업체↔사용자)
- 공지사항 게시판
- 최대한 무료 서비스 활용

## sell_posts DB 스키마 (생성 완료)
```sql
CREATE TABLE sell_posts (
  id serial PRIMARY KEY,
  author_id uuid references profiles(id) ON DELETE CASCADE,
  ticket_type text NOT NULL,
  title text NOT NULL,
  content text,
  sell_price integer,
  original_price integer,
  is_price_negotiable boolean DEFAULT false,
  delivery_deadline text NOT NULL,
  tags text[] DEFAULT '{}',
  status text DEFAULT '판매중' CHECK (status IN ('판매중', '판매완료')),
  created_at timestamp DEFAULT now()
);
```
- RLS: 전체 읽기 허용 / 작성자 본인만 INSERT·UPDATE·DELETE
- `fetchSellPostsFromDB`: Supabase 조회, 실패 시 더미 데이터 fallback
- `SellPostFormModal`: 상품권 종류/제목/가격(협의 선택)/발송기한/태그/내용 입력 폼
- 작성 후 목록 자동 새로고침

## 남은 작업 (미구현)
- **AWS 배포** — `.env.local` 서버에 생성 후 `npm run build` + `pm2 restart` 필요
