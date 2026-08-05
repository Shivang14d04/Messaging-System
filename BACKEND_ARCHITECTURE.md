# Æther Inbox - Backend Architecture & Reference Guide

This document describes the complete backend design, directory structure, query-driven database modeling, stateless security configuration, and core execution flows for the Æther Inbox application.

---

## 🏗️ Architecture Overview

The backend is built as a decoupled REST API using **Spring Boot 3.x** and **Java 21**, with **Apache Cassandra (DataStax Astra DB)** for persistence and **Spring Security** for authentication.

The application follows a clean layered design:

```
[ HTTP Requests ]
       │
       ▼
[ Security Chain (CORS, CSRF, JwtFilter, OAuth2) ]
       │
       ▼
[ REST Controllers ] (Exposes endpoints, maps payloads via DTOs)
       │
       ▼
[ Service Layer ] (Executes business logic, manages transactions/atomic updates)
       │
       ▼
[ Cassandra Repositories ] (Executes CQL queries via Spring Data Cassandra)
       │
       ▼
[ Cassandra Database ] (Astra DB Storage)
```

---

## 📂 Project Directory Structure

All Java classes are organized inside `src/main/java/org/shivang/inboxapplication/`:

- **`configuration/`**: Defines core application configurations.
  - `CorsConfig.java`: Configures cross-origin requests for `http://localhost:5173`.
  - `SecurityConfig.java`: Configures the filter chain, sets session state to stateless, and maps password encoders / authentication providers.
  - `JwtFilter.java`: Once-per-request filter that parses and validates `Authorization: Bearer <token>` headers.
- **`controller/`**: Exposes REST endpoints and processes HTTP request/response payloads.
  - `AuthController.java`: Handles registration, credential login, and user profile retrieval.
  - `EmailController.java`: Handles composing, retrieving, deleting, copying, and reading emails.
  - `FolderController.java`: Handles custom folder creation and retrieval.
  - `StatsController.java`: Handles unread stats retrieval.
- **`model/`**: Contains domain entities mapped directly to Cassandra tables.
  - `User.java`: Mapped to the `users` table.
  - `UserPrincipal.java`: Implements Spring Security's `UserDetails` interface.
  - `Email.java`: Mapped to the `emails` table.
  - `EmailListItem.java`: Mapped to the `inbox_emails_by_user_folder` table.
  - `Folder.java`: Mapped to the `folders` table.
  - `UnreadEmailStats.java`: Mapped to the `unread_email_stats` counter table.
- **`repository/`**: Interfaces extending `CassandraRepository` to interact with Astra DB.
- **`service/`**: Core business services.
  - `EmailService.java`: Implements composing and sending emails.
  - `InboxService.java`: Retrieves folder email listings.
  - `FolderService.java`: Resolves user folders and increments/decrements unread statistics.
  - `JwtService.java`: Generates, parses, and validates JSON Web Tokens.
  - `MyUserDetailsService.java`: Loads custom user authentication details.

---

## 💾 Cassandra Data Modeling (Query-Driven Design)

Cassandra does not support joins or arbitrary WHERE clauses. Therefore, tables are designed around specific query access patterns (query-driven design) with de-normalized data.

### 1. Users Table (`users`)
Used to register, authenticate, and map user credentials.
- **CQL Table**: `CREATE TABLE users (username text PRIMARY KEY, password text);`
- **Partition Key**: `username`

### 2. Folders Table (`folders`)
Used to fetch default and custom folders for a specific user.
- **CQL Table**: `CREATE TABLE folders (id text, label text, color text, PRIMARY KEY (id, label));`
- **Partition Key**: `id` (maps to User ID / username)
- **Clustering Key**: `label` (folders are sorted alphabetically within a partition)

### 3. Emails Table (`emails`)
Stores the complete email subject, body, and participant lists.
- **CQL Table**: `CREATE TABLE emails (id timeuuid PRIMARY KEY, from text, to list<text>, subject text, body text);`
- **Partition Key**: `id` (Time-based UUID to ensure uniqueness and order)

### 4. Email List Items (`inbox_emails_by_user_folder`)
Designed to render the inbox list view quickly for a specific user folder, sorted by date descending.
- **CQL Table**: `CREATE TABLE inbox_emails_by_user_folder (id text, label text, time_uuid timeuuid, from text, to list<text>, subject text, read boolean, PRIMARY KEY ((id, label), time_uuid)) WITH CLUSTERING ORDER BY (time_uuid DESC);`
- **Partition Key**: `(id, label)` (Composite key containing User ID and Folder Label)
- **Clustering Key**: `time_uuid` (Time-based UUID, ordered DESC to show newest emails first)

