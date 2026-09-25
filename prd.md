# RemoteLink

## Minimal-Click Android-to-Android Remote Support System

### 1. Product Overview

**Product Name:** RemoteLink
**Platform:** Android
**Primary Language:** Kotlin
**UI:** Jetpack Compose + Material 3
**Backend:** Node.js + TypeScript
**Database:** MongoDB
**ODM:** Mongoose
**Real-Time Communication:** WebRTC + WebSocket

RemoteLink is a secure, minimal-click Android remote-support application that allows one user to provide technical assistance to another Android device.

The product is inspired by the simplicity of Chrome Remote Desktop but is designed specifically for Android-to-Android remote support.

The primary experience should be:

**Pair once → Remember device → Connect → Remote user approves → Remote session**

Remote access must always require explicit user consent.

---

# 2. Product Goals

The application should provide:

* Minimal-click remote support
* QR-based pairing
* Trusted-device management
* Live Android screen sharing
* Low-latency WebRTC communication
* Supported remote interaction
* Secure authentication
* Session expiration
* Reconnection handling
* Visible active-session status
* Easy session termination
* Modern professional UI

The application must work with Android's security model rather than attempting to bypass it.

---

# 3. User Roles

## 3.1 Controller

The controller is the person providing remote assistance.

Capabilities:

* Add remote devices
* Scan pairing QR
* Connect to trusted devices
* View remote screen
* Send supported interaction events
* Disconnect sessions
* View connection status
* View session duration

## 3.2 Remote Device

The remote device is the phone receiving assistance.

Capabilities:

* Start support mode
* Generate pairing QR
* Approve/reject connection requests
* Grant screen-sharing permission
* Enable required accessibility capability
* View active remote session
* Stop sharing
* Revoke access

---

# 4. Core User Experience

## First-Time Pairing

```text
Install App
     ↓
Open RemoteLink
     ↓
Start Support
     ↓
Grant Android permissions
     ↓
QR Code displayed
     ↓
Controller scans QR
     ↓
Remote user approves
     ↓
Secure connection
     ↓
Remote session
```

## Returning User

```text
Open App
     ↓
Select trusted device
     ↓
Connect
     ↓
Remote user approves
     ↓
Remote session
```

The goal is to minimize unnecessary taps.

---

# 5. Core Screens

The application should contain:

1. Splash Screen
2. Welcome Screen
3. Home Screen
4. Add Device
5. QR Scanner
6. Pairing Screen
7. Permission Setup
8. Connection Request
9. Waiting for Approval
10. Remote Session
11. Session Ended
12. Trusted Devices
13. Device Details
14. Settings
15. Privacy
16. Security
17. Offline/Error State

---

# 6. Home Screen

The home screen should immediately show trusted devices.

Example:

```text
RemoteLink

Your Devices

┌──────────────────────────┐
│ Rahul's Phone            │
│ 🟢 Available             │
│                          │
│       CONNECT            │
└──────────────────────────┘

+ Add Device
```

If there are no devices:

```text
No devices connected

Connect to a phone to
start remote support.

[ Scan QR ]
```

---

# 7. QR Pairing

QR pairing should be the primary onboarding mechanism.

### Remote Device

```text
Start Support
      ↓
Create pairing session
      ↓
Generate short-lived QR
      ↓
Wait for controller
```

### Controller

```text
Scan QR
      ↓
Join pairing session
      ↓
Request connection
```

### Remote Device

```text
Remote Support Request

Khushi wants to connect.

[ Allow ]     [ Reject ]
```

Only after the user presses **Allow** should the remote session proceed.

---

# 8. QR Security

QR codes must contain only short-lived pairing information.

Example:

```json
{
  "version": 1,
  "pairingId": "short-lived-id",
  "token": "short-lived-token"
}
```

Do not store inside the QR:

* Passwords
* Private keys
* Permanent authentication tokens
* Personal information

Default pairing expiration:

