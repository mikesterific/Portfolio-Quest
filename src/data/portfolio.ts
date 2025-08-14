import type { ProjectData, SkillData, ResumeData } from '@/types/game'

// Sample portfolio data - replace with your actual data
export const portfolioData = {
  projects: [
    {
      id: 'portfolio-quest',
      title: 'Portfolio Quest',
      description: 'An interactive, retro RPG-inspired portfolio website that showcases professional work through an engaging game experience. Built with Vue 3, Phaser.js, and TypeScript.',
      technologies: ['Vue 3', 'Phaser.js', 'TypeScript', 'Vite', 'CSS3'],
      type: 'game' as const,
      demoUrl: '#'
    },
    {
      id: 'dell-xps-poc',
      title: 'Dell XPS Proof of Concept',
      description: "Visionary UI prototype showcasing Dell’s front-end capabilities. Sparked Dell's premium branding initiative and inspired a broader digital transformation.",
      technologies: ['HTML5', 'CSS3', 'JavaScript', 'Performance'],
      type: 'web' as const
    },
    {
      id: 'dell-xps-landing',
      title: 'Dell XPS Landing Page',
      description: 'Launched after leadership buy-in from the POC. Implemented with Dell’s internal design team as part of a modernized brand strategy.',
      technologies: ['HTML5', 'CSS3', 'JavaScript'],
      type: 'web' as const
    },
    {
      id: 'dell-home-poc',
      title: 'Dell Home Proof of Concept',
      description: 'Foundational POC for Dell’s homepage which influenced the design and layout of the global production homepage.',
      technologies: ['HTML5', 'CSS3', 'JavaScript'],
      type: 'web' as const
    },
    {
      id: 'dell-home-live',
      title: 'Dell Home Page (Live Site)',
      description: 'Greenfield architecture deployed globally in under 30 days, built collaboratively with Dell tiger teams across countries.',
      technologies: ['AngularJS', 'ASP.NET MVC', 'Performance', 'Micro Frontends'],
      type: 'web' as const
    },
    {
      id: 'ea-support-site',
      title: 'EA Support Site',
      description: "Design contributions for EA's internal support site during a greenfield rebuild, alongside architectural responsibilities.",
      technologies: ['Salesforce', 'AWS', 'JavaScript', 'CSS3'],
      type: 'web' as const
    },
    {
      id: 'citi-flash-ux',
      title: 'Citi Flash + UX Work',
      description: 'Initially hired as a designer; rapidly transitioned into Flash development during the period when Flash was industry-standard.',
      technologies: ['Flash', 'ActionScript', 'UX'],
      type: 'web' as const
    },
    {
      id: 'bcbs-data-ux',
      title: 'BCBS Data UX Redesign',
      description: 'Redesign focused on simplifying complex data into digestible, intuitive UX patterns. Widely praised internally.',
      technologies: ['JavaScript', 'Data Visualization', 'UX'],
      type: 'web' as const
    },
    {
      id: 'vsi-concept-content',
      title: 'VSI Concept & Content Creation',
      description: 'Built the content strategy and user flow for the experience, owning the project from ideation to execution.',
      technologies: ['HTML5', 'CSS3', 'JavaScript', 'Content Strategy'],
      type: 'web' as const
    },
    {
      id: 'joe-parker-guitars',
      title: 'Joe Parker Guitars – Custom Website',
      description: 'First website for a custom guitar builder, balancing artisan branding with clean UI.',
      technologies: ['HTML5', 'CSS3', 'JavaScript'],
      type: 'web' as const
    },
    {
      id: 'decision-tree-logo',
      title: 'Decision Tree – Logo Design',
      description: 'Two-color print design that visually mimicked full-color output—economical and clever.',
      technologies: ['Branding', 'Logo Design'],
      type: 'web' as const
    },
    {
      id: 'bizatomic-logo',
      title: 'BizAtomic – Logo Design',
      description: 'Energetic branding concept with bold lines and a tight color palette for a startup launch.',
      technologies: ['Branding', 'Logo Design'],
      type: 'web' as const
    }
  ] as ProjectData[],

  skills: [
    {
      id: 'frontend',
      name: 'Front-End Expert (20+ Years)',
      category: 'frontend' as const,
      level: 5,
      icon: '👨‍💻',
      description: 'Proven leader in front-end architecture and performance optimization, with deep mastery of Vue.js, React.js, and Angular. Expert in CSS3, HTML5, and SASS/LESS, with a history of delivering scalable, high-performance UIs for enterprise applications.'
    },
    {
      id: 'testing',
      name: 'Testing Aficionado', 
      category: 'testing' as const,
      level: 5,
      icon: '🧪',
      description: 'Cypress ninja with expertise in config, isolation, retries, and CI stability. Jest, Mocha, Chai master. Writes full-coverage tests that are resilient, not just green.'
    },
    {
      id: 'architecture',
      name: 'State Management & Architecture',
      category: 'architecture' as const,
      level: 5,
      icon: '📦',
      description: 'Vuex wizard with pattern-oriented store design. Integrates Supabase, Socket.IO, and external APIs with store architecture. Designed large-scale apps at EA, Dell, RentPath, and Scale Computing.'
    },
    {
      id: 'tooling',
      name: 'Tooling & Build Systems',
      category: 'tooling' as const,
      level: 5,
      icon: '⚙️',
      description: 'Fluent with Vite, Webpack, npm, yarn, Babel, ESLint, and TypeScript. Expert in managing mono repos and custom component libraries.'
    },
    {
      id: 'ai',
      name: 'AI & RAG Engineering',
      category: 'ai' as const,
      level: 4,
      icon: '🧠',
      description: 'Developed custom RAG systems with similarity search and best-practices enrichment. Uses LLMs to generate, iterate, and refine test cases and documentation. AI-integration into dev workflow is deployed, not theoretical.'
    },

    {
      id: 'security',
      name: 'Security & Accessibility',
      category: 'security' as const,
      level: 4,
      icon: '🔒',
      description: 'Linux Foundation certified in Secure Software Development (LFD121). Brings accessibility and security into early-stage design—not bolted on after.'
    },
    {
      id: 'leadership',
      name: 'Thought Leader & Author',
      category: 'leadership' as const,
      level: 5,
      icon: '🎤',
      description: 'Gave a Google Tech Talk on animating pseudo-elements. Published author of "Pro HTML5 Performance" by Apress. UI badass (tattoo verified).'
    }
  ] as SkillData[],

  resume: {
    name: 'Michael Garrett Jones',
    title: 'Principal UI Architect / Technical Lead (Vue)',
    email: '',
    phone: undefined,
    website: undefined,
    summary: 'Manager/Technical Lead specializing in modern web interface design and development. Led Vue + Vuex migration for Scale Computing’s HyperCore, customized Node.js backend with Thrift DB and real-time sockets, implemented Grafana with Timescale/Postgres for advanced metrics, and decoupled front-end/back-end from a C++ monolith. Performance-focused leader with patents and publications, previously driving major gains at RentPath and Dell.',
    
    experience: [
      {
        id: 'scale-computing',
        company: 'Scale Computing',
        position: 'Principal UI Architect / Technical Lead (Vue)',
        startDate: '2021-01',
        description: 'Managed and enhanced the complex HyperCore web interface. Transitioned from a custom templating system to Vue + Vuex, customized Node.js backend integrating with Thrift DB and real-time sockets, implemented Grafana with Timescale/Postgres for performance metrics, and decoupled front-end and Node backend from a C++ monolith. Built an AI-powered RAG system to improve LLM queries to a custom knowledge base.',
        technologies: ['Vue 3', 'Vuex', 'Node.js', 'Thrift', 'Socket.IO', 'Grafana', 'TimescaleDB', 'PostgreSQL', 'TypeScript']
      },
      {
        id: 'rentpath',
        company: 'RentPath',
        position: 'Performance Architect (React)',
        startDate: '2020-07',
        endDate: '2021-01',
        description: 'Elevated Lighthouse scores from 41 to 98. Integrated Next.js to minimize client-side processing and optimized Web Vitals, delivering substantial SEO ranking improvements.',
        technologies: ['React', 'Next.js', 'JavaScript', 'CSS3', 'Lighthouse', 'Web Vitals']
      },
      {
        id: 'dell-technologies',
        company: 'Dell Technologies',
        position: 'Principal UI Architect',
        startDate: '2015-09',
        endDate: '2020-07',
        description: 'Led greenfield architecture for Dell’s buyer experience. Achieved 400% page load performance increase, 10x page weight reduction, and 30% conversion uplift. Pioneered Micro Front-end strategy and set next-gen UX benchmarks. Platinum Star award recipient.',
        technologies: ['AngularJS', 'ASP.NET MVC', 'Micro Frontends', 'Performance']
      },
      {
        id: 'electronic-arts',
        company: 'Electronic Arts (EA)',
        position: 'Principal UI Architect',
        startDate: '2014-11',
        endDate: '2015-08',
        description: 'Orchestrated redesign of EA’s AnswersHQ, leading a cross-functional team. Improved products across Salesforce and AWS ecosystems and earned a patent for content aggregation.',
        technologies: ['Salesforce', 'AWS', 'JavaScript', 'CSS3']
      },
      {
        id: 'malauzai',
        company: 'Malauzai Software Inc. (Finastra)',
        position: 'Web Applications Architect / Lead',
        startDate: '2013-08',
        endDate: '2014-10',
        description: 'Engineered a web-based internet banking application adaptable for various banks. Integrated Ruby on Rails back-end services and continuously upgraded security protocols.',
        technologies: ['Ruby on Rails', 'JavaScript', 'Security']
      },
      {
        id: 'volusion',
        company: 'Volusion',
        position: 'Lead UI Developer / UX Evangelist',
        startDate: '2012-07',
        endDate: '2013-07',
        description: 'Designed a front-end extension platform for third-party developers focused on e-commerce themes and widgets. Led Drupal efforts for API documentation and design quality.',
        technologies: ['JavaScript', 'Drupal', 'E-commerce']
      },
      {
        id: 'dell-senior-architect',
        company: 'Dell',
        position: 'Sr. UI Architect / Presentation Lead',
        startDate: '2011-01',
        endDate: '2012-07',
        description: 'Directed global UI strategy during Dell’s e-commerce MVC conversion and redesign. Led UI architecture, performance excellence, and SEO optimization; co-founded Dell Performance Board.',
        technologies: ['ASP.NET MVC', 'JavaScript', 'Performance', 'SEO']
      },
      {
        id: 'microsoft-consulting',
        company: 'Microsoft Consulting Services',
        position: 'UI Architect (Contract for Dell)',
        startDate: '2010-06',
        endDate: '2011-01',
        description: 'Specialized UI architecture services for Dell. Improved user interface designs and aligned Microsoft solutions with Dell’s strategic objectives.',
        technologies: ['JavaScript', 'UX', 'Architecture']
      },
      {
        id: 'florida-blue',
        company: 'Blue Cross and Blue Shield (Florida Blue)',
        position: 'Senior Interface Developer',
        startDate: '2008-02',
        endDate: '2010-06',
        description: 'Led development of internal tools and analytics dashboards with a focus on intuitive, user-friendly interfaces and impactful data visualization.',
        technologies: ['JavaScript', 'Data Visualization', 'Analytics']
      }
    ],
    
    education: [],
    
    skills: [
      // Reference the skills array above or map as needed by the UI
    ]
  } as ResumeData
}

// Helper functions for data access
export function getProjectById(id: string): ProjectData | undefined {
  return portfolioData.projects.find(project => project.id === id)
}

export function getSkillById(id: string): SkillData | undefined {
  return portfolioData.skills.find(skill => skill.id === id)
}

export function getProjectsByType(type: ProjectData['type']): ProjectData[] {
  return portfolioData.projects.filter(project => project.type === type)
}

export function getSkillsByCategory(category: SkillData['category']): SkillData[] {
  return portfolioData.skills.filter(skill => skill.category === category)
}