// app/routes/resume.tsx

import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";
import { SkillGap } from "~/components/SkillGap";
import { Chatbot } from "~/components/Chatbot";
import { JobRecommendations } from "~/components/JobRecommendations";
import { CareerPath } from "~/components/CareerPath";

export const meta = () => ([
    { title: 'SkillFit | Review ' },
    { name: 'description', content: 'Detailed overview of your resume' },
]);

const Resume = () => {
    const { auth, isLoading, fs, kv } = usePuterStore();
    const { id } = useParams();
    const [imageUrl, setImageUrl] = useState('');
    const [resumeUrl, setResumeUrl] = useState('');
    const [feedback, setFeedback] = useState<any | null>(null);
    const navigate = useNavigate();
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isInterviewOpen, setIsInterviewOpen] = useState(false);

    useEffect(() => {
        if(!isLoading && !auth.isAuthenticated) navigate(`/auth?next=/resume/${id}`);
    }, [isLoading, auth.isAuthenticated, navigate, id]);

    useEffect(() => {
        const loadResume = async () => {
            if (!id) return;
            const resume = await kv.get(`resume:${id}`);
            if(!resume) return;
            const data = JSON.parse(resume);
            setFeedback(data.feedback);

            if (data.resumePath) {
                const resumeBlob = await fs.read(data.resumePath);
                if(resumeBlob) {
                    const pdfBlob = new Blob([resumeBlob], { type: 'application/pdf' });
                    const resumeObjUrl = URL.createObjectURL(pdfBlob);
                    setResumeUrl(resumeObjUrl);
                }
            }
            
            if (data.imagePath) {
                const imageBlob = await fs.read(data.imagePath);
                if(imageBlob) {
                    const imageUrlObj = URL.createObjectURL(imageBlob);
                    setImageUrl(imageUrlObj);
                }
            }
        };
        loadResume();
    }, [id, fs, kv]);

    return (
        <div className="relative">
            <main className="!pt-0">
                <nav className="resume-nav">
                    <Link to="/" className="back-button">
                        <img src="/icons/back.svg" alt="logo" className="w-2.5 h-2.5" />
                        <span className="text-gray-800 text-sm font-semibold">Back to Homepage</span>
                    </Link>
                </nav>
                <div className="flex flex-row w-full max-lg:flex-col-reverse">
                    <section className="feedback-section bg-[url('/images/bg-small.svg')] bg-cover h-[100vh] sticky top-0 items-center justify-center">
                        {imageUrl && resumeUrl && (
                            <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-wxl:h-fit w-fit">
                                <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                                    <img src={imageUrl} className="w-full h-full object-contain rounded-2xl" title="resume"/>
                                </a>
                            </div>
                        )}
                    </section>
                    <section className="feedback-section">
                        <h2 className="text-4xl !text-black font-bold">Resume Review</h2>
                        {feedback ? (
                            <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
                                <Summary feedback={feedback} />
                                <ATS score={feedback.ATS?.score || 0} suggestions={feedback.ATS?.tips || []} />
                                <Details feedback={feedback} />
                                <SkillGap feedback={feedback} />
                                <JobRecommendations feedback={feedback} />
                                <CareerPath feedback={feedback} />
                            </div>
                        ) : (
                            <img src="/images/resume-scan-2.gif" className="w-full" />
                        )}
                    </section>
                </div>
            </main>
            {feedback && (
                <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-4">
                    {isChatOpen && (
                        <div className="absolute bottom-20 right-0 animate-in slide-in-from-bottom duration-500">
                           <Chatbot feedback={feedback} onClose={() => setIsChatOpen(false)} />
                        </div>
                    )}
                    <div className="flex flex-col items-end space-y-4">
                        <button onClick={() => setIsChatOpen(prev => !prev)} className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-transform duration-200 hover:scale-110" aria-label="Toggle Chatbot">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-10 10c0 4.411 2.865 8.165 6.721 9.431.141 1.229.539 2.336 1.169 3.287l1.11 1.282A1 1 0 0 0 12 26a1 1 0 0 0 .721-.302l1.11-1.282c.63-.951 1.028-2.058 1.169-3.287C19.135 20.165 22 16.411 22 12A10 10 0 0 0 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/><path d="M7 11h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/></svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Resume;
