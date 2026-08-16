import React, { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  Route,
  Routes,
  useNavigate,
  useParams
} from "react-router-dom";

import {
  createApplication,
  createResume,
  deleteApplication,
  deleteResume,
  getApplications,
  getDashboard,
  getResume,
  getResumes,
  getTemplates,
  updateApplication,
  updateResume
} from "./api";


function Layout({ children }) {
  return (
    <div className="app">

      <aside className="sidebar">

        <div className="brand">
          Career<span>Craft</span>
        </div>

        <nav>
          <NavLink to="/" end>
            Dashboard
          </NavLink>

          <NavLink to="/resumes">
            My Resumes
          </NavLink>

          <NavLink to="/templates">
            Templates
          </NavLink>

          <NavLink to="/applications">
            Applications
          </NavLink>
        </nav>

        <div className="sidebar-bottom">
          <small>Resume workspace</small>
          <strong>Build. Apply. Grow.</strong>
        </div>

      </aside>

      <main className="main">

        <header className="topbar">

          <span className="top-title">
            CareerCraft
          </span>

          <div className="profile">
            CC
          </div>

        </header>

        {children}

      </main>

    </div>
  );
}


/* ================= DASHBOARD ================= */

function Dashboard() {

  const [data, setData] = useState(null);

  useEffect(() => {

    getDashboard()
      .then(setData)
      .catch(console.error);

  }, []);

  if (!data) {
    return <PageLoading />;
  }

  const statuses = [
    "Saved",
    "Applied",
    "Interview",
    "Offer",
    "Rejected"
  ];

  return (
    <section className="page">

      <div className="hero">

        <div>

          <p className="eyebrow">
            YOUR WORKSPACE
          </p>

          <h1>
            Welcome back 👋
          </h1>

          <p className="muted">
            Manage your resumes and keep your job search organized.
          </p>

        </div>

        <Link
          className="primary-btn"
          to="/resumes/new"
        >
          + Create Resume
        </Link>

      </div>


      <div className="stats">

        <Stat
          label="Resumes"
          value={data.counts.resumes}
        />

        <Stat
          label="Applications"
          value={data.counts.applications}
        />

        <Stat
          label="Interviews"
          value={data.counts.interviews}
        />

        <Stat
          label="Offers"
          value={data.counts.offers}
        />

      </div>


      <div className="dashboard-grid">

        {/* Recent Resumes */}

        <div className="panel">

          <div className="panel-head">

            <h2>
              Recent resumes
            </h2>

            <Link to="/resumes">
              View all
            </Link>

          </div>


          {data.recentResumes.map((resume) => (

            <Link
              className="resume-row"
              to={`/resumes/${resume.id}`}
              key={resume.id}
            >

              <div className="file-icon">
                CV
              </div>

              <div>

                <strong>
                  {resume.title}
                </strong>

                <small>
                  {resume.template} template ·
                  Updated {resume.updatedAt}
                </small>

              </div>

              <span>
                ›
              </span>

            </Link>

          ))}

        </div>


        {/* Application Pipeline */}

        <div className="panel">

          <div className="panel-head">

            <h2>
              Application pipeline
            </h2>

            <Link to="/applications">
              Manage
            </Link>

          </div>


          <div className="pipeline">

            {statuses.map((status) => {

              const count =
                data.applications.filter(
                  (application) =>
                    application.status === status
                ).length;

              return (

                <div
                  className="pipeline-row"
                  key={status}
                >

                  <span>

                    <i
                      className={`dot ${status.toLowerCase()}`}
                    ></i>

                    {status}

                  </span>

                  <div className="bar">

                    <b
                      style={{
                        width: `${Math.min(
                          count * 25,
                          100
                        )}%`
                      }}
                    />

                  </div>

                  <strong>
                    {count}
                  </strong>

                </div>

              );

            })}

          </div>

        </div>

      </div>

    </section>
  );
}


function Stat({ label, value }) {

  return (

    <div className="stat">

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </div>

  );
}


/* ================= RESUMES ================= */

