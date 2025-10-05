// app/routes/home.tsx

import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import { usePuterStore } from "~/lib/puter";
import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "SkillFit" },
    { name: "description", content: "Smart feedback for your dream job!" },
  ];
}

const GettingStartedStyles = () => (
    <style>{`
        .feature-grid-container {
            width: 100%;
            max-width: 80rem;
            margin-left: auto;
            margin-right: auto;
            padding-left: 1rem;
            padding-right: 1rem;
            text-align: center;
            margin-top: 0;
            animation: fadeIn 1s ease-in-out;
        }
       .feature-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: center; /* Centers the group of cards */
    gap: 2rem;
    margin-top: 4rem;
}

/* This NEW rule targets the cards inside the grid */
.feature-grid > div {
    flex-basis: 320px; /* Sets a starting width for each card */
    flex-grow: 1;       /* Allows cards to grow to fill empty space */
    max-width: 400px;   /* Prevents cards from getting too wide on large screens */
}
        @media (min-width: 640px) { .feature-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (min-width: 1024px) { .feature-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
        .analyze-button-spacing { margin-top: 6rem !important; display: inline-block; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    `}</style>
);

const FeatureCard = ({ icon, title, description }: { icon: string, title: string, description:string }) => (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100 flex flex-col items-center text-center">
        <div className="flex-shrink-0 flex items-center justify-center h-16 w-16 bg-blue-100 rounded-full">
            <img src={`/icons/${icon}`} alt={title} className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold mt-5 text-gray-800">{title}</h3>
        <p className="mt-2 text-gray-500">{description}</p>
    </div>
);

export default function Home() {
  const { auth, kv } = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);

  useEffect(() => { if(!auth.isAuthenticated) navigate('/auth?next=/'); }, [auth.isAuthenticated]);

  useEffect(() => {
    const loadResumes = async () => {
      setLoadingResumes(true);
      try {
        const resumeItems = (await kv.list('resume:*', true)) as KVItem[];
        const parsedResumes = resumeItems?.map((item) => JSON.parse(item.value) as Resume);
        setResumes(parsedResumes || []);
      } catch (error) { console.error("Failed to load resumes", error) }
      finally { setLoadingResumes(false); }
    }
    loadResumes();
  }, []);

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen">
      <GettingStartedStyles />
      <Navbar />
      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Track Your Applications & Resume Ratings</h1>
          {resumes.length > 0 && <h2>Review your submissions and check AI-powered feedback.</h2>}
        </div>
        {loadingResumes && (<div className="flex flex-col items-center justify-center"><img src="/images/resume-scan-2.gif" className="w-[200px]" /></div>)}
        {!loadingResumes && resumes.length > 0 && (
          <div className="resumes-section">{resumes.map((resume) => (<ResumeCard key={resume.id} resume={resume} />))}</div>
        )}
        {!loadingResumes && resumes.length === 0 && (
            <div className="feature-grid-container">
              <h2 className="text-4xl font-bold text-gray-800">Unlock Your Career Potential</h2>
              <p className="text-xl text-gray-500 mt-3 max-w-2xl mx-auto">Our suite of AI-powered tools is designed to help you land your dream job. Here's how:</p>
              <div className="feature-grid">
                <FeatureCard icon="skill-gap.svg" title="Skill Gap Analysis" description="Compare your resume against any job description to instantly see which skills you're missing." />
                <FeatureCard icon="chatbot.svg" title="AI Career Assistant" description="Ask our chatbot anything about your resume feedback, from improving sections to clarifying tips." />
                <FeatureCard icon="career-path.svg" title="Job Recommendations" description="Get tailored job suggestions and explore potential career paths that match your skills." />
              </div>
              <Link to="/upload" className="primary-button w-fit text-xl font-semibold analyze-button-spacing">Analyze Your First Resume</Link>
            </div>
        )}
      </section>
    </main>
  );
}