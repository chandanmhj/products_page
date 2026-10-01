// To add a product: copy one object below, change the text, and give it a new unique id.
export const PRODUCTS = [
  {
    id: "repo-reader",
    num: "01",
    kind: "Developer tool · AI",
    name: "Repo Reader",
    alt: "repo-reader · Web app",
    stack: "FastAPI · React · Groq · Supabase",
    short: "Paste a public GitHub repo and get an architecture diagram, a plain-English description, and a technical explanation of how the code works.",
    what: "Repo Reader reads every code file in a public GitHub repository and turns it into a labeled architecture diagram, a plain-English project description, and a technical explanation of how the code fits together.",
    who: "Students, interviewers, and developers who need to understand an unfamiliar codebase quickly.",
    steps: [
      "Paste a public GitHub link.",
      "The backend downloads the repo and maps modules, imports, API calls, data models, and external services.",
      "An AI model writes the description and explanation from those facts only, so nothing is invented.",
      "Download the diagram as PNG or SVG.",
    ],
    tech: "FastAPI, React, Mermaid, Groq, Supabase, Razorpay.",
    url: "https://reporeader.products.chandanmhj.in",
    cta: "Launch Repo Reader ↗",
  },
];