**5 minutes**

Expired pairing tokens must be rejected.

---

# 9. Remote Session

Controller interface:

```text
┌──────────────────────────────┐
│ ← Rahul's Phone       🟢     │
│                              │
│                              │
│       REMOTE SCREEN          │
│                              │
│                              │
│                              │
├──────────────────────────────┤
│ Connected       08:42        │
│                              │
│       [ Disconnect ]         │
└──────────────────────────────┘
```

Remote device:

```text
Remote Support Active

Connected to:
Khushi's Device

Session: 08:42

[ STOP SHARING ]
```

The remote user must always know that a remote session is active.

---

# 10. Technology Architecture

```text
                Controller Android
                       │
                       │ HTTPS/WSS
                       ▼
              ┌──────────────────┐
              │ Backend Server   │
              │ Node.js          │
              │ TypeScript       │
              │ WebSocket        │
              └────────┬─────────┘
                       │
                       ▼
                 MongoDB Atlas
                       │
                       │
                Session Metadata
                Device Metadata
                Pairing Metadata
                       │
                       │
                       ▼
                Remote Android
```

For live screen media:

```text
Controller Android
        ▲
        │
        │ WebRTC
        │
        ▼
Remote Android
```

The backend should not store or relay screen frames through MongoDB.

---

# 11. Technology Stack

## Android

* Kotlin
* Jetpack Compose
* Material 3
* AndroidX
* Coroutines
* ViewModel
* StateFlow
* Navigation Compose
* DataStore
* OkHttp
* WebSocket
* WebRTC
* MediaProjection
* AccessibilityService
* Android Keystore

## Backend

* Node.js
* TypeScript
* Express
* WebSocket
* Mongoose
* Zod
* JWT/session authentication
* Helmet
* CORS

## Database

**MongoDB**

Development:

**Local MongoDB / Docker**

Production:

**MongoDB Atlas**

---

# 12. MongoDB Architecture

MongoDB is responsible for persistent application metadata.

MongoDB stores:

* Users
* Devices
* Trusted devices
* Pairing sessions
* Remote sessions
* Security/session state

MongoDB does NOT store:

* Live screen frames
* WebRTC media
* Raw passwords
* Private keys
* Screen recordings by default

---

# 13. MongoDB Collections

## users

Example document:

