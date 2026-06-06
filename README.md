# Aether Inbox - Messaging System

Aether Inbox is a decoupled, modern email client featuring a Spring Boot RESTful backend powered by Apache Cassandra (DataStax Astra DB), Spring Security OAuth2 (GitHub/Google login), and a lightweight, light-themed React frontend.

---

## Backend Architecture & Design

The backend is built following a clean **Controller -> Service -> Repository -> Model** architecture.

### Core Technology Stack
- **Framework**: Spring Boot
- **Database**: Apache Cassandra / DataStax Astra DB (Spring Data Cassandra)
- **Security**: Spring Security (Stateless JWT token architecture, custom credentials login/registration, and GitHub OAuth2 mapping)
- **Cross-Origin Resource Sharing**: CORS mapping with `http://localhost:5173`.

---

## Cassandra Data Modeling (Query-Driven Design)

To support high-throughput, horizontally scalable email workflows, Cassandra tables are designed around specific query access patterns:

### 1. Folders Table (`folders`)
Stores custom folder associations for users.
- **Partition Key**: `id` (User ID)
- **Clustering Key**: `label` (Folder name)

### 2. Email Body & Metadata (`emails`)
Stores the complete email content.
- **Partition Key**: `id` (Time-based UUID)

### 3. Email List Item (`inbox_emails_by_user_folder`)
Designed to fetch folder listings quickly (e.g., retrieving the user's "Inbox" sorted by newest first).
- **Partition Key**: `id` (User ID), `label` (Folder name)
- **Clustering Key**: `time_uuid` (Time-based UUID, ordered descending)

### 4. Unread Statistics (`unread_email_stats`)
Maintains atomic counts of unread messages per folder.
- **Partition Key**: `id` (User ID), `label` (Folder name)
- **Column**: `unreadCount` (Cassandra `COUNTER` type for safe, concurrent increments/decrements)

---

## REST API Endpoints

All backend endpoints reside under the `/api/**` prefix and return JSON payloads.

### 1. Authentication
- **`GET /api/auth/me`**
  - **Description**: Returns OAuth2 user profile information and checks authentication status.
  - **Response (200 OK)**:
    ```json
    {
      "authenticated": true,
      "login": "octocat",
      "name": "The Octocat",
      "avatarUrl": "https://avatars.githubusercontent.com/u/5832347?v=4"
    }
    ```

### 2. Folder Operations
- **`GET /api/folders`**
  - **Description**: Retrieves default folders (Inbox, Sent Items, Important) and custom user folders.
  - **Response (200 OK)**:
    ```json
    {
      "defaultFolders": [
        { "label": "Inbox", "color": "blue" },
        { "label": "Sent Items", "color": "green" },
        { "label": "Important", "color": "red" }
      ],
      "userFolders": []
    }
    ```

### 3. Statistics
- **`GET /api/stats`**
  - **Description**: Retrieves unread counts for all folders.
  - **Response (200 OK)**:
    ```json
    {
      "Inbox": 3,
      "Important": 0
    }
    ```

### 4. Email Operations
- **`GET /api/emails?folder=Inbox`**
  - **Description**: Fetches list items for a specific folder.
  - **Response (200 OK)**:
    ```json
    [
      {
        "id": "e30e14a0-1285-11eb-adc1-0242ac120002",
        "from": "Shivang",
        "to": ["Aarushi"],
        "subject": "Project Update",
        "read": false,
        "agoTimeString": "2 minutes ago"
      }
    ]
    ```

- **`GET /api/emails/{id}`**
  - **Description**: Fetches the full details of a specific email. Returns 403 Forbidden if the authenticated user does not have permission to view it.
  - **Response (200 OK)**:
    ```json
    {
      "id": "e30e14a0-1285-11eb-adc1-0242ac120002",
      "from": "Shivang",
      "to": ["ABC"],
      "subject": "Project Update",
      "body": "Hi ABC, please find the latest design guidelines attached..."
    }
    ```

- **`POST /api/emails`**
  - **Description**: Composes and dispatches a new email. Saves to the sender's `Sent Items` (marked read) and the recipients' `Inbox` (marked unread, increments counters).
  - **Request Body**:
    ```json
    {
      "to": ["Ms. Shivang", "Shivang"],
      "subject": "Meeting",
      "body": "Let's meet tomorrow."
    }
    ```

- **`PUT /api/emails/{id}/read?folder=Inbox`**
  - **Description**: Marks a specific email as read and atomically decrements the unread count statistic for that folder.

---

## Configuration & Local Setup

### Prerequisite: Setup DataStax Astra DB
1. Create an Astra DB database.
2. Download the **Secure Connect Bundle** zip file and place it in your local workspace.
3. Generate an **Application Token** (Role: Database Administrator).

### 1. Configure properties
Create or edit `src/main/resources/application.properties` (or `application-local.properties` depending on profiles):
```properties
spring.application.name=InboxApplication

# Astra DB Credentials
datastax.astra.secure-connect-bundle=file:///absolute/path/to/secure-connect-bundle.zip
astra.db.application.token=AstraCS:...

# OAuth2 Provider (GitHub / Google)
spring.security.oauth2.client.registration.github.client-id=YOUR_GITHUB_CLIENT_ID
spring.security.oauth2.client.registration.github.client-secret=YOUR_GITHUB_CLIENT_SECRET
```

### 2. Run the Backend
Execute the Spring Boot wrapper command in the root folder:
```bash
./mvnw spring-boot:run
```
The backend server starts on `http://localhost:8080`.

### 3. Run the Frontend
Navigate to the `frontend` folder, install dependencies, and start Vite:
```bash
cd frontend
npm install
npm run dev
```
The frontend starts on `http://localhost:5173`.
