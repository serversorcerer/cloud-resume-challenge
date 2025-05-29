# resource "aws_cloudfront_origin_access_identity" "oai" {}

# data "aws_iam_policy_document" "bucket_policy" {
#   statement {
#     actions   = ["s3:GetObject"]
#     resources = ["arn:aws:s3:::josephaleto.io/*"]
#     principals {
#       type        = "AWS"
#       identifiers = [aws_cloudfront_origin_access_identity.oai.iam_arn]
#     }
#   }
# }

# resource "aws_s3_bucket_policy" "site" {
#   bucket = "josephaleto.io"
#   policy = data.aws_iam_policy_document.bucket_policy.json
# }

# resource "aws_route53_record" "site" {
#   zone_id = var.hosted_zone_id
#   name    = var.domain_name
#   type    = "A"
#
#   alias {
#     name                   = aws_cloudfront_distribution.cdn.domain_name
#     zone_id                = aws_cloudfront_distribution.cdn.hosted_zone_id
#     evaluate_target_health = false
#   }
# }

# Placeholder resource blocks for safe Terraform imports
resource "aws_s3_bucket" "site" {
  bucket = "josephaleto.io"
  tags = {
    project = "Cloud Resume Challenge"
  }
}

resource "aws_route53_record" "site" {
  zone_id = var.hosted_zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = "d2xovx63dy2g1n.cloudfront.net" # Replace with actual domain if different
    zone_id                = "Z2FDTNDATAQYW2"                # CloudFront hosted zone ID
    evaluate_target_health = false
  }
}

module "command_api" {
  source             = "./modules/command_api"
  lambda_source_path = "${path.root}/../lambda/commands.js"
}
