// app/components/JobRecommendations.tsx
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";

interface JobRecommendationsProps {
  feedback: any;
}
interface Job {
  title: string;
  company_name: string;
  location: string;
  link: string;
}

export function JobRecommendations({ feedback }: JobRecommendationsProps) {
  const { ai } = usePuterStore();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    const fetchAndGenerateJobs = async () => {
      setStatus("loading");
      try {
        // --- STEP 1: Still use AI to get keywords from the resume ---
        const keywordPrompt = `Based on this resume analysis, extract the most relevant job title and up to 5 key skills for a job search. Return a single, valid JSON object with this structure: { "title": "string", "skills": ["string"] } Resume Analysis: ${JSON.stringify(
          feedback
        )}`;
        const keywordResponse = await ai.chat(keywordPrompt);
        if (!keywordResponse?.message?.content) {
          throw new Error("Could not extract keywords from AI.");
        }
        const { title, skills } = JSON.parse(
          keywordResponse.message.content as string
        );

        // --- BROWSER LOG 1 ---
        console.log("Extracted from AI:", { title, skills });

        if (!title || !skills || skills.length === 0) {
          throw new Error("AI did not return valid title or skills.");
        }

        // --- STEP 2: Fetch REAL jobs from our new server route ---
        const jobResponse = await fetch("/api/jobs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title, skills }),
        });

        const responseText = await jobResponse.text(); // Get response as text to avoid JSON parse error on empty/HTML response
        
        // --- BROWSER LOG 2 ---
        console.log("Response from /api/jobs:", {
            status: jobResponse.status,
            statusText: jobResponse.statusText,
            body: responseText,
        });

        if (!jobResponse.ok) {
          throw new Error(`Failed to fetch jobs. Server responded with: ${responseText}`);
        }
        
        const data = JSON.parse(responseText);

        if (data.error) {
          throw new Error(data.error);
        }

        // --- BROWSER LOG 3 ---
        console.log("Jobs received from server:", data.jobs);
        setJobs(data.jobs || []);
        setStatus("idle");
        
      } catch (error) {
        // --- BROWSER LOG 4 (Error) ---
        console.error("Job recommendation error in component:", error);
        setStatus("error");
      }
    };

    fetchAndGenerateJobs();
  }, [feedback, ai]);

  // ... (rest of the return statement is the same)
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm mt-8">
      <h3 className="text-2xl font-bold mb-4">Real Job Postings For You</h3>
      {status === "loading" && (
        <p className="text-gray-500">
          Searching for real job postings...
        </p>
      )}
      {status === "idle" && jobs.length > 0 && (
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {jobs.map((job, index) => (
            <a
              key={index}
              href={job.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h4 className="font-bold text-blue-600">{job.title}</h4>
              <p className="font-semibold text-gray-800">
                {job.company_name}
              </p>
              <p className="text-sm text-gray-600">{job.location}</p>
            </a>
          ))}
        </div>
      )}
      {(status === "error" || (status === "idle" && jobs.length === 0)) && (
        <p className="text-gray-500">
          Could not find relevant job postings at this time.
        </p>
      )}
    </div>
  );
}
