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
