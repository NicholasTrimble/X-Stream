
# X-STREAM: Asynchronous Distributed Media Ingestion & Processing Architecture


## Architectural Overview and System Intent
X-STREAM is an enterprise-grade, microservice-inspired web platform designed to solve the structural processing bottlenecks associated with high-bitrate media ingestion. In standard monolithic web frameworks, handling heavy video transcoding directly inside HTTP request-response cycles introduces thread blockages, high latency, and eventual gateway timeouts. X-STREAM mitigates this by completely separating the core web-facing gateway from the underlying media processing layer. 

By leveraging a decoupled, asynchronous pipeline pattern, the system acts as a high-throughput asset ingestion terminal. The platform's presentation layer relies on a clean, single-page command interface styled after modern minimalist video delivery networks, utilizing a unified monospace typography profile to mirror high-security terminal systems. 


## Distributed Component Topography
The system infrastructure is segmented into independent lifecycle layers that communicate over a secure local area cluster network:

### 1. The Gateway Interface (FastAPI Infrastructure)
The entry point of the pipeline is built on FastAPI, a high-performance ASGI framework. This component acts as a strictly stateless ingestion portal. Its sole responsibilities are executing multi-part form data uploads, handling cross-origin handshakes via customized CORS middleware configuration, acting as an asset buffer to local disk arrays, and managing relational integrity checks against the core ledger. By offloading computational tasks, the API remains highly responsive, returning immediate `200 OK` status payloads to the user client.

### 2. Relational Ledger Engine (PostgreSQL Data Layer)
Every transactional state transition within the ingestion pipeline is indexed inside a relational PostgreSQL database model. This database tracks and records vital metadata fields including persistent asset IDs, original asset filenames, accurate system creation timestamps, isolated storage filepaths, and state flags (`QUEUED`, `PROCESSING`, `COMPLETED`, `FAILED`). This design guarantees rigorous transaction durability and provides the absolute source of truth for the system's tracking telemetry.

### 3. Distributed Event Broker (Redis Queue Layer)
To bridge the gap between the stateless web API and the background compute resource pool, the architecture utilizes a Redis database container configured as a high-performance event broker. When an upload transaction completes, the FastAPI gateway issues a specific serializable worker ticket containing the database index number. Redis maintains this message payload safely inside a direct FIFO (First-In, First-Out) key-value structure until a backend compute worker frees a thread to pull down the job.

### 4. Background Compute Workers & Native Transcoding Engine (Celery & FFmpeg)
The core heavy-duty processing layer is an independent Celery worker node operating under a managed thread pool concurrency model. This background thread runs isolated from the web server. Upon grabbing an event ticket from the Redis queue, the worker shifts the row status in the database to `PROCESSING`. It then spawns a subprocess wrapping a native installation of the high-performance media utility **FFmpeg**. 

The pipeline forces an advanced bit-stream compression protocol using the industry-standard H.264 video codec (`libx264`) and Advanced Audio Coding (`aac`). By applying calculated Constant Rate Factor parameters (`CRF 28`) and specific encoding speed presents (`fast`), the engine successfully reduces high-bitrate video sizes—collapsing sample video assets from 17MB down to 1.43MB—while completely preserving excellent visual clarity and standard web compatibility.



## Client Synchronization Layer
The user experience is managed by a single-page React client built on top of the Vite build tool and optimized with the Tailwind CSS v4 utility architecture. Rather than relying on heavy third-party state managers, the interface utilizes simple, native React hooks (`useState`, `useEffect`) to establish an automated scheduling loop. 

Upon mounting, the application initiates an isolated asynchronous pooling sequence that pings the backend database registry every three seconds. This short-polling strategy updates the UI state array dynamically, driving real-time CSS animation adjustments and flashing responsive processing badges across the layout. 

Furthermore, once a media asset hits a verified `COMPLETED` state registry, the interface exposes an inline playback wrapper. This triggers an isolated fullscreen layout modal overlay that pulls a direct static file stream from the Python web server, enabling instant asset verification without forcing a single manual browser refresh.



## Local Development Environment Execution

### Prerequisites
* **Python 3.12.x** installed locally.
* **Node.js LTS** environment running.
* **Docker Desktop** installed and running on the host system.
* A verified local binary compilation of **FFmpeg** mapped explicitly inside `backend/app/tasks.py`.

### Service Initialization Roadmap

#### Event Broker Infrastructure
In an administrative shell environment, spin up the background Redis message box:

docker run -d --name xstream-redis -p 6379:6379 redis:alpine

#### Web Ingestion API Setup

Navigate to the backend system directory, spin up the virtual environment layer, load the required dependencies, and execute the ASGI development gateway:

cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload

#### Async Compute Node Initialization

Open a separate execution window, enter the virtual environment, and launch the distributed thread worker cluster:


cd backend
.\venv\Scripts\activate
celery -A app.tasks.celery_app worker --loglevel=info -P threads

#### Presentation Dashboard Compilation

Open a third terminal, change directories into the frontend engine space, install node package modules, and spin up the hot-reloading web client:

cd frontend
npm install
npm run dev

Open your browser to the designated local server port (http://localhost:5173/ or http://localhost:5174/) to interact with the completed production-grade pipeline ecosystem.