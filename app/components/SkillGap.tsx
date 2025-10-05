// app/components/SkillGap.tsx
const SkillList = ({ title, skills, color }: { title: string; skills: string[]; color: string }) => (
  <div>
    <h4 className="font-semibold text-lg mb-2">{title}</h4>
    <div className="flex flex-wrap gap-2">
      {skills && skills.length > 0 ? (
        skills.map((skill, index) => (
          <span key={index} className={`bg-${color}-100 text-${color}-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded`}>{skill}</span>
        ))
      ) : (<p className="text-sm text-gray-500">No skills data available.</p>)}
    </div>
  </div>
);
export function SkillGap({ feedback }: { feedback: any }) {
  const skillAnalysis = feedback?.skill_gap;
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-2xl font-bold mb-4">Skill Gap Analysis</h3>
      <div className="space-y-6">
        <SkillList title="✅ Skills Found on Your Resume" skills={skillAnalysis?.found_skills} color="green" />
        <SkillList title="❌ Skills Missing for the Job" skills={skillAnalysis?.missing_skills} color="red" />
      </div>
    </div>
  );
}