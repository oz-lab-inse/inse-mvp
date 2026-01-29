# Project INSE: Process over Result

**Project INSE** is an AI-powered assessment platform that evaluates candidates based on their **problem-solving process** rather than just the final answer. By tracking real-time behavioral data, we provide insights into a candidate's focus, adaptability, and AI collaboration skills.

## Core Features

- **Web-based IDE**: A built-in code editor (Monaco Editor) that captures every keystroke and interaction.
- **Behavioral Logging**: Systematic tracking of `IdeEvents` including code edits, test runs, and AI interactions.
- **Advanced Scoring Engine**: Rule-based analysis of candidate journeys using metrics like Progress Score, Evidence Responsiveness, and Loop Productivity.
- **Process Integrity Report**: A recruiter-facing dashboard with Radar Charts and Confidence Scores based on data reliability.

## Technical Architecture

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, Recharts
- **Backend**: Next.js App Router (Route Handlers)
- **Data Layer**: File-based persistence (JSON/JSONL) with a strict schema aligned with our unified ERD.
- **Dev Tools**: ESLint, Prettier, TypeScript (Strict Mode)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repository-url>
   cd inse-mvp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the landing page.

## Data Schema

We follow a strict database schema for external project compatibility. Key entities include:
- `Recruiter`, `Assessment`, `Task`, `Candidate`, `Session`, `IdeEvent`, `Report`, `Metric`.

## Project Documentation (Korean)
- [기술 구현 보고서 (Technical Report)](./project_technical_report.md)
- [개발 요약 보고서 (Summary Report)](./project_summary_notion.md)
- [백엔드 구현 상세 (Backend Details)](./backend_report.md)

---
Developed as an MVP for Project INSE. Process over Result.