```json
{
  "_id": "ObjectId",
  "email": "user@example.com",
  "passwordHash": "...",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

Passwords must never be stored as plaintext.

---

## devices

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "deviceName": "Rahul's Phone",
  "devicePublicKey": "...",
  "platform": "android",
  "appVersion": "1.0.0",
  "lastSeenAt": "Date",
  "isOnline": true,
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

## trustedDevices

```json
{
  "_id": "ObjectId",
  "ownerDeviceId": "ObjectId",
  "remoteDeviceId": "ObjectId",
  "createdAt": "Date",
  "revokedAt": null,
  "updatedAt": "Date"
}
```

---

## pairingSessions

```json
{
  "_id": "ObjectId",
  "pairingId": "short-id",
  "tokenHash": "...",
  "controllerDeviceId": "ObjectId",
  "remoteDeviceId": "ObjectId",
  "status": "WAITING",
  "expiresAt": "Date",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

Use a MongoDB TTL index on `expiresAt`.

---

## remoteSessions

```json
{
  "_id": "ObjectId",
  "sessionId": "session-id",
  "controllerDeviceId": "ObjectId",
  "remoteDeviceId": "ObjectId",
  "status": "CONNECTED",
  "startedAt": "Date",
  "endedAt": null,
  "expiresAt": "Date",
  "terminationReason": null,
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

# 14. MongoDB Indexes

Create appropriate indexes for:

### Users

```text
email: unique
```

### Devices

```text
userId
devicePublicKey
```

### Pairing Sessions

```text
pairingId: unique
expiresAt: TTL
controllerDeviceId
remoteDeviceId
```

### Remote Sessions

```text
sessionId: unique
controllerDeviceId
remoteDeviceId
status
expiresAt
```

### Trusted Devices

```text
ownerDeviceId
remoteDeviceId
```

Avoid unnecessary indexes.

---

# 15. Backend Architecture

Use:

```text
backend/
├── src/
│   ├── config/
│   │   └── database.ts
│   │
│   ├── models/
│   │   ├── User.ts
│   │   ├── Device.ts
│   │   ├── TrustedDevice.ts
│   │   ├── PairingSession.ts
│   │   └── RemoteSession.ts
│   │
│   ├── services/
│   │   ├── user.service.ts
│   │   ├── device.service.ts
│   │   ├── pairing.service.ts
│   │   └── session.service.ts
│   │
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── websocket/
│   ├── auth/
│   └── utils/
│
├── tests/
├── package.json
└── .env.example
```

Use:

```text
Controller
    ↓
Service
    ↓
Mongoose Model
    ↓
MongoDB
```

Do not put MongoDB queries directly into UI or controller logic unnecessarily.

---

# 16. Database Connection

Backend environment:

```env
MONGODB_URI=mongodb://localhost:27017/remotelink
```

Production:

```env
MONGODB_URI=mongodb+srv://...
```

Create:

```text
src/config/database.ts
```

Requirements:

* Connection retry handling
* Connection timeout
* Graceful shutdown
* Error handling
* No credential logging

Backend startup:

```text
Load environment
      ↓
Connect MongoDB
      ↓
Verify connection
      ↓
Start HTTP server
      ↓
Start WebSocket server
```

---

# 17. API

Create:

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout

GET  /api/devices
POST /api/devices/register
DELETE /api/devices/:id

POST /api/pairing/create
POST /api/pairing/join
POST /api/pairing/approve
POST /api/pairing/reject

GET  /api/sessions
POST /api/sessions/create
POST /api/sessions/:id/end

GET  /api/trusted-devices
DELETE /api/trusted-devices/:id

GET /api/health
```

Use Zod for request validation.

---

# 18. WebSocket Signaling

Events:

```text
AUTH

DEVICE_ONLINE
DEVICE_OFFLINE

PAIR_REQUEST
PAIR_APPROVED
PAIR_REJECTED

SESSION_REQUEST
SESSION_APPROVED
SESSION_REJECTED

SDP_OFFER
SDP_ANSWER
ICE_CANDIDATE

SESSION_STARTED
SESSION_ENDED
SESSION_EXPIRED
```

All events must be authenticated and authorized.

---

# 19. WebRTC

WebRTC handles:

* Live screen video
* Low-latency communication
* DataChannel
* Remote interaction events

Connection:

```text
Controller
   ↓
SDP Offer
   ↓
Signaling Server
   ↓
Remote Device
   ↓
SDP Answer
   ↓
ICE Candidates
   ↓
WebRTC
```

Use STUN/TURN infrastructure.

TURN credentials must come from environment configuration.

---

# 20. Screen Sharing

Use:

**Android MediaProjection API**

Flow:

```text
User
 ↓
Start Support
 ↓
Android MediaProjection consent
 ↓
User approves
 ↓
Foreground service
 ↓
Virtual Display
 ↓
Video stream
 ↓
WebRTC
```

Release resources on disconnect.

---

# 21. Remote Interaction

Use:

**Android AccessibilityService**

Supported actions where Android permits:

* Tap
* Long press
* Swipe
* Back
* Home
* Recent Apps
* Supported text input

Use WebRTC DataChannel for events.

Example:

```json
{
  "type": "tap",
  "x": 0.50,
  "y": 0.42
}
```

Coordinates should be normalized from 0.0 to 1.0.

---

# 22. Security Requirements

Implement:

* HTTPS
* WSS
* WebRTC encryption
* Short-lived pairing tokens
* Session expiration
* Authentication
* Authorization
* Android Keystore
* Token revocation
* Trusted-device revocation
* Input validation
* Rate limiting
* Secure logging

Never log:

* Passwords
* JWTs
* Private keys
* Pairing tokens
* TURN credentials
* Sensitive screen information

---

# 23. Session Management

Default maximum session:

**30 minutes**

MongoDB should store:

```text
startedAt
expiresAt
endedAt
status
terminationReason
```

Session states:

```text
IDLE
PAIRING
WAITING_FOR_APPROVAL
CONNECTING
CONNECTED
RECONNECTING
DISCONNECTED
REJECTED
EXPIRED
ERROR
```

When session ends:

```text
RemoteSession.status = ENDED
RemoteSession.endedAt = current time
```

Invalidate session credentials.

---

# 24. Trusted Devices

Once pairing is successfully completed, the user may save the device.

Home:

```text
Trusted Devices

Rahul's Phone
🟢 Available

[ CONNECT ]
```

Support:

* Rename
* Connect
* Remove
* Revoke
* Last seen
* Online status

Revocation must prevent future remote sessions.

---

# 25. Permission UX

Explain each permission before requesting it.

Example:

```text
Screen Sharing

RemoteLink needs Android's
screen-sharing permission to
show your screen to the helper.

[ Continue ]
```

Then launch the official Android permission flow.

Do not simulate or bypass Android permissions.

---

# 26. Privacy

Default behavior:

* No screen recording
* No microphone
* No camera
* No contacts
* No file access
* No unnecessary tracking

MongoDB should only contain required application metadata.

---

# 27. Network Reliability

Handle:

* Wi-Fi changes
* Mobile data changes
* Temporary Internet loss
* WebSocket disconnect
* ICE failure
* Remote app backgrounding

Implement bounded exponential reconnect.

Example:

```text
1 sec
2 sec
4 sec
8 sec
16 sec
```

Then show:

```text
Connection lost

[ Retry ]
```

---

# 28. UI/UX Requirements

Design:

**Minimal + Professional + Modern**

Use:

* Material 3
* Light theme default
* Dark theme
* Rounded cards
* Clear typography
* Large primary CTA
* Clear online/offline status
* Smooth subtle animation
* Responsive layouts

The main user should not need to understand WebRTC, MediaProjection, MongoDB, or AccessibilityService.

---

# 29. Testing

Android:

```bash
./gradlew test
./gradlew lint
./gradlew assembleDebug
```

Backend:

```bash
npm test
npm run build
npm run lint
```

MongoDB tests:

* User creation
* Device creation
* Device lookup
* Pairing creation
* Pairing expiration
* Pair approval
* Pair rejection
* Trusted device creation
* Trusted device revocation
* Session creation
* Session expiration
* Session termination

---

# 30. End-to-End Test

Test two physical/emulated Android devices.

```text
Phone A
 ↓
Open RemoteLink
 ↓
Scan QR
 ↓
Phone B
 ↓
Approve
 ↓
WebRTC connection
 ↓
Screen visible
 ↓
Supported interaction
 ↓
Disconnect
 ↓
MongoDB updated
```

Verify MongoDB contains the correct session state.

---

# 31. Development Phases

## Phase 1 — Foundation

Build:

* Android project
* Compose UI
* Navigation
* Backend
* MongoDB
* Environment configuration

## Phase 2 — Authentication

Build:

* Registration
* Login
* Device registration
* Secure token management

## Phase 3 — Pairing

Build:

* QR generation
* QR scanning
* Pairing sessions
* MongoDB pairing collection
* Approval/rejection

## Phase 4 — WebSocket

Build:

* Authenticated WebSocket
* Signaling events
* Device online/offline

## Phase 5 — WebRTC

Build:

* PeerConnection
* SDP
* ICE
* STUN/TURN
* DataChannel

## Phase 6 — Screen Sharing

Build:

* MediaProjection
* Foreground service
* Video track
* Remote renderer

## Phase 7 — Remote Interaction

Build:

* AccessibilityService
* Tap
* Long press
* Swipe
* Back
* Home
* Recent apps

## Phase 8 — Trusted Devices

Build:

* Saved devices
* Device removal
* Revocation
* Reconnect

## Phase 9 — Reliability

Build:

* Network switching
* Reconnection
* Session expiration
* Error handling

## Phase 10 — Security

Review:

* Authentication
* Authorization
* Token security
* MongoDB access
* WebSocket security
* WebRTC security
* Android permissions

## Phase 11 — Final UI

Polish:

* Animations
* Empty states
* Loading states
* Error states
* Dark mode
* Accessibility

## Phase 12 — Release

Build:

* Debug APK
* Release APK
* Production backend configuration
* MongoDB Atlas configuration

---

# 32. Local Development

Use Docker MongoDB.

Start:

```bash
docker compose up -d
```

Backend:

```bash
cd backend
npm install
npm run dev
```

Android:

```bash
cd android
./gradlew assembleDebug
```

Install:

```bash
adb devices
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

---

# 33. Environment Variables

Create:

```text
backend/.env.example
```

```env
NODE_ENV=development
PORT=5000

MONGODB_URI=mongodb://localhost:27017/remotelink

JWT_SECRET=
SESSION_SECRET=

CORS_ORIGIN=

STUN_SERVER=
TURN_SERVER=
TURN_USERNAME=
TURN_PASSWORD=
```

Production:

```env
MONGODB_URI=mongodb+srv://...
```

Never commit `.env`.

---

# 34. MongoDB Atlas Production

Production should use MongoDB Atlas.

Document:

1. Create Atlas cluster.
2. Create database user.
3. Configure network access.
4. Copy connection string.
5. Store connection string in backend environment variables.
6. Verify backend connection.
7. Create required indexes.
8. Enable monitoring/backups according to deployment requirements.

Do not expose MongoDB directly to Android clients.

Only the backend communicates with MongoDB.

---

# 35. Project Structure

Final repository:

```text
RemoteLink/
│
├── android/
│   ├── app/
│   ├── gradle/
│   ├── build.gradle.kts
│   └── settings.gradle.kts
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── models/
│   │   ├── services/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── websocket/
│   │   ├── auth/
│   │   └── utils/
│   │
│   ├── tests/
│   ├── package.json
│   └── .env.example
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── DATABASE.md
│   ├── SECURITY.md
│   ├── WEBRTC.md
│   ├── TESTING.md
│   └── TROUBLESHOOTING.md
│
├── scripts/
├── docker-compose.yml
├── README.md
└── .gitignore
```

---

# 36. Definition of Done

The MVP is complete when:

* Two Android devices can pair using QR.
* MongoDB stores device/pairing/session metadata.
* Devices can be remembered.
* Remote user explicitly approves every remote session.
* Screen sharing works using MediaProjection.
* WebRTC connection works.
* Supported remote interactions work through authorized Android APIs.
* Session can be stopped from either device.
* Active remote session is visible.
* Sessions expire.
* Pairing tokens expire.
* Trusted devices can be revoked.
* Network reconnection works.
* Backend tests pass.
* Android tests pass.
* MongoDB indexes are configured.
* No secrets are hard-coded.
* No sensitive credentials are logged.
* Debug APK builds successfully.

---

# 37. Final Product Experience

The final product should feel like:

**Open → Connect → Approve → Done**

The controller should see trusted devices immediately.

The remote user should clearly understand:

**Who is connecting + what is being shared + how to stop it.**

Primary priorities:

**Security → Consent → Reliability → Low Latency → Minimal Clicks → UI Quality**

The final system must be a functioning, maintainable, secure, consent-based Android remote-support application using:

**Kotlin + Jetpack Compose + WebRTC + MediaProjection + AccessibilityService + Node.js + TypeScript + WebSocket + MongoDB + Mongoose.**
