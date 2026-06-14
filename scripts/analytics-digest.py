#!/usr/bin/env python3
"""
analytics-digest: weekly traffic + conversion report for josephaleto.io.

Reads the `site-analytics` DynamoDB table and summarizes the signals that
actually matter for a job search: where qualified traffic comes from and
whether it converts (CV downloads, email clicks, terminal engagement).

Usage:
    python scripts/analytics-digest.py            # last 7 days
    python scripts/analytics-digest.py --days 30
    python scripts/analytics-digest.py --days 1   # today

Requires local AWS credentials with read access to the table and boto3
(`pip install boto3`).
"""

import argparse
import collections
import datetime as dt

import boto3
from boto3.dynamodb.conditions import Key

TABLE = "site-analytics"
REGION = "us-east-1"

CONVERSIONS = ["cv_download", "email_click", "email_copy", "out_linkedin", "out_github"]


def fetch(days):
    table = boto3.resource("dynamodb", region_name=REGION).Table(TABLE)
    today = dt.datetime.now(dt.timezone.utc).date()
    items = []
    for offset in range(days):
        day = (today - dt.timedelta(days=offset)).isoformat()
        resp = table.query(KeyConditionExpression=Key("pk").eq(f"EV#{day}"))
        items.extend(resp.get("Items", []))
        while "LastEvaluatedKey" in resp:
            resp = table.query(
                KeyConditionExpression=Key("pk").eq(f"EV#{day}"),
                ExclusiveStartKey=resp["LastEvaluatedKey"],
            )
            items.extend(resp.get("Items", []))
    return items


def bar(n, total, width=24):
    if not total:
        return ""
    filled = int(round(width * n / total))
    return "#" * filled + "." * (width - filled)


def top(counter, label, limit=8):
    print(f"\n{label}")
    if not counter:
        print("  (none yet)")
        return
    total = sum(counter.values())
    for key, n in counter.most_common(limit):
        print(f"  {n:>5}  {bar(n, total)}  {key}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--days", type=int, default=7)
    args = ap.parse_args()

    items = fetch(args.days)

    events = collections.Counter(i.get("event", "?") for i in items)
    page_views = events.get("page_view", 0)
    visitors = {i.get("visitor") for i in items if i.get("visitor")}

    referrers = collections.Counter(
        i.get("ref") for i in items if i.get("event") == "page_view" and i.get("ref")
    )
    direct = sum(
        1 for i in items if i.get("event") == "page_view" and not i.get("ref")
    )
    if direct:
        referrers["(direct / none)"] = direct

    utm = collections.Counter(
        i.get("utm_source") for i in items if i.get("utm_source")
    )
    campaigns = collections.Counter(
        i.get("utm_campaign") for i in items if i.get("utm_campaign")
    )
    commands = collections.Counter(
        i.get("cmd") for i in items if i.get("event") == "terminal_command" and i.get("cmd")
    )

    conv_total = sum(events.get(c, 0) for c in CONVERSIONS)
    conv_rate = (conv_total / page_views * 100) if page_views else 0

    print("=" * 56)
    print(f"  josephaleto.io traffic digest - last {args.days} day(s)")
    print("=" * 56)
    print(f"  page views          {page_views}")
    print(f"  unique visitors     {len(visitors)}")
    print(f"  total events        {sum(events.values())}")
    print(f"  conversions         {conv_total}  ({conv_rate:.1f}% of views)")

    print("\n-- conversions (the part that lands the job) --")
    for c in CONVERSIONS:
        print(f"  {events.get(c, 0):>5}  {c}")

    top(referrers, "-- traffic sources (referrer host) --")
    top(utm, "-- UTM source (tagged links) --")
    top(campaigns, "-- UTM campaign --")
    top(commands, "-- terminal commands run --")
    print()


if __name__ == "__main__":
    main()