function Resumes() {

  const [resumes, setResumes] = useState([]);

  const load = () => {

    getResumes()
      .then(setResumes)
      .catch(console.error);

  };

  useEffect(() => {
    load();
  }, []);


  async function remove(id) {

    if (!confirm("Delete this resume?")) {
      return;
    }

    await deleteResume(id);

    load();
  }


  return (

    <section className="page">

      <div className="page-head">

        <div>

          <p className="eyebrow">
            DOCUMENTS
          </p>

          <h1>
            My Resumes
          </h1>

          <p className="muted">
            Create and manage different versions of your resume.
          </p>

        </div>

        <Link
          className="primary-btn"
          to="/resumes/new"
        >
          + New Resume
        </Link>

      </div>


      <div className="search-box">

        <input
          placeholder="Search resumes..."
        />

        <span>
          ⌕
        </span>

      </div>


      <div className="card-grid">

        {resumes.map((resume) => (

          <div
            className="resume-card"
            key={resume.id}
          >

            <div className="card-top">

              <div className="file-icon">
                CV
              </div>

              <button
                className="icon-btn"
                onClick={() => remove(resume.id)}
              >
                ⋮
              </button>

            </div>


            <h3>
              {resume.title}
            </h3>


            <div className="tags">

              <span>
                {resume.template}
              </span>

              <span>
                Resume
              </span>

            </div>


            <p>
              Updated {resume.updatedAt}
            </p>


            <Link
              className="secondary-btn full"
              to={`/resumes/${resume.id}`}
            >
              Open resume
            </Link>

          </div>

        ))}

      </div>

    </section>
  );
}


/* ================= RESUME BUILDER ================= */

function ResumeBuilder() {

  const { id } = useParams();

  const navigate = useNavigate();


  const [form, setForm] = useState({

    title: "",

    template: "Modern",

    personal: {

      name: "",
      email: "",
      phone: "",
      location: "",
      summary: ""

    },

    education: [],

    skills: [],

    projects: []

  });


  const [skillInput, setSkillInput] =
    useState("");


  const [message, setMessage] =
    useState("");


  useEffect(() => {

    if (id && id !== "new") {

      getResume(id)
        .then(setForm)
        .catch(console.error);

    }

  }, [id]);


  function updatePersonal(field, value) {

    setForm((prev) => ({

      ...prev,

      personal: {

        ...prev.personal,

        [field]: value

      }

    }));

  }


  function addSkill() {

    const skill = skillInput.trim();

    if (!skill) {
      return;
    }

    setForm((prev) => ({

      ...prev,

      skills: [
        ...prev.skills,
        skill
      ]

    }));

    setSkillInput("");
  }


  function removeSkill(index) {

    setForm((prev) => ({

      ...prev,

      skills: prev.skills.filter(
        (_, i) => i !== index
      )

    }));

  }


  async function save(e) {

    e.preventDefault();

    try {

      if (id && id !== "new") {

        await updateResume(id, form);

        setMessage(
          "Resume updated successfully."
        );

      } else {

        const created =
          await createResume(form);

        navigate(
          `/resumes/${created.id}`
        );

      }

    } catch (error) {

      setMessage(error.message);

    }

  }


  return (

    <section className="page builder-page">

      <div className="page-head">

        <div>

          <p className="eyebrow">
            RESUME BUILDER
          </p>

          <h1>
            {id === "new"
              ? "Create Resume"
              : "Edit Resume"}
          </h1>

        </div>

        <Link
          className="secondary-btn"
          to="/resumes"
        >
          Back
        </Link>

      </div>


      <form
        className="builder"
        onSubmit={save}
      >

        <div className="form-panel">

          <label>
            Resume title
          </label>

          <input
            value={form.title}
            onChange={(e) =>
              setForm({
                ...form,
                title: e.target.value
              })
            }
            placeholder="e.g. Java Developer Resume"
            required
          />


          <label>
            Template
          </label>

          <select
            value={form.template}
            onChange={(e) =>
              setForm({
                ...form,
                template: e.target.value
              })
            }
          >

            <option>
              Modern
            </option>

            <option>
              Classic
            </option>

            <option>
              Minimal
            </option>

          </select>


          <h2>
            Personal information
          </h2>


          <div className="two-col">

            <Input
              label="Full name"
              value={form.personal.name}
              onChange={(value) =>
                updatePersonal(
                  "name",
                  value
                )
              }
            />

            <Input
              label="Email"
              value={form.personal.email}
              onChange={(value) =>
                updatePersonal(
                  "email",
                  value
                )
              }
            />

            <Input
              label="Phone"
              value={form.personal.phone}
              onChange={(value) =>
                updatePersonal(
                  "phone",
                  value
                )
              }
            />

            <Input
              label="Location"
              value={form.personal.location}
              onChange={(value) =>
                updatePersonal(
                  "location",
                  value
                )
              }
            />

          </div>


          <label>
            Professional summary
          </label>

          <textarea
            rows="5"
            value={form.personal.summary}
            onChange={(e) =>
              updatePersonal(
                "summary",
                e.target.value
              )
            }
            placeholder="Write a short professional summary..."
          />


          <h2>
            Skills
          </h2>


          <div className="skill-input">

            <input
              value={skillInput}
              onChange={(e) =>
                setSkillInput(e.target.value)
              }
              placeholder="Java, React, SQL..."
              onKeyDown={(e) => {

                if (e.key === "Enter") {

                  e.preventDefault();

                  addSkill();

                }

              }}
            />

            <button
              type="button"
              className="secondary-btn"
              onClick={addSkill}
            >
              Add
            </button>

          </div>


          <div className="skill-list">

            {form.skills.map(
              (skill, index) => (

                <span key={index}>

                  {skill}

                  <button
                    type="button"
                    onClick={() =>
                      removeSkill(index)
                    }
                  >
                    ×
                  </button>

                </span>

              )
            )}

          </div>


          <div className="form-actions">

            <button
              className="primary-btn"
              type="submit"
            >
              Save Resume
            </button>

            {message && (

              <span className="success">
                {message}
              </span>

            )}

          </div>

        </div>


        <ResumePreview form={form} />

      </form>

    </section>
  );
}


