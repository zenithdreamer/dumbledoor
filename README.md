# DumbleDoor

> Final project for the **Web Service Development and Service-Oriented Architecture** course.

DumbleDoor is a role-based access control system built around a Minecraft server. It exposes a web-based administration dashboard and a suite of backend microservices that together govern which players may open which in-game doors. Physical door actuation is performed by a Spigot plugin that reads access cards, communicates with the backend over HTTP and MQTT, and manipulates Minecraft blocks to represent locked and unlocked states.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Repository Structure](#repository-structure)
- [Services](#services)
  - [User Service](#user-service-port-4000)
  - [Access Service](#access-service-port-4001)
  - [Door Service](#door-service-port-4002)
  - [Log Service](#log-service-port-4003)
  - [Card Service](#card-service-port-4004)
  - [MQTT Service](#mqtt-service-port-4005)
  - [Alarm Service](#alarm-service-port-4006)
  - [Button Service](#button-service-port-4007)
  - [Notification Service](#notification-service-port-4008)
  - [Frontend (Next.js)](#frontend-nextjs)
- [Minecraft Plugin](#minecraft-plugin)
- [Messaging](#messaging)
- [Shared Packages](#shared-packages)
- [Data Flow](#data-flow)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Access Levels](#access-levels)

---

## Overview

DumbleDoor maps real access-control concepts (cards, roles, access levels, alarms) onto a Minecraft world. Administrators manage everything through a Next.js dashboard: they create doors, assign access levels, issue virtual keycards, define roles, and attach users to those roles. The Minecraft plugin enforces these policies in real time by intercepting in-game events, querying the backend, and executing block-manipulation actions to unlock or lock a door.

**Why Minecraft instead of physical hardware?** A real access-control system requires card readers, electric door strikes, and embedded controllers, all of which are expensive, environment-dependent, and difficult to set up in an academic context. Minecraft serves as a fully controllable simulation layer: doors, card readers, alarms, and exit switches are all represented as in-game blocks, and the Spigot plugin exposes the same integration surface (MQTT commands, HTTP callbacks) that a real IoT device would. This means the entire service architecture (microservices, message brokers, MQTT, the admin dashboard) is exercised end-to-end without any physical dependencies.

Key characteristics:

- **Microservice architecture** - nine independent backend services, each with its own database schema, communicating over tRPC (internal HTTP), RabbitMQ (async events), and MQTT (IoT commands).
- **Role-based access control** - users are assigned roles; roles are mapped to doors with a required access level; cards carry an access level that is compared at runtime.
- **Minecraft-native interaction** - players interact by dropping a keycard item into a hopper (the reader block) or by right-clicking an exit switch; the plugin validates the action and manipulates redstone-compatible blocks.
- **Alarm subsystem** - dedicated alarm entities can be triggered or reset from the dashboard or internally, with corresponding in-world responses.
- **Audit logging** - all significant actions are asynchronously recorded via RabbitMQ to a centralised log service.
- **Discord notifications** - a notification service dispatches webhook messages to a configured Discord channel on important events.

---

## Architecture

```mermaid
graph LR
    UI["Next.js Dashboard"]
    PLUGIN["Minecraft Plugin"]

    subgraph svc["Microservices"]
        direction TB
        USER["User"]
        ACCESS["Access"]
        DOOR["Door"]
        CARD["Card"]
        ALARM["Alarm"]
        MQTT_SVC["MQTT"]
        BUTTON["Button"]
        LOG["Log"]
        NOTI["Notification"]
    end

    MQ(["RabbitMQ"])
    BROKER(["Mosquitto MQTT"])

    UI -->|tRPC| USER & ACCESS & DOOR & CARD & ALARM

    PLUGIN -->|HTTP requestLock| DOOR
    DOOR -->|tRPC| CARD & ACCESS & USER & NOTI & ALARM

    CARD -.->|tRPC| ACCESS & USER & NOTI

    PLUGIN -->|HTTP triggerButton| BUTTON

    DOOR & CARD -->|log.create| MQ
    USER -->|user-access.create| MQ
    MQ -->|subscribe| LOG
    MQ -->|subscribe| ACCESS

    ALARM -->|tRPC| MQTT_SVC
    MQTT_SVC -->|publish| BROKER
    BROKER -->|subscribe| PLUGIN
```

Each service owns its own database schema within a shared PostgreSQL instance. Synchronous inter-service calls use tRPC over HTTP secured with an `INTERNAL_API_SECRET` header (solid lines). Dashed lines indicate secondary internal calls, such as admin permission checks. Asynchronous events travel over RabbitMQ: log entries are published by Door and Card services and consumed by Log, while User publishes provisioning and update events consumed by Access. The Minecraft plugin is the entry point for card scans, calling Door via HTTP; Door then orchestrates the full access check by calling Card, Access, User, Noti, and Alarm internally. MQTT is used for alarm actuation between the MQTT service and the plugin.

---

## Repository Structure

This is a pnpm + Turborepo monorepo with three pnpm workspace groups and one standalone project:

- **`apps/`** - Runnable services: nine Express/tRPC backend services (`user`, `access`, `door`, `log`, `card`, `mqtt`, `alarm`, `button`, `noti`) and the `nextjs` admin dashboard.
- **`packages/`** - Shared library code consumed by the apps. Each stateful backend service has a corresponding `{name}-api` package containing its tRPC routers and business logic, and a `{name}-db` package containing its Prisma schema. Stateless services (button, mqtt, noti) have only an `-api` package. Additional packages cover shared auth (`auth`), validation schemas (`validators`), and UI components (`ui`).
- **`plugin/`** - The Spigot Minecraft plugin, built separately with Maven. Not a pnpm workspace member.
- **`tooling/`** - Shared ESLint, GitHub, Prettier, Tailwind, and TypeScript configurations extended by all packages.

---

## Services

All backend services are built with the same stack: **Node.js**, **Express**, **tRPC**, **Prisma**, and **Zod**. Most services expose two tRPC routers: a public/admin router consumed by the frontend and an internal router consumed by peer services. Some services only expose one (e.g. the log service has no internal router, and the MQTT service has no public router). Each service is independently deployable; the ports listed below are the local development defaults defined in `.env.example` and are not fixed in production.

### User Service

Manages user accounts and authentication.

- **Sign-in** - accepts username and password, verifies the hash with argon2, and returns a signed JWT.
- **Admin bootstrap** - on startup the service ensures a default administrator account exists.
- **Database** - single `User` table with fields: `id`, `username`, `first_name`, `last_name`, `password` (argon2 hash), `created_at`, `updated_at`.

### Access Service

Manages roles and the mapping between users, roles, and doors.

- **Roles** - full CRUD for named roles.
- **Role-door mapping** - associates a role with one or more doors, controlling which doors members of that role may access.
- **User-access records** - stores per-user `access_level` (integer) and `admin` flag; subscribes to `user-access.*` events from RabbitMQ to provision new records when users are created and to update them on edits.
- **Database tables** - `UserAccess`, `Role`, `RoleDoor`.

### Door Service

Manages door definitions and serves as the authorization gatekeeper at card-scan time.

- **CRUD** for door entities: `id`, `name`, `access_level`, `created_by`.
- **`/api/internal/requestLock`** - called by the Minecraft plugin with a `cardId` and `doorId`; first checks whether the card owner's personal access level meets the door's requirement, and if not, falls back to checking whether the user's role grants sufficient access to that door. Returns `true` or `false`.
- **`/api/internal/doors`** - returns the full door list to the plugin on startup so it can hydrate in-world signs with door names and access levels.
- Publishes log events and may invoke the notification service on access decisions.

### Log Service

Centralized audit log.

- Subscribes to the `log` RabbitMQ exchange with binding key `log.*` and handles `log.create` events.
- Persists every event to a `Log` table: `id`, `user_id`, `action`, `created_at`, `updated_at`.
- An index on `user_id` supports efficient per-user log queries.

### Card Service

Manages access cards.

- **CRUD** for `Card` entities: `id`, `name`, `user_id`, `assigned_by`.
- Enriches card responses with user information and the associated access level by calling the user and access services internally.
- In-game cards are standard Minecraft items carrying a `card_id` value in their persistent NBT data container.

### MQTT Service

Acts as the bridge between the tRPC service mesh and the MQTT broker.

- **`unlockDoor`** - placeholder mutation for door unlock requests; currently a no-op as door unlocking is performed via direct HTTP calls from the plugin to the door service.
- **`triggerAlarm`** - publishes `"true"` to topic `dumbledoor-alarm/{alarmId}`.
- **`resetAlarm`** - publishes `"false"` to topic `dumbledoor-alarm/{alarmId}`.

The Minecraft plugin subscribes to alarm topics and executes the corresponding in-world actions.

### Alarm Service

Manages alarm entities attached to doors.

- **Database** - `Alarm` table: `id`, `name`, `door_id`.
- Provides CRUD endpoints; alarm actuation is delegated to the MQTT service.

### Button Service

Handles exit-switch requests originating from inside a secured area.

- **`/api/internal/triggerButton`** - called by the plugin when a player right-clicks a configured exit switch block; validates the request and authorizes the door to unlock from the inside without a card scan.

### Notification Service

Delivers system notifications to Discord.

- Exposes an internal `sentNotification` mutation.
- Posts to the configured `DISCORD_WEBHOOK_URL` using Discord's incoming webhook API.
- Called by other services (door, card) when noteworthy events occur.

### Frontend (Next.js)

A React 18 administration dashboard built with Next.js 14.

- **Door view** - displays all doors with their configured access levels.
- **Card view** - lists issued keycards and their assigned owners.
- **Role management** - create and configure roles; map roles to doors.
- **User management** - view and manage user accounts.
- **Log viewer** - paginated audit log of all system actions.
- **Access visualization** - a movable keycard UI component that visually indicates whether a selected card grants access to a selected door.
- Communicates with backend services exclusively through tRPC; caching handled by TanStack React Query.
- Styled with Tailwind CSS and the Geist font.

---

## Minecraft Plugin

**Location:** `plugin/minecraft/`
**Language:** Java and Kotlin
**Build system:** Maven
**Target API:** Spigot 1.21.1
**Dependencies:** Eclipse Paho MQTT client, org.json, Kotlin stdlib

### Startup Sequence

1. `Main.onEnable()` loads `config.json` from the plugin data folder (copies the bundled default if absent).
2. Connects to the MQTT broker specified in configuration as the client `DumbleDoorMinecraft`.
3. Instantiates `DoorManager` and `AlarmManager`, both registered as Bukkit event listeners.
4. `DoorManager` loads door definitions from configuration and asynchronously fetches live door data (name, access level) from the door service at `/api/internal/doors`, then updates the in-world sign block for each door.

### Configuration (`config.json`)

The plugin reads all settings from a JSON file rather than Bukkit's standard YAML:

```json
{
  "USER_SERVICE_URL": "http://localhost:4000",
  "ACCESS_SERVICE_URL": "http://localhost:4001",
  "DOOR_SERVICE_URL": "http://localhost:4002",
  "LOG_SERVICE_URL": "http://localhost:4003",
  "CARD_SERVICE_URL": "http://localhost:4004",
  "BUTTON_SERVICE_URL": "http://localhost:4007",
  "ALARM_SERVICE_URL": "http://localhost:4006",
  "MQTT_BROKER_URL": "tcp://localhost:1883",
  "API_SECRET": "supersecret",
  "doors": [
    {
      "id": "door-uuid",
      "openTime": 100,
      "readerBlock": { "world": "world", "x": 0, "y": 64, "z": 0 },
      "signBlock":   { "world": "world", "x": 1, "y": 64, "z": 0 },
      "exitSwitch":  { "world": "world", "x": -1, "y": 64, "z": 0 },
      "openAction": [
        { "action": "PLACE_BLOCK", "data": { "position": {...}, "block": "REDSTONE_TORCH" } }
      ],
      "closeAction": [
        { "action": "PLACE_BLOCK", "data": { "position": {...}, "block": "AIR" } }
      ]
    }
  ],
  "alarms": []
}
```

Each door requires:
- `id` - the UUID matching the backend door record.
- `openTime` - duration in server ticks before the door re-locks automatically.
- `readerBlock` - world coordinates of the hopper that acts as the card reader.
- `signBlock` (optional) - world coordinates of a sign that displays the door name and required access level.
- `exitSwitch` (optional) - world coordinates of a block players can right-click from inside to exit without a card.
- `openAction` / `closeAction` - ordered list of `PLACE_BLOCK` instructions executed on unlock and lock respectively. Typically placing a redstone torch to power a door mechanism, then replacing it with air on close.

### Card Reading Mechanism

Access cards are Minecraft item stacks with a custom `card_id` value stored in their persistent data container. The interaction flow is:

1. A player drops their keycard item on the ground near the hopper reader block.
2. The `PlayerDropItemEvent` handler writes the player's name into the item's persistent data container under the key `droppedBy`.
3. When the hopper attempts to pick up the item, `InventoryPickupItemEvent` fires.
4. The plugin cancels the event (the item is never stored in the hopper), removes the dropped entity, and returns the item to the player's inventory if the dropping player is identified. It then reads the `card_id` from the item's NBT and identifies which door's reader block triggered the event.
5. An asynchronous task calls the door service at `/api/internal/requestLock?cardId={id}&doorId={id}`.
6. If the response is `"true"`, the door's `unlock()` method executes all open actions, a chime sound plays, and a delayed task schedules `lock()` after `openTime` ticks.

### Exit Switch Mechanism

When a player right-clicks a block matching a door's `exitSwitch` coordinates:
1. The button service is called at `/api/internal/triggerButton?doorId={id}`.
2. On success the door unlocks, a chime plays, the exit switch block is set to powered state, and the door re-locks after `openTime` ticks with the switch returning to unpowered state.

### Card Dispensing

The plugin includes a `ChestListener` that intercepts player interaction with named chest blocks, enabling in-world card dispensing from specially labelled chests.

### Debug Interaction

Shift-right-clicking a reader block sends the door's ID, name, access level, and open time to the player's chat, useful for verifying configuration in-world.

---

## Messaging

### RabbitMQ Exchanges

| Exchange | Routing Key | Producer | Consumer |
|---|---|---|---|
| `log` | `log.create` (publish) / `log.*` (binding) | Door, Card services | Log service |
| `access` | `user-access.create`, `user-access.edit` | User service | Access service |

### MQTT Topics

The plugin connects as client `DumbleDoorMinecraft`.

| Topic pattern | Message | Trigger |
|---|---|---|
| `dumbledoor-alarm/{alarmId}` | `true` | Alarm triggered |
| `dumbledoor-alarm/{alarmId}` | `false` | Alarm reset |

---

## Shared Packages

### `*-api` packages

Each service's business logic lives in a dedicated `-api` package rather than in the `apps/` entry point. Depending on the service, each package exports some combination of:
- `appRouter` - the public/admin tRPC router consumed by the frontend.
- `internalAppRouter` - an internal tRPC router secured with `INTERNAL_API_SECRET`, consumed by peer services.
- Context creators for the exported routers.

Not every service exposes both routers. For example, the log service only has a public router, while the MQTT service only exposes an internal router.

### `*-db` packages

Services with persistent state (user, access, door, log, card, alarm) each have an isolated Prisma schema targeting a separate logical database within the shared PostgreSQL instance. Prisma clients are generated to custom output paths and re-exported from the package for use by the corresponding `-api` package.

### `auth`

Shared NextAuth.js configuration and Prisma adapter for session management in the Next.js frontend. Note that user sign-in (argon2 password hashing and JWT signing via `jsonwebtoken`) is handled in the `user-api` package, not here.

### `validators`

Shared Zod schemas used across service API boundaries to ensure consistent validation of input data.

### `ui`

Shared React component library consumed by the Next.js frontend.

---

## Data Flow

### Card Scan to Door Unlock

```mermaid
sequenceDiagram
    participant P as Player
    participant Plugin as Minecraft Plugin
    participant Door as Door Service
    participant Access as Access Service
    participant MQ as RabbitMQ
    participant Log as Log Service
    participant Noti as Notification Service

    P->>Plugin: Drops card item near hopper
    Plugin->>Plugin: Read card_id from item NBT
    Plugin->>Door: GET /api/internal/requestLock?cardId=...&doorId=...
    Door->>Access: tRPC: get card owner's access level
    Access-->>Door: access_level (personal or role-based)
    Door->>Door: Compare access_level >= door's required level
    Door-->>Plugin: true / false
    opt Access granted
        Plugin->>Plugin: Execute open actions, schedule lock after openTime
        Door->>MQ: publish log.create
        MQ->>Log: log event
        Door->>Noti: tRPC: send Discord notification
    end
```

### Alarm Trigger

```mermaid
sequenceDiagram
    participant Admin as Admin (Dashboard)
    participant MQTT_SVC as MQTT Service
    participant Broker as Mosquitto
    participant Plugin as Minecraft Plugin

    Admin->>MQTT_SVC: tRPC mutation: triggerAlarm
    MQTT_SVC->>Broker: publish dumbledoor-alarm/{alarmId} = "true"
    Broker->>Plugin: subscribed topic
    Plugin->>Plugin: AlarmManager executes in-world actions
```

### User Provisioning

```mermaid
sequenceDiagram
    participant Admin as Admin (Dashboard)
    participant User as User Service
    participant MQ as RabbitMQ
    participant Access as Access Service

    Admin->>User: tRPC mutation: create user
    User->>User: Create user record
    User->>MQ: publish user-access.create
    MQ->>Access: subscribed
    Access->>Access: Create UserAccess record
```

---

## Environment Variables

Copy `.env.example` to `.env` and populate all values before starting.

| Variable | Default | Description |
|---|---|---|
| `RABBITMQ_URL` | `amqp://rabbitmq:rabbitmq@localhost:5672` | RabbitMQ connection string |
| `USER_DATABASE_URL` | `postgresql://...@localhost:32432/users` | Prisma URL for user database |
| `ACCESS_DATABASE_URL` | `postgresql://...@localhost:32432/access` | Prisma URL for access database |
| `DOOR_DATABASE_URL` | `postgresql://...@localhost:32432/door` | Prisma URL for door database |
| `LOG_DATABASE_URL` | `postgresql://...@localhost:32432/log` | Prisma URL for log database |
| `CARD_DATABASE_URL` | `postgresql://...@localhost:32432/card` | Prisma URL for card database |
| `ALARM_DATABASE_URL` | `postgresql://...@localhost:32432/alarm` | Prisma URL for alarm database |
| `USER_SERVICE_PORT` | `4000` | Port for user service |
| `USER_SERVICE_URL` | `http://localhost:4000` | URL for peer services to reach user service |
| `ACCESS_SERVICE_PORT` | `4001` | Port for access service |
| `ACCESS_SERVICE_URL` | `http://localhost:4001` | URL for peer services to reach access service |
| `DOOR_SERVICE_PORT` | `4002` | Port for door service |
| `DOOR_SERVICE_URL` | `http://localhost:4002` | URL for peer services to reach door service |
| `LOG_SERVICE_PORT` | `4003` | Port for log service |
| `LOG_SERVICE_URL` | `http://localhost:4003` | URL for peer services to reach log service |
| `CARD_SERVICE_PORT` | `4004` | Port for card service |
| `CARD_SERVICE_URL` | `http://localhost:4004` | URL for peer services to reach card service |
| `MQTT_SERVICE_PORT` | `4005` | Port for MQTT bridge service |
| `MQTT_SERVICE_URL` | `http://localhost:4005` | URL for peer services to reach MQTT service |
| `ALARM_SERVICE_PORT` | `4006` | Port for alarm service |
| `ALARM_SERVICE_URL` | `http://localhost:4006` | URL for peer services to reach alarm service |
| `BUTTON_SERVICE_PORT` | `4007` | Port for button service |
| `BUTTON_SERVICE_URL` | `http://localhost:4007` | URL for peer services to reach button service |
| `NOTI_SERVICE_PORT` | `4008` | Port for notification service |
| `NOTI_SERVICE_URL` | `http://localhost:4008` | URL for peer services to reach notification service |
| `MQTT_BROKER_URL` | `mqtt://localhost:1883` | MQTT broker connection URL (used by MQTT service) |
| `DISCORD_WEBHOOK_URL` | _(required)_ | Discord incoming webhook URL for notifications |
| `AUTH_SECRET` | _(change in production)_ | Secret for NextAuth JWT signing |
| `INTERNAL_API_SECRET` | _(change in production)_ | Shared secret for inter-service tRPC calls |
| `DATABASE_URL` | `postgresql://...@localhost:32432/dbname` | Generic Prisma database URL template |

---

## Getting Started

### Prerequisites

- Node.js 20.12.0 or later
- pnpm 9.2.0 or later
- Docker and Docker Compose
- Java 17 or later and Maven (for the Minecraft plugin)
- A running Spigot 1.21.1 server

### 1. Start Infrastructure

```bash
docker compose up -d
```

This starts PostgreSQL, RabbitMQ, and Mosquitto.

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your values, especially AUTH_SECRET, INTERNAL_API_SECRET, and DISCORD_WEBHOOK_URL
```

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Apply Database Migrations

```bash
pnpm all-db:push
```

This runs `prisma db push` for all service databases.

### 5. Start All Services

```bash
pnpm dev
```

Turborepo starts all backend services and the Next.js frontend concurrently.

### 6. Build and Install the Plugin

```bash
cd plugin/minecraft
mvn package
```

Copy the resulting JAR from `target/` to your Spigot server's `plugins/` directory. Start or reload the server, then edit `plugins/DumbleDoorMinecraft/config.json` with your service URLs, MQTT broker URL, API secret, and door/alarm definitions.

---

## Access Levels

Doors and user access records both carry an integer access level. By convention, values 0 through 3 are used. A card grants access to a door when the card owner's access level is greater than or equal to the door's required access level.

| Level | Colour (in-world sign) | Description |
|---|---|---|
| 0 | Green | Unrestricted; any card grants access |
| 1 | Yellow | Low restriction |
| 2 | Blue | Medium restriction |
| 3 | Red | High restriction; only level-3 cards permitted |

---

## Contributors

[@JAJAR94](https://github.com/JAJAR94) [@nanananice](https://github.com/nanananic) [@zenithdreamer](https://github.com/zenithdreamer)