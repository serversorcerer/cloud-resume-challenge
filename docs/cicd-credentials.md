# CI/CD Credentials Hardening

The redesign agent (and any agent) deploys **only through GitHub Actions** — it never holds AWS keys. The only identity with AWS access is the CI user whose keys live in the repo secrets `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`.

This scopes that CI user to **deploy-only** permissions matching `.github/workflows/complete-cicd.yml`.

## What the policy allows

| Action | Resource | Why |
|--------|----------|-----|
| `s3:ListBucket`, `s3:GetBucketLocation` | `josephaleto.io` bucket | `aws s3 sync` listing |
| `s3:GetObject/PutObject/DeleteObject` | `josephaleto.io/*` | sync `website/` with `--delete` |
| `cloudfront:CreateInvalidation` (+Get/List) | distribution `EDF9KNLZPHME3` | cache bust after deploy |
| `lambda:UpdateFunctionCode`, `GetFunction(Configuration)` | `blackjack-game` | Lambda deploy + `wait function-updated` |

It grants **nothing else** — no bucket/distribution creation, no IAM, Route 53, DynamoDB, or other functions.

## Apply

```bash
cd infra

# 1. See what would change (no attachment yet)
terraform plan \
  -var="domain_name=josephaleto.io" \
  -var="hosted_zone_id=Z04832552KPXWKAMHA0H2"

# 2. Create the policy
terraform apply \
  -var="domain_name=josephaleto.io" \
  -var="hosted_zone_id=Z04832552KPXWKAMHA0H2"
```

Then attach it to your existing CI user by setting `cicd_iam_user_name` (find the user with `aws iam list-users` or check whose access key is in the GitHub secret):

```bash
terraform apply \
  -var="domain_name=josephaleto.io" \
  -var="hosted_zone_id=Z04832552KPXWKAMHA0H2" \
  -var="cicd_iam_user_name=YOUR_CI_USER"
```

## Cut over safely

1. Apply + attach the deploy-only policy **alongside** the user's current permissions.
2. Push a trivial change to `main` and confirm the pipeline still deploys (frontend + lambda).
3. **Remove the old broad policy / admin access** from the CI user so only the scoped policy remains.
4. Rotate the access keys (generate new, update the GitHub secrets, delete the old key).

## Rollback

```bash
terraform destroy -target=aws_iam_policy.cicd_deploy ...
# or detach: clear cicd_iam_user_name and re-apply
```

## Notes

- If you later let an agent run AWS directly, prefer a **short-lived assumed role (STS)** over long-lived keys, scoped the same way.
- New live features should be provisioned by **you** via Terraform (the agent proposes the `.tf`, you `apply`).
