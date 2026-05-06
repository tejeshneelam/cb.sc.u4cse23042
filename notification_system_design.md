Stage 1

Core Actions
1. Fetch Notifications: Retrieve a paginated list of notifications for the logged-in student.
2. Mark Notification as Read: Mark a specific notification as viewed.
3. Mark All as Read: Mark all unread notifications as read.
4. Unread Count: Get the total number of unread notifications.

REST API Endpoints

1. Fetch Notifications
Endpoint: GET /api/v1/notifications
Headers: 
Authorization: Bearer <eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJubm50ZWplc2hAZ21haWwuY29tIiwiZXhwIjoxNzc4MDU5MTE1LCJpYXQiOjE3NzgwNTgyMTUsImlzcyI6IkFmZm9yZCBNZWRpY2FsIFRlY2hub2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiI5ZmFhNWJmOS0wOGNmLTQxOWQtYTZiZC1kZDNkN2JmNDc0ZjciLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJuZWVsYW0gbmFnYSBuYXJlbiB0ZWplc2giLCJzdWIiOiJjMWI1OWQ4Zi1lMjVjLTRhNWQtOTc1Zi1hOWNiZTZjZjhkNmYifSwiZW1haWwiOiJubm50ZWplc2hAZ21haWwuY29tIiwibmFtZSI6Im5lZWxhbSBuYWdhIG5hcmVuIHRlamVzaCIsInJvbGxObyI6ImNiLnNjLnU0Y3NlMjMwNDIiLCJhY2Nlc3NDb2RlIjoiUFRCTW1RIiwiY2xpZW50SUQiOiJjMWI1OWQ4Zi1lMjVjLTRhNWQtOTc1Zi1hOWNiZTZjZjhkNmYiLCJjbGllbnRTZWNyZXQiOiJoS1BSVG5GZ1dHUHVwZnR4In0.XOAZ2drkeMR7egDmrkrq1KPU6HnFJLpLZGaijcArmi8>
Accept: application/json

Request Query Parameters:
page (integer, optional) - defaults to 1
limit (integer, optional) - defaults to 20
notification_type (string, optional) - Event, Result, Placement
is_read (boolean, optional)

Response (200 OK):
success: true,
data: 
  notifications: 
    id: uuid
    type: Placement
    message: CSX Corporation hiring
    is_read: false
    timestamp: 2026-04-22T17:51:18Z

2. Mark Notification as Read
Endpoint: PATCH /api/v1/notifications/:id/read
Headers: 
Authorization: Bearer <eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJubm50ZWplc2hAZ21haWwuY29tIiwiZXhwIjoxNzc4MDU5MTE1LCJpYXQiOjE3NzgwNTgyMTUsImlzcyI6IkFmZm9yZCBNZWRpY2FsIFRlY2hub2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiI5ZmFhNWJmOS0wOGNmLTQxOWQtYTZiZC1kZDNkN2JmNDc0ZjciLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJuZWVsYW0gbmFnYSBuYXJlbiB0ZWplc2giLCJzdWIiOiJjMWI1OWQ4Zi1lMjVjLTRhNWQtOTc1Zi1hOWNiZTZjZjhkNmYifSwiZW1haWwiOiJubm50ZWplc2hAZ21haWwuY29tIiwibmFtZSI6Im5lZWxhbSBuYWdhIG5hcmVuIHRlamVzaCIsInJvbGxObyI6ImNiLnNjLnU0Y3NlMjMwNDIiLCJhY2Nlc3NDb2RlIjoiUFRCTW1RIiwiY2xpZW50SUQiOiJjMWI1OWQ4Zi1lMjVjLTRhNWQtOTc1Zi1hOWNiZTZjZjhkNmYiLCJjbGllbnRTZWNyZXQiOiJoS1BSVG5GZ1dHUHVwZnR4In0.XOAZ2drkeMR7egDmrkrq1KPU6HnFJLpLZGaijcArmi8>
Content-Type: application/json

Request Body: Empty
Response (200 OK):
success: true,
message: Notification marked as read


Real-time Notifications Mechanism
For real-time delivery, WebSockets or Server-Sent Events (SSE) should be used.
WebSockets: Ideal for establishing a persistent, bidirectional connection. When a new notification is generated, the server actively pushes the payload to the connected client.
Fallback: Long-polling if WebSockets are restricted by proxies.


Stage 2

Storage Choice
I suggest PostgreSQL (a relational database) because notifications have a structured schema, relationships to users, and require ACID compliance to ensure state consistency (like read/unread status). 

DB Schema
CREATE TYPE notification_enum AS ENUM ('Event', 'Result', 'Placement');

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id BIGINT NOT NULL,
    type notification_enum NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

Problems with Data Volume Increase
1. Slow Queries: Searching through millions of rows to find unread notifications will become a bottleneck (Full Table Scans).
2. High Connection Overhead: High read-throughput will exhaust database connection pools.

