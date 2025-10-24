// app/routes/api.jobs.ts
import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

interface Job {
  title: string;
  company_name: string;
  location: string;
  link: string;
}

export async function action({ request }: ActionFunctionArgs) {
  console.log("Received request on /api/jobs");
  try {
    const { title, skills } = await request.json();
    console.log("Received from client:", { title, skills });

    if (!title || !skills) {
      return json({ error: "Missing title or skills" }, { status: 400 });
    }

    const apiKey = process.env.SERPAPI_API_KEY;
    if (!apiKey) {
      console.error("SERPAPI_API_KEY is not set in .env on the server!");
      return json({ error: "API key is not configured" }, { status: 500 });
    }

    const searchQuery = `${title} ${skills.join(" ")}`;
    const url = new URL("https://serpapi.com/search");
    url.searchParams.append("engine", "google_jobs");
    url.searchParams.append("q", searchQuery);
    url.searchParams.append("google_domain", "google.co.in");
    url.searchParams.append("location", "India");
    url.searchParams.append("api_key", apiKey);

    console.log("Calling SerpApi with URL:", url.href.replace(apiKey, "REDACTED"));
    const response = await fetch(url.toString());
    
    // --- ADDED ERROR LOGGING ---
    if (!response.ok) {
        const errorText = await response.text();
        console.error("SerpApi request failed:", { status: response.status, body: errorText });
        throw new Error(`SerpApi request failed. Check your API key and credits.`);
    }
    // --- END ADDED LOGGING ---

    const data = await response.json();
    
    // --- ADDED LOGGING FOR "NO RESULTS" ---
    if (data.error) {
        console.error("SerpApi returned an error:", data.error);
        return json({ jobs: [] });
    }
    
    if (!data.jobs_results || data.jobs_results.length === 0) {
      console.log("No job results found from SerpApi for query:", searchQuery);
      return json({ jobs: [] });
    }
    // --- END ADDED LOGGING ---

    const transformedJobs: Job[] = data.jobs_results
      .slice(0, 5)
      .map((job: any) => ({
        title: job.title,
        company_name: job.company_name,
        location: job.location,
        link: job.apply_link || job.related_links?.[0]?.link || job.share_link,
      }));

    console.log(`Successfully transformed ${transformedJobs.length} jobs.`);
    return json({ jobs: transformedJobs });

  } catch (error: any) {
    console.error("Job API route error:", error);
    return json({ error: error.message || "Failed to fetch jobs" }, { status: 500 });
  }
}

export function loader() {
  return json({ error: "Method not allowed" }, { status: 405 });
}
