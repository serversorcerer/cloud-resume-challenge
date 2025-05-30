const HEADERS = {
  'Content-Type': 'text/plain',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'OPTIONS,POST',
  'Access-Control-Allow-Headers': 'Content-Type'
};

exports.handler = async (event) => {
  let body = {};
  try {
    body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
  } catch (err) {
    console.error('Invalid request body', err);
    return { statusCode: 400, headers: HEADERS, body: 'Invalid request body' };
  }

  const command = (body.command || '').trim().toLowerCase();

  const responses = {
    help: `Available Commands:\n--------------------\naws s3 ls           – list S3 buckets\nview counter        – fetch visitor count\nterraform apply     – apply infra (simulated)\nmotd                – welcome message\nwhoami              – user identity\nbio                 – about Joe Leto\nresume              – open resume PDF\nlinkedin            – LinkedIn profile\ngithub              – GitHub profile\nemail               – contact via email\nprojects            – list cloud projects\nstack               – show stack details\narchitecture        – show architecture diagram\nquote               – inspiration\nclear               – clear screen\nexit                – log out\nsource code         – browse source repo`,
    'aws s3 ls': '[bucket] josephaleto.io\n[bucket] resume-storage\n[bucket] inframirror-assets',
    'terraform apply': 'Applying changes...\n✓ No drift detected\n✓ Resources validated\n✓ Lambda up-to-date\n✓ DynamoDB consistent\n✓ CloudFront deployed\n\n✔ Terraform apply complete! Infrastructure looks good.',
    motd: 'Welcome to josephaleto.io — the AWS-powered terminal portfolio of Joe Leto. Type "help" to begin.',
    whoami: 'user: joe\ndomain: josephaleto.io\nlocation: Ashburn, Virginia',
    bio: 'Joe Leto: AWS-certified builder with a background in high-stakes poker. I build infrastructure that scales, scripts that save time, and UIs that tell a story. This terminal is proof.',
    resume: 'Opening resume: https://josephaletoresume.s3.amazonaws.com/joseph-leto-soultions-architect.pdf',
    linkedin: 'Opening LinkedIn: https://www.linkedin.com/in/joseph-leto/',
    github: 'Opening GitHub: https://github.com/serversorcerer',
    email: 'Contact: joe@josephaleto.io',
    projects: `Cloud Projects:\ncloud-resume — This site. S3, Lambda, DynamoDB, CloudFront, CI/CD.\nbeanstalk-app — Deployed Python web app on Elastic Beanstalk.\ninfra-dashboard — Serverless dashboard with React & API Gateway.\nportfolio-api — REST API for projects, built with Lambda & Terraform.\nType projects [name] for details (e.g. projects cloud-resume)`,
    'projects cloud-resume': `Cloud Resume Challenge:\n• Static site hosted on S3, delivered via CloudFront.\n• Lambda & DynamoDB power the live visitor counter.\n• Fully automated CI/CD with GitHub Actions.\n• All infra defined as code in Terraform.`,
    'projects beanstalk-app': `Elastic Beanstalk App:\n• Python web app deployed on AWS Elastic Beanstalk.\n• Automated blue/green deployments.\n• Custom domain via Route 53, HTTPS via ACM.`,
    'projects infra-dashboard': `InfraMirror Dashboard:\n• Serverless React dashboard.\n• API Gateway + Lambda backend.\n• User authentication via Cognito.`,
    'projects portfolio-api': `Portfolio API:\n• RESTful API for portfolio data.\n• AWS Lambda, DynamoDB, Terraform.\n• Used by this website for dynamic content.`,
    stack: `Stack Details:\n- Frontend: S3 + CloudFront\n- Backend: Lambda + API Gateway\n- Data: DynamoDB\n- Infra as Code: Terraform\n- CI/CD: GitHub Actions\n- Domain: Route 53`,
    architecture: `Infrastructure Diagram:\n+---------------------+\n|       CI/CD         |\n|---------------------|\n|  GitHub Actions     |\n+----------+----------+\n           |\n           v\n+---------------------+\n|     S3 Bucket       |\n|  Static Website     |\n+----------+----------+\n           |\n           v\n+---------------------+\n|    CloudFront CDN   |\n+----+-----------+----+\n     |           |\n     v           v\n+----------+   +------------------+\n| Route 53 |   |   API Gateway    |\n+----------+   +---------+--------+\n                      |\n                      v\n                +-----------+\n                |  Lambda   |\n                +-----+-----+\n                      |\n                      v\n                +-----------+\n                | DynamoDB  |\n                +-----------+`,
    quote: '“Ship often. Think big. Stay sharp.” – J.L.',
    clear: '__CLEAR__',
    exit: 'Logging out...\nSession terminated.',
    'source code': 'Browse source: https://github.com/serversorcerer/cloud-resume-challenge'
  };

  if (!command) {
    return { statusCode: 400, headers: HEADERS, body: 'No command provided.' };
  }

  const output = responses[command];
  if (!output) {
    return { statusCode: 404, headers: HEADERS, body: `Command not found: ${command}` };
  }

  return { statusCode: 200, headers: HEADERS, body: output };
};