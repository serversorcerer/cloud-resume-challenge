const HEADERS = {
  'Content-Type': 'text/plain',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'OPTIONS,POST',
  'Access-Control-Allow-Headers': 'Content-Type'
};

const ZAP_WEBHOOK_URL = process.env.ZAP_WEBHOOK_URL ||
e0e6qq-codex/restore-terminal-command-system
  'https://hooks.zapier.com/hooks/catch/23156361/2v4xduy/';
=======
  'https://hooks.zapier.com/hooks/catch/000000/placeholder/';
main

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
    help: `Available Commands:\n--------------------\naws s3 ls           – list S3 buckets\nview counter        – fetch visitor count\nterraform apply     – apply infra (simulated)\nmotd                – welcome message\nwhoami              – user identity\nbio                 – about Joe Leto\nresume              – open resume PDF\nlinkedin            – LinkedIn profile\ngithub              – GitHub profile\nemail               – contact via email\nprojects            – list cloud projects\nstack               – show stack details\narchitecture        – show architecture diagram\nquote               – inspiration\noffer               – send your info\njoker mode          – activate Matrix rain\nclear               – clear screen\nexit                – log out\nsource code         – browse source repo`,
    'aws s3 ls': '[bucket] josephaleto.io\n[bucket] resume-storage\n[bucket] inframirror-assets',
    'terraform apply': 'Applying changes...\n✓ No drift detected\n✓ Resources validated\n✓ Lambda up-to-date\n✓ DynamoDB consistent\n✓ CloudFront deployed\n\n✔ Terraform apply complete! Infrastructure looks good.',
    motd: `~~~ cloud initialized ~~~\n\nI'm Joe Leto — from high-stakes poker to cloud systems.\n\nThis isn’t just a portfolio. It’s a working terminal powered by real AWS infrastructure. Every command triggers live code I built and deployed myself.\n\nType "help" to explore.`,
    whoami: 'user: joe\ndomain: josephaleto.io\nlocation: Ashburn, Virginia',
    bio: `I come from the world of high-stakes poker — where pressure, timing, and trust matter.\n\nNow I bring that same edge to infrastructure. Clean systems. Real deployments. No fluff.\n\nThis terminal connects to live AWS services: Lambda, API Gateway, DynamoDB, S3 — all built with Terraform, deployed through GitHub Actions, and versioned from the ground up.\n\nI learn best by building — and this is what I’ve built.`,
    resume: 'Opening resume: https://josephaletoresume.s3.amazonaws.com/joseph-leto-soultions-architect.pdf',
    linkedin: 'Opening LinkedIn: https://www.linkedin.com/in/joseph-leto/',
    github: 'Opening GitHub: https://github.com/serversorcerer',
    email: 'Contact: joe@josephaleto.io',
    projects: `Projects:\n2025 - The Cloud Terminal\n2024 - Cloud Resume Challenge\n2024 - Infrastructure as Code (Terraform)\nType projects [name] for details (e.g. projects cloud-terminal)`,
    'projects cloud-terminal': `The Cloud Terminal (2025):\n• A terminal interface built directly into my site — fully powered by AWS. Every command triggers real infrastructure.\n• Lambda functions handle execution, API Gateway routes requests, DynamoDB stores data.\n• Infrastructure provisioned with Terraform and deployed through GitHub Actions.\n• Built to demonstrate how I design, deploy, and maintain real cloud systems.`,
    'projects cloud-resume': `Cloud Resume Challenge (2024):\n• Hosted on S3, delivered through CloudFront, routed via Route 53.\n• Resume views tracked using Lambda, API Gateway, and DynamoDB.\n• CI/CD set up through GitHub Actions for zero-touch deployment.`,
    'projects terraform': `Infrastructure as Code (Terraform) (2024):\n• Modular Terraform configs for all services: Lambda, IAM, S3, DNS, APIs.\n• Enabled rollback, change previews, and infrastructure drift detection.\n• Integrated into CI/CD pipeline for automated deployments.`,
    stack: `Stack:\n- Terminal UI: React + Custom Command Handler\n- Hosting: S3 + CloudFront\n- Backend: Lambda + API Gateway\n- Data: DynamoDB\n- Infra as Code: Terraform\n- CI/CD: GitHub Actions\n- DNS: Route 53`,
    architecture: `Infrastructure Diagram:\n+---------------------+\n|       CI/CD         |\n|---------------------|\n|  GitHub Actions     |\n+----------+----------+\n           |\n           v\n+---------------------+\n|     S3 Bucket       |\n|  Static Website     |\n+----------+----------+\n           |\n           v\n+---------------------+\n|    CloudFront CDN   |\n+----+-----------+----+\n     |           |\n     v           v\n+----------+   +------------------+\n| Route 53 |   |   API Gateway    |\n+----------+   +---------+--------+\n                      |\n                      v\n                +-----------+\n                |  Lambda   |\n                +-----+-----+\n                      |\n                      v\n                +-----------+\n                | DynamoDB  |\n                +-----------+`,
    quote: '“Ship often. Think big. Stay sharp.” – J.L.',
    clear: '__CLEAR__',
    exit: 'Logging out...\nSession terminated.',
    'source code': 'Browse source: https://github.com/serversorcerer/cloud-resume-challenge'
  };

  if (!command) {
    return { statusCode: 500, headers: HEADERS, body: 'No command provided.' };
  }

  try {
    if (command === 'offer') {
      const { name = '', email = '' } = body;
e0e6qq-codex/restore-terminal-command-system
      const payload = { name, email, time: new Date().toISOString() };
      console.log('Sending to Zapier:', payload);
      const res = await fetch(ZAP_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)

      const res = await fetch(ZAP_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email })
 main
      });
      if (!res.ok) throw new Error(`Webhook error: ${res.status}`);
      return { statusCode: 200, headers: HEADERS, body: 'Offer received' };
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
