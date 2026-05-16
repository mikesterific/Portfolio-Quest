import type { ProjectData, SkillData, ResumeData } from "@/types/game";

// Sample portfolio data - replace with your actual data
export const portfolioData = {
  projects: [
    {
      id: "portfolio-quest",
      title: "Portfolio Quest",
      description:
        "Interactive 3D portfolio experience combining Vue 3, Three.js, and Phaser for an immersive space-themed showcase of skills and projects.",
      technologies: ["Vue 3", "TypeScript", "Three.js", "Phaser", "Vite", "Jest"],
      type: "game" as const,
      demoUrl: "#",
      image: "assets/images/portfolio/portfolio-quest.jpg",
    },
    {
      id: "ea-support-home",
      title: "EA Support Home Page",
      description:
        "Clean, user-focused design for EA's support portal home page. Prioritized intuitive navigation and quick access to key support functions with a modern, game-inspired aesthetic.",
      technologies: ["HTML5", "CSS3", "JavaScript", "UX Design", "Salesforce"],
      type: "web" as const,
      demoUrl: "#",
      image: "assets/images/portfolio/ea-home.jpg",
    },
    {
      id: "ea-support-site",
      title: "EA Support Site",
      description:
        "Design contributions for EA's internal support site during a greenfield rebuild, alongside architectural responsibilities.",
      technologies: ["Salesforce", "AWS", "JavaScript", "CSS3"],
      type: "web" as const,
      image: "assets/images/portfolio/ea-support-site.jpg", // Add your image path
    },
    {
      id: "decision-tree-logo",
      title: "Decision Tree – Logo Design",
      description:
        "Two-color print design that visually mimicked full-color output—economical and clever.",
      technologies: ["Branding", "Logo Design"],
      type: "web" as const,
      image: "assets/images/portfolio/decision-tree-logo.jpg", // Add your image path
    },
    {
      id: "dell-home-poc",
      title: "Dell Home Proof of Concept",
      description:
        "Foundational POC for Dell's homepage which influenced the design and layout of the global production homepage.",
      technologies: ["HTML5", "CSS3", "JavaScript"],
      type: "web" as const,
      image: "assets/images/portfolio/dell-home-poc.jpg", // Add your image path
    },
    {
      id: "dell-home-live",
      title: "Dell Home Page (Live Site)",
      description:
        "Greenfield architecture deployed globally in under 30 days, built collaboratively with Dell tiger teams across countries.",
      technologies: ["AngularJS", "ASP.NET MVC", "Performance", "Micro Frontends"],
      type: "web" as const,
      image: "assets/images/portfolio/dell-home-live.jpg", // Add your image path
    },
    {
      id: "dell-xps-poc",
      title: "Dell XPS Proof of Concept",
      description:
        "Visionary UI prototype showcasing Dell's front-end capabilities. Sparked Dell's premium branding initiative and inspired a broader digital transformation.",
      technologies: ["HTML5", "CSS3", "JavaScript", "Performance"],
      type: "web" as const,
      image: "assets/images/portfolio/dell-xps-poc.jpg", // Add your image path
    },
    {
      id: "citi-flash-ux",
      title: "Citi Flash + UX Work",
      description:
        "Initially hired as a designer; rapidly transitioned into Flash development during the period when Flash was industry-standard.",
      technologies: ["Flash", "ActionScript", "UX"],
      type: "web" as const,
      image: "assets/images/portfolio/citi-flash-ux.jpg", // Add your image path
    },
    {
      id: "bcbs-data-ux",
      title: "BCBS Data UX Redesign",
      description:
        "Redesign focused on simplifying complex data into digestible, intuitive UX patterns. Widely praised internally.",
      technologies: ["JavaScript", "Data Visualization", "UX"],
      type: "web" as const,
      image: "assets/images/portfolio/bcbs-data-ux.jpg", // Add your image path
    },
    {
      id: "dell-xps-landing",
      title: "Dell XPS Landing Page",
      description:
        "Launched after leadership buy-in from the POC. Implemented with Dell's internal design team as part of a modernized brand strategy.",
      technologies: ["HTML5", "CSS3", "JavaScript"],
      type: "web" as const,
      image: "assets/images/portfolio/dell-xps-landing.jpg", // Add your image path
    },
    {
      id: "bizatomic-logo",
      title: "BizAtomic – Logo Design",
      description:
        "Energetic branding concept with bold lines and a tight color palette for a startup launch.",
      technologies: ["Branding", "Logo Design"],
      type: "web" as const,
      image: "assets/images/portfolio/bizatomic-logo.jpg", // Add your image path
    },
  ] as ProjectData[],

  skills: [
    {
      id: "frontend",
      name: "Frontend Development Station",
      category: "frontend" as const,
      level: 5,
      icon: "💻",
      description:
        "Building high-performance modern user interfaces focused on responsiveness, usability, scalability, and exceptional user experience.",
      coreSkills: [
        "Vue.js",
        "React",
        "Angular",
        "TypeScript",
        "Responsive design",
        "Accessibility",
        "UI architecture",
        "Performance optimization",
        "Component systems",
        "Animation systems",
      ],
      careerHighlights: [
        "20+ years building production web applications",
        "Led front-end systems for enterprise-scale platforms",
        "Specialized in Web Vitals and Lighthouse optimization",
        "Built scalable reusable UI ecosystems",
        "Published author on HTML5 performance optimization",
        "Delivered high-impact UX improvements across major organizations",
      ],
      flavorText: "Fast UI feels like magic. Slow UI feels like betrayal.",
    },
    {
      id: "testing",
      name: "Testing Systems Platform",
      category: "testing" as const,
      level: 5,
      icon: "🧪",
      description:
        "Built scalable testing strategies and automated validation systems for enterprise applications and real-time architectures.",
      coreSkills: [
        "End-to-end testing",
        "Component testing",
        "Test automation",
        "Cypress architecture",
        "Jest testing",
        "CI validation",
        "Real-time system testing",
        "Performance regression testing",
      ],
      technologies: ["Cypress", "Jest", "Mocha", "Chai", "Node.js", "Vue Test Utils"],
      careerHighlights: [
        "Built automated testing systems for large-scale enterprise applications",
        "Developed testing workflows for real-time socket architectures",
        "Created repeatable validation pipelines for UI and platform stability",
        "Improved reliability through performance-focused testing strategies",
        "Integrated testing into rapid development iteration workflows",
      ],
      flavorText: "Trust is good. Automated regression testing is better.",
    },
    {
      id: "architecture",
      name: "Architecture Hub",
      category: "architecture" as const,
      level: 5,
      icon: "🏗",
      description:
        "Designed high-performance scalable systems spanning front-end architecture, real-time infrastructure, performance engineering, and enterprise platform modernization.",
      coreSkills: [
        "Front-end architecture",
        "Real-time systems",
        "Micro front-ends",
        "Performance engineering",
        "Scalability",
        "Distributed UI systems",
        "Web Vitals optimization",
        "Enterprise modernization",
      ],
      technologies: [
        "Vue",
        "React",
        "Angular",
        "Node.js",
        "Socket.IO",
        "Next.js",
        "Postgres",
        "Grafana",
      ],
      careerHighlights: [
        "Improved page-load performance by 400%",
        "Reduced page weight by 90%",
        "Increased conversion rates by 30%",
        "Built scalable real-time enterprise VM management systems",
        "Designed reusable component ecosystems",
        "Integrated observability systems using Grafana and TimescaleDB",
      ],
      flavorText:
        "Architecture is where performance, scalability, and sanity negotiate a peace treaty.",
    },
    {
      id: "tooling",
      name: "Tooling Platform",
      category: "tooling" as const,
      level: 5,
      icon: "🛠",
      description:
        "Built internal tooling, developer workflows, and engineering systems focused on productivity, automation, testing, and scalable development operations.",
      coreSkills: [
        "AI-assisted development pipelines",
        "Developer tooling architecture",
        "Testing systems and automation",
        "CI/CD workflow optimization",
        "Component systems",
        "Internal platform engineering",
        "LLM coding harnesses",
        "Workflow acceleration",
      ],
      technologies: [
        "Vue",
        "Node.js",
        "Jest",
        "Cypress",
        "Socket.IO",
        "Vite",
        "TypeScript",
        "GitHub Actions",
      ],
      careerHighlights: [
        "Built AI-assisted coding harnesses to accelerate development and debugging",
        "Created tooling pipelines for automated testing and iteration",
        "Developed RAG systems for internal engineering knowledge retrieval",
        "Improved developer efficiency through reusable architecture patterns",
        "Designed scalable component workflows for enterprise applications",
      ],
      flavorText:
        "The engineers who build tools for other engineers eventually become force multipliers.",
    },
    {
      id: "ai",
      name: "AI Research Station",
      category: "ai" as const,
      level: 4,
      icon: "🤖",
      description:
        "Exploring practical applications of Large Language Models, agentic workflows, memory systems, and AI-enhanced development.",
      coreSkills: [
        "LLM application development",
        "Retrieval-Augmented Generation (RAG)",
        "Prompt engineering",
        "Agentic workflows",
        "AI orchestration",
        "Conversational interfaces",
        "AI-assisted development",
        "Memory-bank systems",
      ],
      technologies: [
        "OpenAI APIs",
        "RAG Pipelines",
        "Vector Search",
        "Node.js",
        "Vue",
        "Python",
        "AI Agents",
      ],
      careerHighlights: [
        "Built AI-powered applications across web, iOS, Apple Watch, and macOS",
        "Developed enterprise RAG systems for querying company knowledge bases",
        "Created agentic workflow prototypes with persistent memory concepts",
        "Integrated AI into testing, debugging, and development pipelines",
        "Built experimental AI-driven gaming and simulation projects",
      ],
      flavorText: "Researching the strange new worlds where software starts collaborating back.",
    },

    {
      id: "security",
      name: "Security Fortress",
      category: "security" as const,
      level: 4,
      icon: "🛡",
      description:
        "Designed and maintained secure enterprise-grade web architectures with continuous focus on application security, safe data handling, and hardened front-end/backend systems.",
      coreSkills: [
        "Secure front-end architecture",
        "OWASP best practices",
        "XSS prevention",
        "CSRF mitigation",
        "SQL injection prevention",
        "Authentication/session handling",
        "Secure API communication",
        "Enterprise security compliance awareness",
        "Secure socket communication",
        "Dependency and vulnerability awareness",
      ],
      technologies: [
        "HTTPS/TLS",
        "Node.js",
        "Vue",
        "React",
        "JWT/Auth Systems",
        "Secure Cookies",
        "CSP",
        "Socket.IO",
      ],
      careerHighlights: [
        "Worked on enterprise-scale platforms requiring strict security standards",
        "Applied secure coding practices across front-end and Node.js systems",
        "Designed real-time systems with secure socket communication",
        "Maintained secure authentication/session workflows",
        "Participated in ongoing security-focused engineering training and hardening efforts",
        "Built architectures designed to reduce attack surfaces and improve resilience",
      ],
      flavorText:
        "The best security systems are invisible when they work... and catastrophic when they do not.",
    },
    {
      id: "leadership",
      name: "Leadership Center",
      category: "leadership" as const,
      level: 5,
      icon: "🏛",
      description:
        "Led architecture initiatives, mentored engineering teams, and drove technical strategy across enterprise-scale organizations.",
      coreSkills: [
        "Technical leadership",
        "Architecture strategy",
        "Cross-team collaboration",
        "Mentorship",
        "Performance optimization",
        "Systems thinking",
        "Greenfield architecture",
        "Technical decision-making",
      ],
      technologies: ["Dell", "Microsoft", "EA", "Scale Computing"],
      careerHighlights: [
        "Led major front-end architecture initiatives at Dell",
        "Directed enterprise modernization efforts",
        "Improved Lighthouse performance from 41 to 98",
        "Engineered systems delivering 400% performance improvements",
        "Drove reusable architecture and micro front-end strategies",
        "Mentored engineers and influenced engineering standards",
      ],
      flavorText: "Great architecture scales systems. Great leadership scales people.",
    },
  ] as SkillData[],

  resume: {
    name: "Michael Garrett Jones",
    title: "Principal UI Architect / Technical Lead (Vue)",
    email: "",
    phone: undefined,
    website: undefined,
    summary:
      "Manager/Technical Lead specializing in modern web interface design and development. Led Vue + Vuex migration for Scale Computing’s HyperCore, customized Node.js backend with Thrift DB and real-time sockets, implemented Grafana with Timescale/Postgres for advanced metrics, and decoupled front-end/back-end from a C++ monolith. Performance-focused leader with patents and publications, previously driving major gains at RentPath and Dell.",

    experience: [
      {
        id: "scale-computing",
        company: "Scale Computing",
        position: "Principal UI Architect / Technical Lead (Vue)",
        startDate: "2021-01",
        description:
          "Managed and enhanced the complex HyperCore web interface. Transitioned from a custom templating system to Vue + Vuex, customized Node.js backend integrating with Thrift DB and real-time sockets, implemented Grafana with Timescale/Postgres for performance metrics, and decoupled front-end and Node backend from a C++ monolith. Built an AI-powered RAG system to improve LLM queries to a custom knowledge base.",
        technologies: [
          "Vue 3",
          "Vuex",
          "Node.js",
          "Thrift",
          "Socket.IO",
          "Grafana",
          "TimescaleDB",
          "PostgreSQL",
          "TypeScript",
        ],
      },
      {
        id: "rentpath",
        company: "RentPath",
        position: "Performance Architect (React)",
        startDate: "2020-07",
        endDate: "2021-01",
        description:
          "Elevated Lighthouse scores from 41 to 98. Integrated Next.js to minimize client-side processing and optimized Web Vitals, delivering substantial SEO ranking improvements.",
        technologies: ["React", "Next.js", "JavaScript", "CSS3", "Lighthouse", "Web Vitals"],
      },
      {
        id: "dell-technologies",
        company: "Dell Technologies",
        position: "Principal UI Architect",
        startDate: "2015-09",
        endDate: "2020-07",
        description:
          "Led greenfield architecture for Dell’s buyer experience. Achieved 400% page load performance increase, 10x page weight reduction, and 30% conversion uplift. Pioneered Micro Front-end strategy and set next-gen UX benchmarks. Platinum Star award recipient.",
        technologies: ["AngularJS", "ASP.NET MVC", "Micro Frontends", "Performance"],
      },
      {
        id: "electronic-arts",
        company: "Electronic Arts (EA)",
        position: "Principal UI Architect",
        startDate: "2014-11",
        endDate: "2015-08",
        description:
          "Orchestrated redesign of EA’s AnswersHQ, leading a cross-functional team. Improved products across Salesforce and AWS ecosystems and earned a patent for content aggregation.",
        technologies: ["Salesforce", "AWS", "JavaScript", "CSS3"],
      },
      {
        id: "malauzai",
        company: "Malauzai Software Inc. (Finastra)",
        position: "Web Applications Architect / Lead",
        startDate: "2013-08",
        endDate: "2014-10",
        description:
          "Engineered a web-based internet banking application adaptable for various banks. Integrated Ruby on Rails back-end services and continuously upgraded security protocols.",
        technologies: ["Ruby on Rails", "JavaScript", "Security"],
      },
      {
        id: "volusion",
        company: "Volusion",
        position: "Lead UI Developer / UX Evangelist",
        startDate: "2012-07",
        endDate: "2013-07",
        description:
          "Designed a front-end extension platform for third-party developers focused on e-commerce themes and widgets. Led Drupal efforts for API documentation and design quality.",
        technologies: ["JavaScript", "Drupal", "E-commerce"],
      },
      {
        id: "dell-senior-architect",
        company: "Dell",
        position: "Sr. UI Architect / Presentation Lead",
        startDate: "2011-01",
        endDate: "2012-07",
        description:
          "Directed global UI strategy during Dell’s e-commerce MVC conversion and redesign. Led UI architecture, performance excellence, and SEO optimization; co-founded Dell Performance Board.",
        technologies: ["ASP.NET MVC", "JavaScript", "Performance", "SEO"],
      },
      {
        id: "microsoft-consulting",
        company: "Microsoft Consulting Services",
        position: "UI Architect (Contract for Dell)",
        startDate: "2010-06",
        endDate: "2011-01",
        description:
          "Specialized UI architecture services for Dell. Improved user interface designs and aligned Microsoft solutions with Dell’s strategic objectives.",
        technologies: ["JavaScript", "UX", "Architecture"],
      },
      {
        id: "florida-blue",
        company: "Blue Cross and Blue Shield (Florida Blue)",
        position: "Senior Interface Developer",
        startDate: "2008-02",
        endDate: "2010-06",
        description:
          "Led development of internal tools and analytics dashboards with a focus on intuitive, user-friendly interfaces and impactful data visualization.",
        technologies: ["JavaScript", "Data Visualization", "Analytics"],
      },
    ],

    education: [],

    skills: [
      // Reference the skills array above or map as needed by the UI
    ],
  } as ResumeData,
};

// Helper functions for data access
export function getProjectById(id: string): ProjectData | undefined {
  return portfolioData.projects.find((project) => project.id === id);
}

export function getSkillById(id: string): SkillData | undefined {
  return portfolioData.skills.find((skill) => skill.id === id);
}

export function getProjectsByType(type: ProjectData["type"]): ProjectData[] {
  return portfolioData.projects.filter((project) => project.type === type);
}

export function getSkillsByCategory(category: SkillData["category"]): SkillData[] {
  return portfolioData.skills.filter((skill) => skill.category === category);
}
