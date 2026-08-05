"""Curated skill keyword list for phrase-matching against resume text.

The Kaggle source dataset spans ~24 job categories (IT, finance, healthcare, design,
sales, ...), so this taxonomy is broad rather than tech-only. It's intentionally a
flat, editable list — extend it as gaps are found rather than trying to be exhaustive
up front.
"""

TECH_SKILLS = [
    "python", "java", "javascript", "typescript", "c++", "c#", "sql", "r",
    "html", "css", "react", "angular", "vue", "node.js", "django", "flask",
    "fastapi", "spring", ".net", "aws", "azure", "gcp", "docker", "kubernetes",
    "git", "linux", "rest api", "graphql", "microservices", "ci/cd",
    "machine learning", "deep learning", "nlp", "natural language processing",
    "computer vision", "tensorflow", "pytorch", "scikit-learn", "pandas",
    "numpy", "spark", "hadoop", "tableau", "power bi", "excel", "data analysis",
    "data visualization", "etl", "airflow", "mongodb", "postgresql", "mysql",
    "oracle", "nosql", "big data", "statistics", "a/b testing", "cybersecurity",
    "network administration", "system administration", "devops", "agile", "scrum",
]

BUSINESS_FINANCE_SKILLS = [
    "financial analysis", "budgeting", "forecasting", "accounting", "auditing",
    "bookkeeping", "accounts payable", "accounts receivable", "gaap", "tax preparation",
    "financial reporting", "risk management", "underwriting", "compliance",
    "investment analysis", "portfolio management", "quickbooks", "sap", "erp",
    "procurement", "supply chain", "logistics", "inventory management",
    "business development", "market research", "competitive analysis",
    "strategic planning", "project management", "pmp", "six sigma",
]

SALES_MARKETING_SKILLS = [
    "sales", "cold calling", "lead generation", "crm", "salesforce", "negotiation",
    "account management", "digital marketing", "seo", "sem", "social media marketing",
    "content marketing", "email marketing", "brand management", "public relations",
    "copywriting", "market analysis", "customer relationship management",
]

HEALTHCARE_SKILLS = [
    "patient care", "clinical", "nursing", "phlebotomy", "medical terminology",
    "electronic health records", "ehr", "hipaa", "icd-10", "cpt coding",
    "vital signs", "triage", "pharmacology", "medical billing",
]

CREATIVE_DESIGN_SKILLS = [
    "graphic design", "adobe photoshop", "adobe illustrator", "indesign",
    "ui/ux design", "figma", "sketch", "typography", "branding",
    "video editing", "premiere pro", "after effects", "3d modeling", "autocad",
]

EDUCATION_SKILLS = [
    "curriculum development", "lesson planning", "classroom management",
    "special education", "tutoring", "instructional design", "e-learning",
]

TRADES_SERVICE_SKILLS = [
    "customer service", "food preparation", "menu planning", "inventory control",
    "equipment maintenance", "quality control", "construction management",
    "blueprint reading", "electrical wiring", "plumbing", "welding",
    "vehicle maintenance", "fleet management", "aviation safety",
    "flight operations", "warehouse operations", "forklift operation",
]

SOFT_SKILLS = [
    "leadership", "communication", "teamwork", "problem solving", "critical thinking",
    "time management", "adaptability", "collaboration", "conflict resolution",
    "public speaking", "mentoring", "decision making", "attention to detail",
    "multitasking", "organizational skills",
]

ALL_SKILLS = sorted(
    set(
        TECH_SKILLS
        + BUSINESS_FINANCE_SKILLS
        + SALES_MARKETING_SKILLS
        + HEALTHCARE_SKILLS
        + CREATIVE_DESIGN_SKILLS
        + EDUCATION_SKILLS
        + TRADES_SERVICE_SKILLS
        + SOFT_SKILLS
    )
)
