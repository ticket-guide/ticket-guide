# 개발 Todo 리스트: 상품권 예약판매 안내 가이드 웹

> 기준일: 2026-04-17 | 참고: https://www.ticketsoc.com/

---

## Phase 1 — UI 전면 개편 ✅ 완료

- [x] **색상 테마 변경** — 보라(`#7C3AED`) primary, 밝은 흰색 배경
  - `src/app/globals.css` CSS 변수 정의 (--primary, --primary-dark, --primary-light)
  - `tailwind.config.ts` Tailwind 토큰 매핑
- [x] **Header 신규 구현** — `src/features/header/components.tsx`
  - 로고 + 공지사항 링크 + 로그인/회원가입 버튼
  - 모바일 햄버거 메뉴
  - 로그인 상태: UserAvatarButton 표시
- [x] **Footer 신규 구현** — `src/features/footer/components.tsx`
  - 3단 컬럼: 서비스 소개 | 이용안내 | 약관 및 정책
  - 사업자 정보 + 저작권
- [x] **레이아웃 2가지 모드** — `src/app/DesktopScaleWrapper.tsx`
  - PC 스케일 모드 (기본, 1280px 고정)
  - 반응형 모드 (완전 반응형)
  - 우측 하단 플로팅 토글 버튼, localStorage 저장
- [x] **업체 카드 스타일 개편** — `src/features/ticket-consulting/components.tsx`
  - 어두운 배경 + 업체 이미지를 `bg-contain`으로 카드 배경 사용
  - 그라디언트 오버레이로 텍스트 가독성 확보
  - 10초 자동 로테이션 유지 (삽니다 탭에서만)
- [x] **삽니다/팝니다 탭 구분**
  - 삽니다: 업체 카드 그리드 뷰
  - 팝니다: 게시판 리스트 뷰 (종류/제목/가격/날짜 컬럼)
  - 더미 판매 게시글 5개 포함
- [x] **layout.tsx 업데이트** — Header, Footer, AuthModal 통합

---

## Phase 2 — 로그인 / 회원가입 ✅ 완료

- [x] `src/lib/supabase.ts` — Supabase 클라이언트 초기화
- [x] `src/features/auth/types.ts` — UserProfile, UserType, AuthMode
- [x] `src/features/auth/store.ts` — Zustand auth store
- [x] `src/features/auth/logic.ts` — signIn, signUp, signOut, fetchProfile
- [x] `src/features/auth/components.tsx` — AuthModal, LoginForm, SignupForm, UserAvatarButton
- [x] `.env.local` — Supabase URL/ANON_KEY 설정 완료
- [x] Supabase 프로젝트 생성 (`jegthxwoexzmczzqlorc`, 서울, Free)
- [x] profiles 테이블 + RLS 정책 생성 완료
- [x] 로그인/회원가입 실제 동작 확인

---

## Phase 3 — 공지사항 게시판 ✅ 완료

- [x] notices 테이블 + RLS(공개 읽기) 정책 생성 완료
- [x] `src/features/notices/types.ts` — Notice 타입
- [x] `src/features/notices/logic.ts` — fetchNotices, fetchNotice, formatDate
- [x] `src/features/notices/components.tsx` — NoticesContent, NoticeList, NoticeRow, NoticeDetail
  - 목록: 고정 공지 상단, 공지/일반 뱃지, PC/모바일 레이아웃
  - 상세: `?id=N` 쿼리 파라미터 라우팅 (정적 export 호환)
  - 로딩/에러/빈 상태 처리
- [x] `src/app/notices/page.tsx` — Suspense 래퍼 포함
- [x] 샘플 공지 3건 삽입 후 실제 동작 확인

---

## Phase 4 — 1:1 채팅 ✅ 완료

- [x] chat_rooms + chat_messages 테이블 생성 완료
- [x] RLS 정책 생성 완료
  - chat_rooms: 본인이 참여한 방만 조회/생성 가능
  - chat_messages: 방 참여자만 읽기/쓰기 가능
- [x] Supabase Realtime 활성화 (`ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages`)
- [x] `src/features/chat/types.ts` — ChatRoom, ChatMessage 타입
- [x] `src/features/chat/logic.ts` — fetchRooms, getOrCreateRoom, fetchMessages, sendMessage, subscribeToMessages, findUserByNickname, formatChatTime
- [x] `src/features/chat/store.ts` — Zustand chat store (rooms, activeRoomId, messages, loading/sending 상태)
- [x] `src/features/chat/components.tsx`
  - ChatContent: 로그인 여부 분기
  - ChatLayout: 사이드바(대화목록) + 메시지뷰 레이아웃
  - RoomItem: 채팅방 목록 아이템
  - MessageView: 메시지 목록 + 입력창 + Realtime 구독
  - NewChatModal: 닉네임으로 사용자 검색 후 대화 시작
- [x] `src/app/chat/page.tsx` — 채팅 메인 페이지
- [x] Header에 채팅 링크 추가 (공지사항과 함께 nav에 표시)

---

## 기타 개선 사항 (완료)

- [x] **가이드 → 공지사항 이전** — `guide-content` 폴더 삭제, 홈에서 제거
  - 예약판매란? / 주의사항 및 리스크 / 법적 처벌 안내 → Supabase 고정 공지 3건으로 등록
  - 홈은 업체 목록(삽니다/팝니다)에만 집중

## 나머지 작업

- [x] **글쓰기 기능** — 팝니다 탭 글쓰기 버튼 + `SellPostFormModal` + `sell_posts` DB 연동
  - `sell_posts` 테이블 + RLS 정책 생성 완료
  - `SellPostFormModal`: 상품권 종류/제목/가격/발송기한/태그/내용 폼
  - `fetchSellPostsFromDB` + `createSellPost` logic 구현
  - 작성 후 목록 자동 새로고침
- [ ] **AWS 배포 업데이트** — 환경변수 적용 후 서버에 배포
  - `.env.local` AWS 서버에도 생성 필요
  - 정적 export 유지이므로 `next build` → `out/` 결과물 사용

---

## 아키텍처 요약

```
[Next.js 15 — 정적 export (out/)]
  └── 클라이언트에서 직접 Supabase 호출
        ├── Auth (로그인/회원가입/세션)
        ├── DB (profiles, notices, chat_rooms, chat_messages)
        └── Realtime (채팅 실시간)

[AWS Ubuntu + PM2]
  └── 정적 파일 서빙 (변경 없음)

[Supabase 무료 tier]
  ├── DB 500MB
  ├── Auth 50,000명
  └── Realtime 200 동시접속
```
