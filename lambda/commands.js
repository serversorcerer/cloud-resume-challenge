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
    help: `Available Commands:\n--------------------\naws s3 ls           – list S3 buckets\nview counter        – fetch visitor count\nterraform apply     – apply infra (simulated)\nblackjack           – play blackjack game\nmotd                – welcome message\nwhoami              – user identity\nbio                 – about Joe Leto\nresume              – open resume PDF\nlinkedin            – LinkedIn profile\ngithub              – GitHub profile\nemail               – contact via email\noffer               – send your info\nprojects            – list cloud projects\nstack               – show stack details\narchitecture        – show architecture diagram\nquote               – inspiration\nclear               – clear screen\nexit                – log out\nsource code         – browse source repo`,
    'aws s3 ls': '[bucket] josephaleto.io\n[bucket] resume-storage\n[bucket] inframirror-assets',
    'terraform apply': 'Applying changes...\n✓ No drift detected\n✓ Resources validated\n✓ Lambda up-to-date\n✓ DynamoDB consistent\n✓ CloudFront deployed\n\n✔ Terraform apply complete! Infrastructure looks good.',
    motd: `~~~ cloud initialized ~~~\n\nI'm Joe Leto — cloud engineer focused on AWS automation.\n\nThis isn’t just a portfolio. It’s a working terminal powered by real AWS infrastructure. Every command triggers live code I built and deployed myself.\n\nType "help" to explore.`,
    whoami: 'user: joe\ndomain: josephaleto.io\nlocation: Ashburn, Virginia',
    bio: `I once dealt poker games, learning to thrive under pressure.\n\nNow I channel that same discipline into cloud engineering. I build clean systems and real deployments — no fluff.\n\nThis terminal connects to live AWS services: Lambda, API Gateway, DynamoDB, S3 — all built with Terraform, deployed through GitHub Actions, and versioned from the ground up.\n\nI learn best by building — and this is what I’ve built.`,
    resume: 'Opening resume: https://josephaletoresume.s3.amazonaws.com/joseph-leto-soultions-architect.pdf',
    linkedin: 'Opening LinkedIn: https://www.linkedin.com/in/joseph-leto/',
    github: 'Opening GitHub: https://github.com/serversorcerer',
    email: 'Contact: joe@josephaleto.io',
    projects: `Projects:\n2025 - COSMOS GovCloud Architecture\n2025 - Neurodivergent Classroom Scheduler\n2025 - The Cloud Terminal\n2024 - Cloud Resume Challenge\n2024 - Infrastructure as Code (Terraform)\nType projects [name] for details (e.g. projects cloud-terminal)`,
    'projects cloud-terminal': `The Cloud Terminal (2025):\n• A terminal interface built directly into my site — fully powered by AWS. Every command triggers real infrastructure.\n• Lambda functions handle execution, API Gateway routes requests, DynamoDB stores data.\n• Infrastructure provisioned with Terraform and deployed through GitHub Actions.\n• Built to demonstrate how I design, deploy, and maintain real cloud systems.`,
    'projects cosmos': `COSMOS GovCloud Architecture (2025):\n• Segmented Dev, Shared and Prod VPCs via CloudFormation.\n• Centralized Transit Gateway routing.\n• Visual diagram, full IaC stack and deploy script.\n• GitHub: https://github.com/serversorcerer/aws-govcloud-cosmos-project`,
    'projects scheduler': `Neurodivergent Classroom Scheduler (2025):\n• Zero-maintenance scheduling with conflict detection.\n• Regenerable room matrix and nightly log archiving.\n• Built with Google Apps Script and Sheets.\n• Readme: https://josephaleto.io/Classroom%20Scheduler%20Readme.pdf`,
    'projects cloud-resume': `Cloud Resume Challenge (2024):\n• Hosted on S3, delivered through CloudFront, routed via Route 53.\n• Resume views tracked using Lambda, API Gateway, and DynamoDB.\n• CI/CD set up through GitHub Actions for zero-touch deployment.`,
    'projects terraform': `Infrastructure as Code (Terraform) (2024):\n• Modular Terraform configs for all services: Lambda, IAM, S3, DNS, APIs.\n• Enabled rollback, change previews, and infrastructure drift detection.\n• Integrated into CI/CD pipeline for automated deployments.`,
    stack: `Stack:\n- Terminal UI: React + Custom Command Handler\n- Hosting: S3 + CloudFront\n- Backend: Lambda + API Gateway\n- Data: DynamoDB\n- Infra as Code: Terraform\n- CI/CD: GitHub Actions\n- DNS: Route 53`,
    architecture: `Infrastructure Diagram:\n\
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
    + GitHub Actions handles CI/CD deployments`,
    quote: '“Ship often. Think big. Stay sharp.” – J.L.',
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
