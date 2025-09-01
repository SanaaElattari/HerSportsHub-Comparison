# HerSportsHub-Comparison

A web application for **comparing professional women’s soccer players** based on league statistics. This project provides an intuitive interface to analyze player performance, view radar charts, and compare individual stats with league averages.

---

## 🌟 Features

- **Player Comparison**: Select two players to compare their stats side by side.
- **Better Player Score**: Calculates a weighted score based on per-90 performance and position.
- **Radar Charts**: Visualize multiple statistics like goals, assists, xG, xA, tackles, and interceptions.
- **Line Charts**: Compare individual player stats with league averages.
- **Dynamic Data**: Pulls player statistics from the latest league data.

---

## 💻 Tech Stack

- **Frontend**: React, Recharts, TailwindCSS
- **Backend**: Node.js, Express, CSV parsing, Python
- **Data Source**: NWSL player statistics (scraped and processed)
- **Version Control**: GitHub

---

## 📂 Repository Structure

HerSportsHub-Comparison/
│
├─ backend-testing/ # Backend APIs and CSV processing scripts
├─ womens-soccer-frontend/ # Frontend React application
├─ package.json
├─ README.md
└─ .gitignore

📊 Data

- Player statistics are collected from NWSL league sources.
- Backend scripts scrape and aggregate data into CSV files for use in the frontend.
- Supports weekly updates to keep stats current.

👩‍💻 Author
Sanaa Elattari
GitHub: sanaaelattari
Email: sanaaelattari2006@gmail.com

⚡ Notes
- Goalkeepers are excluded from the Better Player Score.
- Players with less than 90 minutes are marked as N/A.
- Radar and line charts are normalized and scaled relative to positional averages.

📜 License
This project is for personal portfolio and educational purposes.