Solutions
1. Indexing: Add composite indexes on (student_id, is_read, created_at) to fetch unread items quickly.
2. Caching: Use a caching layer like Redis to store the unread count and latest notifications.
3. Archival / Partitioning: Partition the table by date (monthly) and archive notifications older than 3-6 months since they are rarely accessed.

Queries
Fetch Unread (SQL):
SELECT id, type, message, created_at 
FROM notifications 
WHERE student_id = 12345 AND is_read = false 
ORDER BY created_at DESC 
LIMIT 20 OFFSET 0;


Stage 3

Is the query accurate?
The original query uses ORDER BY createdAt ASC. Usually, users want to see the most recent notifications first, so it should be ORDER BY createdAt DESC.

Why is it slow?
Without an index on studentId and isRead, the database must perform a Full Table Scan over 5,000,000 rows to filter and sort.

Changes and Computation Cost
Add a composite index: 
CREATE INDEX idx_student_unread ON notifications(studentId, isRead, createdAt DESC);
This reduces the computational cost from O(N) (N=total DB rows) to roughly O(log N + K) (where K is the number of unread notifications for that student) using a B-Tree index scan.

Adding indexes on every column?
Bad Advice. Indexes speed up reads but slow down writes (INSERT/UPDATE/DELETE) because the index tree must be updated. Moreover, they consume substantial disk space. Indexes should only be placed on columns frequently used in WHERE, ORDER BY, or JOIN clauses.

Query for Placement Notifications in Last 7 Days
SELECT DISTINCT studentId 
FROM notifications 
WHERE notification_type = 'Placement' 
  AND createdAt >= NOW() - INTERVAL '7 days';


Stage 4

Problem Solution
The database is overwhelmed because every page load triggers a synchronous SELECT query on a large table.

Strategies to Improve Performance
1. Implement a Caching Layer (Redis) 
   Store the first page of notifications and the "unread count" in Redis.
   Tradeoff: Data duplication and cache invalidation complexity. Slightly stale data might appear if cache sync fails.
2. Use Server-Sent Events (SSE) or WebSockets
   Instead of the frontend pulling (polling/fetching) on every reload or interval, maintain a persistent connection to push new data.
   Tradeoff: Requires stateful connection management and consumes memory on the backend.
3. Cursor-based Pagination
   Replace offset-based pagination (OFFSET 1000) with cursor-based pagination (WHERE id < last_id), which utilizes indexes far efficiently.
   Tradeoff: Cannot jump to a specific page number easily (clicking "Page 5").


Stage 5

Shortcomings Observed
1. Synchronous Loop: Processing 50,000 emails synchronously in an O(N) loop will take immensely long, holding up the server.
2. Lack of Fault Tolerance: If the loop fails at index 200, the remaining 49,800 students won't receive anything. No retry mechanism exists.
3. Tight Coupling: Database saves and API calls to third-party email providers are tightly bound. A slow Email API brings the whole function to a halt.

Should DB and Email happen together?
No. Database insertion is typically fast and should be the source of truth. Email sending is slow, relies on external networking, and is prone to rate limits. They must be decoupled.

Redesign and Revised Pseudocode
Instead of running a single long process, the notify_all function should insert the intent into a database, then push a message to an Event Broker/Message Queue (like RabbitMQ, Kafka, or AWS SQS). Asynchronous background workers will consume queue items, process the DB saves, and trigger email APIs independently with proper retry mechanisms.

function notify_all(student_ids: array, message: string):
    job_id = create_notification_batch_job(message)
    
    for chunk in chunk_array(student_ids, 1000):
        MessageQueue.publish("notification_topic", {
            "job_id": job_id,
            "message": message,
            "recipients": chunk
        })

function process_notification_worker(payload):
    db_records = []
    for student_id in payload.recipients:
        db_records.append({student_id, payload.message})
    
    bulk_save_to_db(db_records)
    push_to_app_bulk(payload.recipients, payload.message)

    for student_id in payload.recipients:
        MessageQueue.publish("email_topic", {student_id, payload.message})

function process_email_worker(email_job):
    try:
        send_email(email_job.student_id, email_job.message)
    except APIError:
        MessageQueue.retry(email_job, delay="5m")


Stage 6

Approach for Priority Inbox
To construct the priority inbox, we sort notifications primarily by the predefined weight: Placement (3) > Result (2) > Event (1).
If two notifications have the exact same weight (e.g., both are Results), we use the Timestamp for tie-breaking so that the most recent ones appear first.

Code Implementation
A Node.js/TypeScript application was created to fetch the notifications from the endpoint, apply this sorting logic natively in memory, and select the top 10 items to display. See notification_app_be/src/index.ts for the actual running code.

Handling New Notifications
To maintain the top 10 notifications efficiently on the frontend/backend when new notifications keep coming in:
- A Priority Queue (Min-Heap based on the sorting weights) of size 10 can be utilized.
- Whenever a real-time event pushes a new notification, we quickly compare it to the minimum element of the Priority Queue.
- If it has higher priority or recency than the smallest element, we replace it and re-heapify.
This gives O(log 10) -> O(1) performance per new notification rather than re-sorting the whole list O(N log N).

