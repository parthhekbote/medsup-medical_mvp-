# Medical Supply Operational AI (AIP)
### Strategic Situation Awareness and AI-Driven Supply Chain Management

Medical Supply AIP is a high-performance, AI-powered web application designed for strategic medical supply chain management. It provides real-time situation awareness, intelligent risk assessment, and AI-driven decision support to ensure critical resources are available when and where they are needed.

---

## Screenshots
<img width="1919" height="939" alt="Screenshot 2026-04-23 005719" src="https://github.com/user-attachments/assets/bc66e008-181f-4790-87d7-019ba3510116" />

<img width="1919" height="945" alt="Screenshot 2026-04-23 005751" src="https://github.com/user-attachments/assets/9917fe17-d622-4700-868c-ad355c24fbdb" />



---

## Key Features

- AI Strategic Assistant  
  Integrated AI co-pilot powered by Groq LLM for real-time insights and decision support  

- Situation Awareness Dashboard  
  Glassmorphism-based interface for monitoring supply levels and operational metrics  

- Dynamic Risk Assessment  
  Automatic classification of inventory into Emergency, Warning, and Safe categories  

- Full Supply Chain Lifecycle  
  Unified system for inventory, orders, and accounting management  

- Operational Transparency  
  Audit logs and agent tracking for accountability  

---

## Tech Stack

### Frontend
- React (Vite) for fast and modular UI development  
- Axios for API communication  
- Lucide Icons for UI components  
- Custom CSS for glassmorphism-based design  

### Backend
- FastAPI for high-performance REST APIs  
- SQLAlchemy for ORM-based database operations  
- SQLite for lightweight data storage  

### AI Integration
- Groq SDK for low-latency large language model responses  

### Architecture
- Decoupled frontend and backend using REST APIs  
- Modular and scalable design  
- Real-time data flow for monitoring and alerts  

---

## System Architecture

```
Frontend (React + Vite)
        |
        v
FastAPI Backend (REST APIs)
        |
        +--> SQLite Database
        |
        +--> Groq LLM (AI Assistant)
```

---

## Functional Modules

- Inventory Management  
  Track and manage stock levels in real time  

- Risk Engine  
  Evaluate thresholds and assign risk levels dynamically  

- AI Assistant  
  Handle natural language queries and provide insights  

- Audit System  
  Maintain logs of all operations and user activities  

---

## Getting Started

### Prerequisites

- Python 3.10 or higher  
- Node.js 18 or higher  
- Groq API Key  

---

### Backend Setup

```bash
cd backend
python -m venv venv
```

Activate virtual environment:

```bash
# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file:

```env
GROQ_API_KEY=your_api_key_here
```

Run the backend server:

```bash
uvicorn main:app --reload
```

Backend will run at:
```
http://127.0.0.1:8000
```

---

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will run at:
```
http://localhost:5173
```

---

## Performance Highlights

- Fast API response using FastAPI async capabilities  
- Low-latency AI responses via Groq LLM  
- Optimized frontend performance with Vite  
- Efficient local database operations using SQLite  

---

## Future Enhancements

- Deployment using Vercel, Render, or Docker  
- Real-time updates with WebSockets  
- Role-based access control  
- Predictive analytics for demand forecasting  
- Integration with external healthcare systems  

---

## License

This project is licensed under the MIT License.
