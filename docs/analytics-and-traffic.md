# Analytics & Traffic Playbook

Privacy-friendly analytics for josephaleto.io. No cookies, no raw IPs, no PII.
Events flow: browser (`website/js/analytics.js`) → `site-analytics` Lambda
(Function URL) → `site-analytics` DynamoDB table → weekly digest script.

## Read the numbers

```bash
python scripts/analytics-digest.py            # last 7 days
python scripts/analytics-digest.py --days 30  # last 30 days
python scripts/analytics-digest.py --days 1   # today
```

Requires local AWS credentials with read access and `boto3`
(`pip install boto3`).

The digest reports page views, unique visitors, **conversions** (the part
that lands the job: CV downloads, email clicks/copies, LinkedIn/GitHub
clicks), traffic sources, UTM breakdown, and which terminal commands people
actually run.

## What gets tracked

| Event              | Fires when                                  |
| ------------------ | ------------------------------------------- |
| `page_view`        | Any page load                               |
| `cv_download`      | A `.pdf` (resume) link is clicked           |
| `email_click`      | A `mailto:` link is clicked                 |
| `email_copy`       | The "copy email" button is clicked          |
| `out_linkedin`     | A LinkedIn link is clicked                  |
| `out_github`       | A GitHub link is clicked                    |
| `terminal_command` | A command is run in the live terminal       |

The terminal records the command keyword only. Lead-capture free text
(name/email/company) is never sent.

## UTM links: tag every channel

Always link with UTM params so the digest can tell you which channel actually
converts. Base: `https://josephaleto.io/?utm_source=...&utm_medium=...&utm_campaign=...`

Ready to paste:

- LinkedIn post: `https://josephaleto.io/?utm_source=linkedin&utm_medium=social&utm_campaign=daily`
- LinkedIn DM / outreach: `https://josephaleto.io/?utm_source=linkedin&utm_medium=dm&utm_campaign=outreach`
- LinkedIn featured/profile: `https://josephaleto.io/?utm_source=linkedin&utm_medium=profile&utm_campaign=bio`
- X / Twitter: `https://josephaleto.io/?utm_source=twitter&utm_medium=social&utm_campaign=buildinpublic`
- GitHub profile README: `https://josephaleto.io/?utm_source=github&utm_medium=profile&utm_campaign=readme`
- Hacker News (Show HN): `https://josephaleto.io/?utm_source=hn&utm_medium=referral&utm_campaign=showhn`
- Reddit (r/devops, r/aws): `https://josephaleto.io/?utm_source=reddit&utm_medium=referral&utm_campaign=showcase`
- dev.to / Hashnode / Medium: `https://josephaleto.io/?utm_source=devto&utm_medium=blog&utm_campaign=selfdeploy`
- Email signature: `https://josephaleto.io/?utm_source=email&utm_medium=signature&utm_campaign=sig`

Tip: deep-link straight to the proof for technical audiences:
`https://josephaleto.io/?utm_source=hn&utm_medium=referral&utm_campaign=showhn#console`

## Infrastructure

Defined in `infra/analytics.tf` (IaC record). Applied out-of-band via AWS CLI
because the Terraform apply job is disabled and state is local.

- DynamoDB: `site-analytics` (PAY_PER_REQUEST, 90-day TTL)
- Lambda: `site-analytics` (nodejs20.x, source in `lambda-analytics/`)
- Function URL: public, CORS-locked to the site origins
- Cost: effectively $0 at portfolio traffic (pay-per-request + free tier)

The `HASH_SALT` env var (visitor-hash secret) is set only on the function,
never committed.