function Input({
  label,
  value,
  onChange
}) {

  return (

    <div>

      <label>
        {label}
      </label>

      <input
        value={value || ""}
        onChange={(e) =>
          onChange(e.target.value)
        }
      />

    </div>

  );
}


/* ================= RESUME PREVIEW ================= */

function ResumePreview({ form }) {

  return (

    <div className="preview-wrap">

      <div className="preview">

        <div className="preview-header">

          <h1>
            {form.personal.name ||
              "Your Name"}
          </h1>

          <p>
            {form.personal.email ||
              "email@example.com"}

            {" · "}

            {form.personal.phone ||
              "Phone"}

            {" · "}

            {form.personal.location ||
              "Location"}
          </p>

        </div>


        <PreviewSection title="Summary">

          <p>
            {form.personal.summary ||
              "Your professional summary will appear here."}
          </p>

        </PreviewSection>


        <PreviewSection title="Skills">

          <p>
            {form.skills.length
              ? form.skills.join(" · ")
              : "Your skills"}
          </p>

        </PreviewSection>


        <PreviewSection title="Education">

          <p>
            Add your education details from the builder.
          </p>

        </PreviewSection>


        <PreviewSection title="Projects">

          <p>
            Add your important projects here.
          </p>

        </PreviewSection>

      </div>

    </div>

  );
}


function PreviewSection({
  title,
  children
}) {

  return (

    <div className="preview-section">

      <h3>
        {title}
      </h3>

      {children}

    </div>

  );
}


/* ================= TEMPLATES ================= */

function Templates() {

  const [templates, setTemplates] =
    useState([]);


  useEffect(() => {

    getTemplates()
      .then(setTemplates)
      .catch(console.error);

  }, []);


  return (

    <section className="page">

      <div className="page-head">

        <div>

          <p className="eyebrow">
            DESIGN LIBRARY
          </p>

          <h1>
            Templates
          </h1>

          <p className="muted">
            Choose a style and build your resume around it.
          </p>

        </div>

      </div>


      <div className="template-grid">

        {templates.map(
          (template, index) => (

            <div
              className={`template-card template-${index}`}
              key={template.id}
            >

              <div className="mock-resume">

                <div className="mock-name">
                  Your Name
                </div>

                <div className="mock-line long"></div>

                <div className="mock-line"></div>

                <div className="mock-line short"></div>

                <div className="mock-section"></div>

                <div className="mock-line long"></div>

                <div className="mock-line"></div>

                <div className="mock-line short"></div>

              </div>


              <h3>
                {template.name}
              </h3>

              <p>
                {template.description}
              </p>


              <Link
                className="primary-btn full"
                to="/resumes/new"
              >
                Use template
              </Link>

            </div>

          )
        )}

      </div>

    </section>
  );
}


