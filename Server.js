import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;
const DATA_FILE = path.join(__dirname, "data.json");

app.use(cors());
app.use(express.json());

function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function makeId(prefix) {
  return prefix + Date.now().toString(36);
}

app.get("/api/health", (req, res) => {
  res.json({ message: "CareerCraft API is running" });
});

/* Dashboard */
app.get("/api/dashboard", (req, res) => {
  const data = readData();

  const counts = {
    resumes: data.resumes.length,
    applications: data.applications.length,
    interviews: data.applications.filter(a => a.status === "Interview").length,
    offers: data.applications.filter(a => a.status === "Offer").length
  };

  res.json({
    counts,
    recentResumes: data.resumes.slice(-4).reverse(),
    applications: data.applications
  });
});

/* Resumes */
app.get("/api/resumes", (req, res) => {
  res.json(readData().resumes);
});

app.get("/api/resumes/:id", (req, res) => {
  const resume = readData().resumes.find(r => r.id === req.params.id);

  if (!resume) {
    return res.status(404).json({ message: "Resume not found" });
  }

  res.json(resume);
});

app.post("/api/resumes", (req, res) => {
  const data = readData();

  const resume = {
    id: makeId("r"),
    title: req.body.title || "Untitled Resume",
    template: req.body.template || "Modern",
    updatedAt: new Date().toISOString().slice(0, 10),
    personal: req.body.personal || {},
    education: req.body.education || [],
    skills: req.body.skills || [],
    projects: req.body.projects || []
  };

  data.resumes.push(resume);
  writeData(data);

  res.status(201).json(resume);
});

app.put("/api/resumes/:id", (req, res) => {
  const data = readData();
  const index = data.resumes.findIndex(r => r.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: "Resume not found" });
  }

  data.resumes[index] = {
    ...data.resumes[index],
    ...req.body,
    id: data.resumes[index].id,
    updatedAt: new Date().toISOString().slice(0, 10)
  };

  writeData(data);
  res.json(data.resumes[index]);
});

app.delete("/api/resumes/:id", (req, res) => {
  const data = readData();
  const oldLength = data.resumes.length;

  data.resumes = data.resumes.filter(r => r.id !== req.params.id);

  if (oldLength === data.resumes.length) {
    return res.status(404).json({ message: "Resume not found" });
  }

  writeData(data);
  res.json({ message: "Resume deleted" });
});

/* Templates */
app.get("/api/templates", (req, res) => {
  res.json(readData().templates);
});

/* Applications */
app.get("/api/applications", (req, res) => {
  res.json(readData().applications);
});

app.post("/api/applications", (req, res) => {
  const data = readData();

  const application = {
    id: makeId("a"),
    company: req.body.company,
    role: req.body.role,
    status: req.body.status || "Saved",
    date: req.body.date || new Date().toISOString().slice(0, 10)
  };

  data.applications.push(application);
  writeData(data);

  res.status(201).json(application);
});

app.put("/api/applications/:id", (req, res) => {
  const data = readData();
  const index = data.applications.findIndex(a => a.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: "Application not found" });
  }

  data.applications[index] = {
    ...data.applications[index],
    ...req.body,
    id: data.applications[index].id
  };

  writeData(data);
  res.json(data.applications[index]);
});

app.delete("/api/applications/:id", (req, res) => {
  const data = readData();

  const oldLength = data.applications.length;
  data.applications = data.applications.filter(a => a.id !== req.params.id);

  if (oldLength === data.applications.length) {
    return res.status(404).json({ message: "Application not found" });
  }

  writeData(data);
  res.json({ message: "Application deleted" });
});

app.listen(PORT, () => {
  console.log(`CareerCraft backend running at http://localhost:${PORT}`);
});
