const HEADERS = {
  'Content-Type': 'text/plain',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'OPTIONS,POST',
  'Access-Control-Allow-Headers': 'Content-Type'
};

const ZAP_WEBHOOK_URL = process.env.ZAP_WEBHOOK_URL ||
  'https://hooks.zapier.com/hooks/catch/23156361/2vwx0r3/';

exports.handler = async (event) => {
  if (event?.requestContext?.http?.method === 'OPTIONS') {
    return { statusCode: 204, headers: HEADERS, body: '' };
  }

  let body = {};
  try {
    body = event?.body ?
      (typeof event.body === 'string' ? JSON.parse(event.body) : event.body)
      : {};
  } catch (err) {
    console.error('Invalid request body', err);
    return { statusCode: 500, headers: HEADERS, body: 'Invalid request body' };
  }

  const command = (body.command || '').trim().toLowerCase();

  const responses = {
    help: 'Available Commands:\n--------------------\naws s3 ls           – list S3 buckets\nview counter        – fetch visitor count\nterraform apply     – apply infra (simulated)\nblackjack           – play blackjack game\nmotd                – welcome message\nwhoami              – user identity\nbio                 – about Joe Leto\nexperience          – work history\nskills              – technical skills\nresume              – open resume PDF\nlinkedin            – LinkedIn profile\ngithub              – GitHub profile\nemail               – contact via email\noffer               – send your info\nprojects            – list cloud projects\nstack               – show stack details\narchitecture        – show architecture diagram\nquote               – inspiration\nclear               – clear screen\nexit                – log out\nsource code         – browse source repo',
    'aws s3 ls': '[bucket] josephaleto.io\n[bucket] resume-storage\n[bucket] inframirror-assets',
    'terraform apply': 'Applying changes...\n✓ No drift detected\n✓ Resources validated\n✓ Lambda up-to-date\n✓ DynamoDB consistent\n✓ CloudFront deployed\n\n✔ Terraform apply complete! Infrastructure looks good.',
    motd: '~~~ hey, you made it ~~~\n\nI\'m Joe Leto. I build cloud platforms that actually ship.\n\nUsed to deal poker — now I deal in production AWS at scale. This terminal? Real infrastructure. Every command runs live code I deployed myself.\n\nType "bio" for the full story. Type "help" to explore.',
    whoami: 'user: joe\nrole: Platform Engineer @ AWS Professional Services\ndomain: josephaleto.io\nlocation: Ashburn, Virginia\nvibe: builder, not buzzwords',
    bio: 'Short version: I build things that work in production.\n\nLonger version: I spent years running poker tables — high pressure, zero room for error. That taught me to stay calm when systems get loud. Now I bring that same focus to AWS Professional Services, shipping CI/CD platforms, multi-account infrastructure, and tools teams use every day.\n\n64+ accounts standardized. 40% faster provisioning. Sub-2-second response times on the stack running this site. I\'d rather show you working code than talk about it — hence the terminal.\n\nType "experience" or "skills" for the résumé stuff.',
    experience: 'Experience:\n--------------------\nLead Software Engineer — AWS Professional Services\nJan 2026 – Present\n• Led delivery of a cloud-native platform automating security scanning and release governance across four environments\n• Partnered with cross-functional stakeholders to ship a React operator console for remediation and pipeline re-runs\n• Integrated four scanners into CI/CD — continuous security feedback on every code change\n• Built deployment gates that block risky releases automatically\n• Delivered Keycloak RBAC, compliance dashboards, and audit exports leadership trusts\n\nCloud Platform Engineer — COSMOS\nStrategic Business Systems (SBS) · Jul 2025 – Jan 2026\n• Network Firewall policies across 500+ approved ranges\n• Standardized landing zones across 64+ accounts — 40% faster provisioning\n• Aligned architects, app teams, and security on repeatable AWS patterns at scale',
    skills: 'Skills:\n--------------------\nSRE & Platform:\n  CI/CD (GitHub Actions), Docker, EKS, Helm, Terraform,\n  CloudFormation, StackSets, zero-downtime deploys,\n  incident response, blameless postmortems\n\nObservability:\n  Prometheus, Grafana, CloudWatch — see problems\n  before your users do\n\nCloud & Security:\n  Multi-account AWS (Organizations, Control Tower),\n  VPC, Transit Gateway, IAM, Lambda, S3, RDS, ECR,\n  Route 53, policy-as-code, guardrails, least privilege\n\nLanguages & Tooling:\n  Python, Bash, Go, Git, YAML/JSON, Boto3',
    resume: 'Opening resume: https://josephaletoresume.s3.amazonaws.com/joseph-leto-soultions-architect.pdf',
    linkedin: 'Opening LinkedIn: https://www.linkedin.com/in/joseph-leto/',
    github: 'Opening GitHub: https://github.com/serversorcerer',
    email: 'Contact: joe@josephaleto.io',
    projects: 'Projects:\n2024–Present - Cloud Resume Terminal\n2025 - Enterprise Multi-Account AWS Platform\n2024 - Infrastructure as Code (Terraform)\n2024 - Cloud Resume Challenge\nType projects [name] for details (e.g. projects cloud-terminal)',
    'projects cloud-terminal': 'Cloud Resume Terminal (2024–Present):\n• End-to-end production AWS stack with 20+ live terminal commands.\n• Lambda, API Gateway, S3, DynamoDB — sub-2-second lead capture pipeline.\n• Full stack replication in under 10 minutes with Terraform and GitHub Actions.\n• Live site: https://josephaleto.io/',
    'projects cosmos': 'Enterprise Multi-Account AWS Platform (2025):\n• Production 3-tier architecture across multiple VPCs at commercial scale.\n• Terraform and CloudFormation for repeatable, auditable provisioning.\n• Automated validation catching misconfigurations before they become incidents.\n• GitHub: https://github.com/serversorcerer/aws-govcloud-cosmos-project',
    'projects cloud-resume': 'Cloud Resume Challenge (2024):\n• Hosted on S3, delivered through CloudFront, routed via Route 53.\n• Resume views tracked using Lambda, API Gateway, and DynamoDB.\n• CI/CD set up through GitHub Actions for zero-touch deployment.',
    'projects terraform': 'Infrastructure as Code (Terraform) (2024):\n• Modular Terraform configs for all services: Lambda, IAM, S3, DNS, APIs.\n• Rollback, change previews, and drift detection built in.\n• Integrated into CI/CD for automated, repeatable deployments.',
    stack: 'Stack:\n- Terminal UI: React + Custom Command Handler\n- Hosting: S3 + CloudFront\n- Backend: Lambda + API Gateway\n- Data: DynamoDB\n- Infra as Code: Terraform\n- CI/CD: GitHub Actions\n- Observability: Prometheus, Grafana, CloudWatch\n- Containers: Docker, EKS, Helm\n- DNS: Route 53',
    architecture: 'Infrastructure Diagram:\n\
    +---------------------+\n\
    |        USER         |\n\
    +---------------------+\n\
              |\n\
              v\n\
    +---------------------+\n\
    |   CloudFront (CDN)  |\n\
    +---------------------+\n\
              |\n\
              v\n\
    +-------------------------------+\n\
    |   S3 Static Site Hosting      |\n\
    |  (index.html + JS Terminal)   |\n\
    +-------------------------------+\n\
              |\n\
              v\n\
    +----------------------------+\n\
    |   API Gateway (HTTP API)  |\n\
    +----------------------------+\n\
              |\n\
              v\n\
    +---------------------+\n\
    |   Lambda Function   |\n\
    +---------------------+\n\
        |           |\n\
        v           v\n\
    +-----------+  +---------------------------+\n\
    | DynamoDB  |  |   Zapier Webhook (Leads)  |\n\
    | (Counter) |  +---------------------------+\n\
    +-----------+\n\
    \n\
    + Terraform provisions all infrastructure\n\
    + GitHub Actions handles CI/CD deployments',
    quote: '"Ship fast. Stay secure. Own production." – J.L.',
    clear: '__CLEAR__',
    exit: 'Logging out...\nSession terminated.',
    'source code': 'Browse source: https://github.com/serversorcerer/cloud-resume-challenge',
    blackjack: 'Opening blackjack game...\n🃏 Starting your blackjack session\n♠️ Good luck at the tables! ♥️\n\nRedirecting to: https://josephaleto.io/blackjack.html'
  };

  if (!command) {
    return { statusCode: 500, headers: HEADERS, body: 'No command provided.' };
  }

  try {
    if (command === 'offer') {
      const name = (body.name || '').toString().trim();
      const email = (body.email || '').toString().trim();
      const company = (body.company || '').toString().trim();
      const message = (body.message || '').toString().trim();

      if (!name || !email) {
        return { statusCode: 500, headers: HEADERS, body: 'Name and email required' };
      }

      const payload = { name, email, company, message };
      console.log('Sending payload:', payload);

      const res = await fetch(ZAP_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(`Webhook error: ${res.status}`);
      const companyPhrase = company ? ` at ${company}` : '';
      return {
        statusCode: 200,
        headers: HEADERS,
        body: `✅ Offer received from ${name}${companyPhrase}.\nI'll be in touch shortly.\n— Sent live from your terminal.`
      };
    }

    const output = responses[command];
    if (!output) {
      return { statusCode: 200, headers: HEADERS, body: `Command not found: ${command}` };
    }

    return { statusCode: 200, headers: HEADERS, body: output };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers: HEADERS, body: err.message };
  }
};
