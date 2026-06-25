import pkg from 'pg';
const { Pool } = pkg;
const pool = new Pool({ connectionString: 'postgresql://axiom_user:axiom_pass@localhost:5432/axiom' });

function uid() { return Math.random().toString(36).slice(2, 12) + Date.now().toString(36); }

const jobs = [
  { title: 'Backend Engineer Intern', company: 'Razorpay', location: 'Bangalore, India', remote: false, jobType: 'INTERNSHIP', expLevel: 'ENTRY', salaryMin: 50000, salaryMax: 100000,
    desc: 'Build and maintain payment infrastructure APIs using Node.js and Express. Work on distributed systems handling millions of transactions. Knowledge of PostgreSQL, Redis, and message queues required.',
    skills: ['Node.js','Express','PostgreSQL','Redis','JavaScript','REST APIs'],
    niceSkills: ['Kafka','Docker','AWS'],
    source: 'manual' },
  { title: 'Backend Developer Intern', company: 'Swiggy', location: 'Bangalore, India', remote: false, jobType: 'INTERNSHIP', expLevel: 'ENTRY', salaryMin: 45000, salaryMax: 90000,
    desc: 'Design scalable backend services for food delivery platform. Work with Node.js, MongoDB, and Redis to build high-throughput APIs. Experience with microservices architecture is a plus.',
    skills: ['Node.js','MongoDB','Redis','JavaScript','REST APIs','Microservices'],
    niceSkills: ['Docker','Kubernetes','AWS'],
    source: 'manual' },
  { title: 'Python Backend Intern', company: 'Zomato', location: 'Gurgaon, India', remote: false, jobType: 'INTERNSHIP', expLevel: 'ENTRY', salaryMin: 40000, salaryMax: 80000,
    desc: 'Build backend services using Python and Django. Work on recommendation engines, search optimization, and data pipelines. Strong SQL skills required.',
    skills: ['Python','Django','SQL','REST APIs','Data Pipelines'],
    niceSkills: ['AWS','Docker','Elasticsearch'],
    source: 'manual' },
  { title: 'Software Development Engineer Intern', company: 'Amazon', location: 'Bangalore, India', remote: false, jobType: 'INTERNSHIP', expLevel: 'ENTRY', salaryMin: 80000, salaryMax: 150000,
    desc: 'Design and develop software solutions for Amazon customer-facing products. Strong problem-solving skills and proficiency in Java, Python, or JavaScript required. Experience with distributed systems preferred.',
    skills: ['Java','Python','JavaScript','Algorithms','Data Structures','Distributed Systems'],
    niceSkills: ['AWS','Docker','SQL'],
    source: 'manual' },
  { title: 'Backend Engineering Intern', company: 'Coinbase', location: 'Remote', remote: true, jobType: 'INTERNSHIP', expLevel: 'ENTRY', salaryMin: 70000, salaryMax: 140000,
    desc: 'Build secure and scalable backend services for cryptocurrency platform. Work with Node.js, PostgreSQL, and Redis. Strong understanding of security best practices required.',
    skills: ['Node.js','PostgreSQL','Redis','TypeScript','Security','REST APIs'],
    niceSkills: ['Docker','Kafka','AWS'],
    source: 'manual' },
  { title: 'Data Engineering Intern', company: 'Sprinklr', location: 'Bangalore, India', remote: false, jobType: 'INTERNSHIP', expLevel: 'ENTRY', salaryMin: 45000, salaryMax: 90000,
    desc: 'Build data pipelines and ETL processes using Python, Spark, and Kafka. Work on real-time data processing and analytics infrastructure. SQL and data modeling skills required.',
    skills: ['Python','SQL','Kafka','Data Modeling','ETL'],
    niceSkills: ['Spark','AWS','Docker'],
    source: 'manual' },
  { title: 'DevOps Engineering Intern', company: 'Cloudflare', location: 'Remote', remote: true, jobType: 'INTERNSHIP', expLevel: 'ENTRY', salaryMin: 60000, salaryMax: 120000,
    desc: 'Help build and maintain cloud infrastructure. Work with Docker, Kubernetes, CI/CD pipelines, and monitoring systems. Scripting skills in Python or Go required.',
    skills: ['Docker','Kubernetes','Python','CI/CD','AWS','Linux'],
    niceSkills: ['Go','Terraform','Prometheus'],
    source: 'manual' },
  { title: 'Full Stack Developer Intern', company: 'CRED', location: 'Bangalore, India', remote: false, jobType: 'INTERNSHIP', expLevel: 'ENTRY', salaryMin: 50000, salaryMax: 100000,
    desc: 'Build full-stack features for fintech platform. Work with React, Node.js, and PostgreSQL. Experience with payment systems and financial APIs preferred.',
    skills: ['React','Node.js','PostgreSQL','JavaScript','TypeScript','REST APIs'],
    niceSkills: ['Docker','Redis','AWS'],
    source: 'manual' },
  { title: 'Software Engineer Intern', company: 'Google', location: 'Bangalore/Hyderabad', remote: false, jobType: 'INTERNSHIP', expLevel: 'ENTRY', salaryMin: 100000, salaryMax: 200000,
    desc: 'Work on core Google products and infrastructure. Strong coding skills in Java, C++, or Python required. Experience with large-scale systems and algorithms preferred.',
    skills: ['Java','Python','C++','Algorithms','Data Structures','System Design'],
    niceSkills: ['Distributed Systems','SQL','Linux'],
    source: 'manual' },
  { title: 'Backend Developer Intern', company: 'Atlassian', location: 'Remote', remote: true, jobType: 'INTERNSHIP', expLevel: 'ENTRY', salaryMin: 65000, salaryMax: 130000,
    desc: 'Build backend services for collaboration tools used by millions. Work with Java, Spring Boot, and AWS. Experience with microservices and REST API design required.',
    skills: ['Java','Spring Boot','AWS','REST APIs','Microservices','SQL'],
    niceSkills: ['Docker','Kubernetes','Node.js'],
    source: 'manual' },
];

async function seed() {
  let inserted = 0;
  for (const j of jobs) {
    try {
      await pool.query(`
        INSERT INTO jobs (id, title, company, location, remote, "jobType", "experienceLevel", "salaryMin", "salaryMax", currency, description, "requiredSkills", "niceToHaveSkills", source, "sourceUrl", "postedAt", "createdAt", "updatedAt")
        VALUES ($1,$2,$3,$4,$5,$6::"JobType",$7::"ExperienceLevel",$8,$9,'INR',$10,$11::text[],$12::text[],$13,$14,NOW(),NOW(),NOW())
        ON CONFLICT ("sourceUrl") DO NOTHING
      `, [uid(), j.title, j.company, j.location, j.remote, j.jobType, j.expLevel, j.salaryMin, j.salaryMax, j.desc, j.skills, j.niceSkills, j.source, 'https://seed-job-' + uid() + '.com']);
      inserted++;
    } catch(e) { console.error('Failed:', j.title, e.message); }
  }
  console.log(`Seeded ${inserted} backend jobs`);
  await pool.end();
}
seed().catch(e => { console.error(e.message); process.exit(1); });