### 5. Unread Statistics Table (`unread_email_stats`)
Maintains atomic counts of unread messages per folder.
- **CQL Table**: `CREATE TABLE unread_email_stats (id text, label text, unreadCount counter, PRIMARY KEY ((id, label)));`
- **Partition Key**: `(id, label)` (Composite key containing User ID and Folder Label)
- **Counter Column**: `unreadCount` (Uses Cassandra's `counter` type to allow concurrent, atomic increments and decrements)

---

## 🔑 Stateless Security & Authentication Flow

### 1. Custom Credential Authentication
1. **Registration**:
   - The client posts credentials to `POST /api/auth/register`.
   - The backend encodes the password using `BCryptPasswordEncoder` (12 strength) and saves it to the `users` table.
2. **Login**:
   - The client posts credentials to `POST /api/auth/login`.
   - The `AuthenticationManager` delegates authentication to the `DaoAuthenticationProvider` referencing `MyUserDetailsService`.
   - On success, `JwtService` compiles claims and signs a JWT token using the HS256 algorithm. The token is returned in the response.

### 2. GitHub OAuth2 Authentication
1. The user triggers the redirect to `/oauth2/authorization/github`.
2. Upon successful authentication with GitHub, `oAuth2AuthenticationSuccessHandler` intercepts the success hook.
3. The handler extracts the GitHub `login` (username) attribute:
   - If the user does not exist in the Cassandra database, a new `User` is automatically registered with an empty password.
   - Generates a JWT token for the user.
   - Redirects the browser back to `http://localhost:5173?token=<JWT_TOKEN>`.
4. The client intercepts the token from query parameters, saves it in `localStorage`, and cleans up the browser address bar.

### 3. Stateless Request Interception
For all subsequent requests, `JwtFilter` parses the token from the header:
- Header format: `Authorization: Bearer <token>`
- Validates the token claims against the database using `MyUserDetailsService`.
- Sets the `SecurityContextHolder` authentication context with the validated `UserPrincipal` object.

---

## ⚙️ Core Business Logic Flows

### 1. Send Email Flow (`EmailService.sendEmail`)
When a user sends an email to one or multiple recipients:
1. A new `Email` entity is instantiated, assigned a new time-based UUID, and saved to the `emails` table.
2. An `EmailListItem` is created for the sender in their **"Sent Items"** folder (marked as `read=true`), and saved to the `inbox_emails_by_user_folder` table.
3. For each recipient:
   - An `EmailListItem` is created in their **"Inbox"** folder (marked as `read=false`) and saved.
   - An atomic CQL increment query updates the unread stats count for the recipient's **"Inbox"** folder:
     `UPDATE unread_email_stats SET unreadCount = unreadCount + 1 WHERE id = :recipient AND label = 'Inbox';`

### 2. Mark Email as Read Flow (`EmailService.markAsRead`)
When a user clicks on an email to open it:
1. The `EmailListItem` is fetched from `inbox_emails_by_user_folder` matching the user ID, folder, and email ID.
2. If `read` is already true, no action is taken.
3. If `read` is false:
   - Sets `read` to true and updates the list item in `inbox_emails_by_user_folder`.
   - Atomically decrements the unread stats count for that folder:
     `UPDATE unread_email_stats SET unreadCount = unreadCount - 1 WHERE id = :userId AND label = :folder;`

### 3. Bulk Email Actions
- **Delete Emails**: Deletes multiple selected list items from the current user folder in a single batch request, and updates unread counts if any of the deleted emails were unread.
- **Copy (Transfer) Emails**: Transfers multiple selected email metadata list records from a source folder to a target folder for the current user, adjusting unread counts accordingly.

---

## 🔌 API Endpoint Specifications

All endpoints require a valid `Authorization: Bearer <token>` header except where noted.

| Method | Endpoint | Auth Required | Description | Request/Response Payload |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | No | Registers custom user | Request: `{ "username": "...", "password": "..." }` |
| **POST** | `/api/auth/login` | No | Authenticates credentials | Request: User JSON; Response: `{ "token": "...", "username": "..." }` |
| **GET** | `/api/auth/me` | Yes | Retrieves profile info | Response: `{ "authenticated": true, "login": "...", "name": "...", "avatarUrl": "..." }` |
| **GET** | `/api/folders` | Yes | Retrieves user folders | Response: Default and custom folders JSON |
| **POST** | `/api/folders` | Yes | Creates custom folder | Request: `{ "label": "...", "color": "..." }` |
| **GET** | `/api/stats` | Yes | Retrieves unread counts | Response: `{ "Inbox": 5, "Important": 2 }` |
| **GET** | `/api/emails` | Yes | Gets folder email listings | Query Param: `?folder=Inbox` |
| **GET** | `/api/emails/{id}` | Yes | Retrieves full email body | Path Param: TimeUUID of email |
| **POST** | `/api/emails` | Yes | Composes/Sends email | Request: `{ "to": ["..."], "subject": "...", "body": "..." }` |
| **PUT** | `/api/emails/{id}/read`| Yes | Marks email as read | Query Param: `?folder=Inbox` |
| **DELETE**| `/api/emails` | Yes | Deletes email list items | Request: `{ "emailIds": ["..."], "folder": "..." }` |
| **POST** | `/api/emails/copy` | Yes | Copies emails to folder | Request: `{ "emailIds": ["..."], "sourceFolder": "...", "targetFolder": "..." }` |
