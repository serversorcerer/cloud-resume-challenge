# ---------------------------------------------------------------------------
# Least-privilege deploy policy for the GitHub Actions CI/CD pipeline.
#
# Scopes the CI credentials to EXACTLY what .github/workflows/complete-cicd.yml
# does on a merge to main:
#   - deploy-frontend : aws s3 sync website/ s3://josephaleto.io/ --delete
#                       + cloudfront create-invalidation (distribution EDF9KNLZPHME3)
#   - deploy-lambda   : aws lambda update-function-code (blackjack-game)
#                       + aws lambda wait function-updated
#
# It does NOT grant: create/delete buckets, create/delete distributions,
# IAM, Route 53, DynamoDB, or any resource outside the two named above.
#
# Attach this to the existing CI IAM user via the (commented) attachment at
# the bottom — set var.cicd_iam_user_name first. Review with `terraform plan`
# before apply.
# ---------------------------------------------------------------------------

data "aws_caller_identity" "current" {}

variable "cicd_iam_user_name" {
  description = "Name of the existing IAM user whose access keys are stored in the GitHub Actions secrets (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY). Leave empty to create the policy without attaching it."
  type        = string
  default     = ""
}

locals {
  site_bucket          = "josephaleto.io"
  cloudfront_dist_id   = "EDF9KNLZPHME3"
  lambda_function_name = "blackjack-game"
}

data "aws_iam_policy_document" "cicd_deploy" {
  # --- Frontend: S3 sync (list + read + write + delete on the site bucket only)
  statement {
    sid     = "SiteBucketList"
    effect  = "Allow"
    actions = ["s3:ListBucket", "s3:GetBucketLocation"]
    resources = ["arn:aws:s3:::${local.site_bucket}"]
  }

  statement {
    sid    = "SiteObjectReadWrite"
    effect = "Allow"
    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
    ]
    resources = ["arn:aws:s3:::${local.site_bucket}/*"]
  }

  # --- Frontend: CloudFront cache invalidation on the one distribution
  statement {
    sid    = "CloudFrontInvalidate"
    effect = "Allow"
    actions = [
      "cloudfront:CreateInvalidation",
      "cloudfront:GetInvalidation",
      "cloudfront:ListInvalidations",
    ]
    resources = [
      "arn:aws:cloudfront::${data.aws_caller_identity.current.account_id}:distribution/${local.cloudfront_dist_id}",
    ]
  }

  # --- Lambda: update code + poll for completion on the one function
  statement {
    sid    = "LambdaUpdateCode"
    effect = "Allow"
    actions = [
      "lambda:UpdateFunctionCode",
      "lambda:GetFunction",
      "lambda:GetFunctionConfiguration",
    ]
    resources = [
      "arn:aws:lambda:${var.aws_region}:${data.aws_caller_identity.current.account_id}:function:${local.lambda_function_name}",
    ]
  }
}

resource "aws_iam_policy" "cicd_deploy" {
  name        = "cicd-deploy-frontend-lambda"
  description = "Deploy-only: S3 sync to josephaleto.io, CloudFront invalidation (EDF9KNLZPHME3), and blackjack-game Lambda code updates. Used by GitHub Actions."
  policy      = data.aws_iam_policy_document.cicd_deploy.json

  tags = {
    Name        = "CICDDeployPolicy"
    Environment = "production"
    Project     = "CloudResume"
  }
}

# Attach to the existing CI user (only when a name is provided).
resource "aws_iam_user_policy_attachment" "cicd_deploy" {
  count      = var.cicd_iam_user_name == "" ? 0 : 1
  user       = var.cicd_iam_user_name
  policy_arn = aws_iam_policy.cicd_deploy.arn
}

output "cicd_deploy_policy_arn" {
  description = "ARN of the deploy-only policy to attach to the CI IAM user."
  value       = aws_iam_policy.cicd_deploy.arn
}
