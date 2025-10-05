// app/components/CareerPath.tsx

import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";

interface CareerPathProps {
    feedback: any;
}

interface Path {
    title: string;
    description: string;
    skills_to_develop: string[];
}

export function CareerPath({ feedback }: CareerPathProps) {
    const { ai } = usePuterStore();
    const [paths, setPaths] = useState<Path[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCareerPaths = async () => {
            setIsLoading(true);
            const prompt = `
                Based on the skills and experience evident in this resume analysis, suggest 3 potential future career paths.
                For each path, provide a title, a brief description, and a list of 2-3 key skills the user should focus on developing to achieve that role.

                Resume Analysis:
                ${JSON.stringify(feedback)}

                Return your response as a single, valid JSON object with a "career_paths" key, which is an array of objects.
                Example format:
                {
                  "career_paths": [
                    {
                      "title": "Senior Front-End Developer",
                      "description": "Focus on deep expertise in a specific framework and mentoring junior developers.",
                      "skills_to_develop": ["State Management (Redux/Zustand)", "Performance Optimization", "Team Leadership"]
                    }
                  ]
                }
            `;
            
            try {
                const response = await ai.chat(prompt);
                if (response?.message?.content) {
                    const result = JSON.parse(response.message.content as string);
                    setPaths(result.career_paths || []);
                }
            } catch (error) {
                console.error("Failed to fetch career paths:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCareerPaths();
    }, [feedback, ai]);

   return (
        // --- THIS IS THE FIX ---
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm mt-8">
            <h3 className="text-2xl font-bold mb-4">Potential Career Paths</h3>
            
            {isLoading && <p className="text-gray-500">Analyzing future career opportunities...</p>}

            {!isLoading && paths.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {paths.map((path, index) => (
                        <div key={index} className="border rounded-lg p-4 bg-gray-50">
                            <h4 className="text-lg font-bold text-blue-600">{path.title}</h4>
                            <p className="text-sm text-gray-600 mt-2">{path.description}</p>
                            <div className="mt-4">
                                <p className="font-semibold text-sm text-gray-800">Skills to Develop:</p>
                                <ul className="list-disc list-inside mt-1 space-y-1 text-sm text-gray-500">
                                    {path.skills_to_develop.map((skill, i) => (
                                        <li key={i}>{skill}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!isLoading && paths.length === 0 && (
                <p className="text-gray-500">Could not generate career path recommendations at this time.</p>
            )}
        </div>
    );
}