import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/resumeCard";
import { usePuterStore } from "~/lib/puter";
import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";

/* ================= TYPES ================= */

interface Resume {
  id: string;
  companyName: string;
  jobTitle: string;
  resumeUrl: string;
  imagePath: string;
  feedback: {
    overallScore: number;
  };
}

interface KVItem {
  key: string;
  value: string;
}

/* ================= META ================= */

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "Smart feedback for your dream job!" },
  ];
}

/* ================= COMPONENT ================= */

export default function Home() {
  const { auth, kv } = usePuterStore();
  const navigate = useNavigate();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);

  /* 🔐 AUTH CHECK */
  useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate("/auth?next=/");
    }
  }, [auth.isAuthenticated, navigate]);

  /* 📂 LOAD RESUMES */
  useEffect(() => {
    const loadResumes = async () => {
      try {
        setLoadingResumes(true);

        const data = (await kv.list("resume:*", true)) as KVItem[];

        const parsedResumes = data
          ?.map((item) => {
            try {
              return JSON.parse(item.value) as Resume;
            } catch (err) {
              console.error("Invalid JSON:", item.value);
              return null;
            }
          })
          .filter(Boolean) as Resume[];

        setResumes(parsedResumes || []);
      } catch (error) {
        console.error("Failed to load resumes:", error);
      } finally {
        setLoadingResumes(false);
      }
    };

    loadResumes();
  }, [kv]);

  /* ================= UI ================= */

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen">
      <Navbar />

      <section className="main-section">
        {/* HEADER */}
        <div className="page-heading py-16 text-center">
          <h1 className="text-3xl font-bold">
            Track Your Applications & Resume Ratings
          </h1>

          {!loadingResumes && resumes.length === 0 ? (
            <h2 className="mt-2 text-gray-500">
              No resumes found. Upload your first resume to get feedback.
            </h2>
          ) : (
            <h2 className="mt-2 text-gray-500">
              Review your submissions and check AI-powered feedback.
            </h2>
          )}
        </div>

        {/* LOADING */}
        {loadingResumes && (
          <div className="flex flex-col items-center justify-center">
            <img
              src="/images/resume-scan-2.gif"
              className="w-[200px]"
              alt="Loading"
            />
            <p className="mt-2 text-gray-500">Analyzing resumes...</p>
          </div>
        )}

        {/* RESUME LIST */}
        {!loadingResumes && resumes.length > 0 && (
          <div className="resumes-section grid gap-6 md:grid-cols-2 lg:grid-cols-3 px-6">
            {resumes.map((resume) => (
              <ResumeCard key={resume.id} {...resume} />
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loadingResumes && resumes.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-10 gap-4">
            <Link
              to="/upload"
              className="primary-button w-fit text-xl font-semibold"
            >
              Upload Resume
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}