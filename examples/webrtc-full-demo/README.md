# WebRTC Full Demo with PeerJS

1:1 WebRTC 통신 예제 - 비디오/오디오 통화, 화이트보드 공유, 텍스트 채팅 기능을 포함한 완전한 웹앱입니다.

## 기능

- 1:1 비디오/오디오 통화
- 실시간 화이트보드 공유 (그리기, 지우기, 색상 변경)
- 텍스트 채팅
- 온라인 사용자 목록
- 반응형 UI

## 기술 스택

- **서버**: Node.js, Express, PeerJS Server
- **클라이언트**: React, PeerJS Client, Vite

## 설치 및 실행

### 1. 서버 실행

```bash
cd server
npm install
npm start
```

서버는 다음 포트에서 실행됩니다:
- Express API: http://localhost:3001
- PeerJS Server: http://localhost:9000

### 2. 클라이언트 실행

새 터미널을 열고:

```bash
cd client
npm install
npm start
```

클라이언트는 http://localhost:3000 에서 실행됩니다.

## 사용 방법

1. 브라우저에서 http://localhost:3000 을 엽니다
2. 이름을 입력하고 "Join" 버튼을 클릭합니다
3. 다른 브라우저 탭/창에서 같은 과정을 반복합니다
4. 온라인 사용자 목록에서 상대방을 클릭하거나, Peer ID를 입력하여 연결합니다
5. 연결 후 다음 기능들을 사용할 수 있습니다:
   - **Video Call**: Start Call 버튼으로 영상통화 시작
   - **Whiteboard**: 실시간으로 그림을 그리고 공유
   - **Chat**: 텍스트 메시지 주고받기

## 프로젝트 구조

```
webrtc-full-demo/
├── server/
│   ├── package.json
│   └── server.js          # Express + PeerJS 서버
├── client/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx        # 메인 앱 컴포넌트
│       ├── App.css
│       ├── index.css
│       └── components/
│           ├── VideoCall.jsx     # 비디오 통화 컴포넌트
│           ├── VideoCall.css
│           ├── TextChat.jsx      # 텍스트 채팅 컴포넌트
│           ├── TextChat.css
│           ├── Whiteboard.jsx    # 화이트보드 컴포넌트
│           ├── Whiteboard.css
│           ├── UserList.jsx      # 사용자 목록 컴포넌트
│           └── UserList.css
└── README.md
```

## 주요 기능 설명

### PeerJS 연결
- 각 사용자는 고유한 Peer ID를 자동으로 부여받습니다
- 사용자 목록에서 클릭하거나 Peer ID를 직접 입력하여 연결할 수 있습니다

### 비디오/오디오 통화
- WebRTC를 통한 P2P 실시간 영상/음성 통화
- 로컬 및 원격 비디오 스트림 표시

### 화이트보드
- 실시간 그리기 동기화
- 펜/지우개 도구
- 색상 및 선 굵기 조절
- 캔버스 저장 기능

### 텍스트 채팅
- 실시간 메시지 전송
- 타임스탬프 표시
- 송신/수신 메시지 구분

## 개발 모드

서버 개발 모드 (nodemon 사용):
```bash
cd server
npm run dev
```

## 브라우저 호환성

- Chrome/Edge (권장)
- Firefox
- Safari

WebRTC와 미디어 장치 접근을 지원하는 최신 브라우저가 필요합니다.

## 문제 해결

- **카메라/마이크 권한**: 브라우저에서 카메라와 마이크 접근 권한을 허용해야 합니다
- **로컬 테스트**: 같은 컴퓨터에서 테스트할 때는 다른 브라우저나 시크릿 모드를 사용하세요
- **연결 실패**: 방화벽이나 네트워크 설정을 확인하세요