/* ================= APPLICATIONS ================= */

function Applications() {

  const [applications, setApplications] =
    useState([]);


  const [form, setForm] =
    useState({

      company: "",
      role: "",
      status: "Saved"

    });


  const load = () => {

    getApplications()
      .then(setApplications)
      .catch(console.error);

  };


  useEffect(() => {

    load();

  }, []);


  async function add(e) {

    e.preventDefault();

    await createApplication(form);

    setForm({

      company: "",
      role: "",
      status: "Saved"

    });

    load();

  }


  async function changeStatus(
    id,
    status
  ) {

    await updateApplication(
      id,
      { status }
    );

    load();

  }


  async function remove(id) {

    await deleteApplication(id);

    load();

  }


  const statuses = [
    "Saved",
    "Applied",
    "Interview",
    "Offer",
    "Rejected"
  ];


  return (

    <section className="page">

      <div className="page-head">

        <div>

          <p className="eyebrow">
            JOB SEARCH
          </p>

          <h1>
            Applications
          </h1>

          <p className="muted">
            Track every opportunity from saved to final outcome.
          </p>

        </div>

      </div>


      <form
        className="application-form"
        onSubmit={add}
      >

        <input
          placeholder="Company"
          value={form.company}
          onChange={(e) =>
            setForm({
              ...form,
              company: e.target.value
            })
          }
          required
        />


        <input
          placeholder="Job role"
          value={form.role}
          onChange={(e) =>
            setForm({
              ...form,
              role: e.target.value
            })
          }
          required
        />


        <select
          value={form.status}
          onChange={(e) =>
            setForm({
              ...form,
              status: e.target.value
            })
          }
        >

          {statuses.map(
            (status) => (

              <option
                key={status}
              >
                {status}
              </option>

            )
          )}

        </select>


        <button className="primary-btn">
          Track
        </button>

      </form>


      <div className="kanban">

        {statuses.map(
          (status) => (

            <div
              className="column"
              key={status}
            >

              <div className="column-head">

                <span>

                  <i
                    className={`dot ${status.toLowerCase()}`}
                  ></i>

                  {status}

                </span>

                <b>
                  {
                    applications.filter(
                      (a) =>
                        a.status === status
                    ).length
                  }
                </b>

              </div>


              {applications
                .filter(
                  (a) =>
                    a.status === status
                )
                .map((app) => (

                  <div
                    className="application-card"
                    key={app.id}
                  >

                    <button
                      className="delete"
                      onClick={() =>
                        remove(app.id)
                      }
                    >
                      ×
                    </button>


                    <h3>
                      {app.company}
                    </h3>

                    <p>
                      {app.role}
                    </p>

                    <small>
                      {app.date}
                    </small>


                    <select
                      value={app.status}
                      onChange={(e) =>
                        changeStatus(
                          app.id,
                          e.target.value
                        )
                      }
                    >

                      {statuses.map(
                        (status) => (

                          <option
                            key={status}
                          >
                            {status}
                          </option>

                        )
                      )}

                    </select>

                  </div>

                ))}

            </div>

          )
        )}

      </div>

    </section>
  );
}


/* ================= LOADING ================= */

function PageLoading() {

  return (

    <div className="loading">
      Loading...
    </div>

  );

}


/* ================= ROUTES ================= */

function App() {

  return (

    <Layout>

      <Routes>

        <Route
          path="/"
          element={<Dashboard />}
        />

        <Route
          path="/resumes"
          element={<Resumes />}
        />

        <Route
          path="/resumes/new"
          element={<ResumeBuilder />}
        />

        <Route
          path="/resumes/:id"
          element={<ResumeBuilder />}
        />

        <Route
          path="/templates"
          element={<Templates />}
        />

        <Route
          path="/applications"
          element={<Applications />}
        />

      </Routes>

    </Layout>

  );
}


export default App;
