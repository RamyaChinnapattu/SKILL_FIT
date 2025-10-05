// app/components/JobRecommendations.tsx
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";

interface JobRecommendationsProps { feedback: any; }
interface Job { title: string; company_name: string; location: string; link: string; }

export function JobRecommendations({ feedback }: JobRecommendationsProps) {
    const { ai } = usePuterStore();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [status, setStatus] = useState("idle");

    useEffect(() => {
        const fetchAndGenerateJobs = async () => {
            setStatus("loading");
            try {
                const keywordPrompt = `Based on this resume analysis, extract the most relevant job title and up to 5 key skills for a job search. Return a single, valid JSON object with this structure: { "title": "string", "skills": ["string"] } Resume Analysis: ${JSON.stringify(feedback)}`;
                const keywordResponse = await ai.chat(keywordPrompt);
                if (!keywordResponse?.message?.content) throw new Error("Could not extract keywords.");
                const { title, skills } = JSON.parse(keywordResponse.message.content as string);
                const jobGenerationPrompt = `You are a job recommendation engine. Based on the job title "${title}" and skills like "${skills.join(", ")}", create a list of 5 realistic, example job postings from plausible companies. Return a single, valid JSON object with a "jobs" key, which is an array of objects. Example: { "jobs": [{ "title": "Senior React Developer", "company_name": "Tech Solutions Inc.", "location": "San Francisco, CA" }] }`;
                const jobResponse = await ai.chat(jobGenerationPrompt);
                if (!jobResponse?.message?.content) throw new Error("Could not generate jobs.");
                const generatedJobs = JSON.parse(jobResponse.message.content as string);
                const jobsWithLinks = generatedJobs.jobs.map((job: Job) => ({ ...job, link: `https://www.google.com/search?q=${encodeURIComponent(job.title + " " + job.company_name)}` }));
                setJobs(jobsWithLinks || []);
                setStatus("idle");
            } catch (error) {
                console.error("Job recommendation error:", error);
                setStatus("error");
            }
        };
        fetchAndGenerateJobs();
    }, [feedback, ai]);

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm mt-8">
            <h3 className="text-2xl font-bold mb-4">Example Job Postings For You</h3>
            {status === 'loading' && (<p className="text-gray-500">Generating relevant job examples...</p>)}
            {status === 'idle' && jobs.length > 0 && (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {jobs.map((job, index) => (
                        <a key={index} href={job.link} target="_blank" rel="noopener noreferrer" className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <h4 className="font-bold text-blue-600">{job.title}</h4>
                            <p className="font-semibold text-gray-800">{job.company_name}</p>
                            <p className="text-sm text-gray-600">{job.location}</p>
                        </a>
                    ))}
                </div>
            )}
            {(status === 'error' || (status === 'idle' && jobs.length === 0)) && (<p className="text-gray-500">Could not generate job recommendations at this time.</p>)}
        </div>
    );
}