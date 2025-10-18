# 🧑‍💼 Candidate App

## Overview

This application is designed to:
1. Fetch and extract candidate data from a public API.
2. Identify work experience gaps and format readable summaries.
3. Filter candidates based on industry, skills, and total experience.
4. Store filtered results in a MongoDB collection.

## 🛠 Requirements

- Python 3.7+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- All dependencies are listed in the `requirements.txt` file.

To install all required packages:

```bash
pip install -r requirements.txt
```

---

## 🔐 Environment Variables

Before running the application, set your MongoDB connection string in the `.env` file located in the root directory:

```bash
MONGO_URI="your-mongodb-connection-string"
```

---

## 📥 Section 1: Candidate Extraction

This script fetches and processes candidate resumes from a JSON endpoint. It structures the data into Python objects for further processing.

**Run With:**
```bash
python section1.py
```

## 🔎 Section 2: Candidate Filtering and MongoDB Integration

This script filters candidates based on:
- Industry
- Specific Skills
- Minimum total years of experience

Filtered candidates are inserted into a MongoDB collection named ```filtered_candidates```.

**Run With:**
```bash
python section2.py
```

You can customize the filter logic in ```services/filter_service.py```.

---

## 🧪 Running Unit Tests

Unit tests are located in the `tests/` directory. 

Run all tests with:

```bash
python -m unittest discover tests
```

## 📂 Project Structure
```bash
CandidateApp/
├── models/               # Data classes (Candidate, JobExperience, etc.)
├── services/             # Core logic for extraction, filtering, and DB
├── utils/                # Logger and utilities
├── tests/                # Unit tests
├── section1.py      # Script for Section 1
├── section2.py      # Script for Section 2
└── requirements.txt      # All required packages
└── README.md
```