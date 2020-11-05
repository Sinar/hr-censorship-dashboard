# NOTE: a day starts from (00:00, 00:00]

import asyncio
import logging
import os
import time
from datetime import datetime, timedelta
from random import randint

import aiohttp
import pymysql

logging.basicConfig(
    level=logging.DEBUG, format="%(asctime)s - %(levelname)s - %(message)s"
)

MODE_SEEDING = "SEED"
MODE_CLOSING = "CLOSE"
MODE_CRAWLING = "CRAWL"


def sleep(country):
    logging.info("%s: Taking a break", country)
    sleep_time = int(os.environ.get("SLEEP_TIME", "15"))
    time.sleep(
        randint(sleep_time, sleep_time + int(os.environ.get("SLEEP_RANGE", "5")))
    )


def condition_get_seeding(current_date, first_day, last_day, crawl_date):
    return (
        last_day <= crawl_date
        and last_day.year <= current_date.year
        and last_day.month <= current_date.month
    )


def condition_get_crawl(current_date, first_day, last_day, crawl_date):
    return (first_day < current_date <= last_day) or (
        last_day < crawl_date < current_date
        and current_date.year == crawl_date.year
        and current_date.month == crawl_date.month
        and int(f"{crawl_date.year}{crawl_date.month:02d}")
        - int(f"{first_day.year}{first_day.month:02d}")
        == 1
    )


async def crawl_country(crawl_date, country, conn, session):
    logging.info("%s: Crawling start", country)

    with conn.cursor() as mode_cursor:
        mode_cursor.execute(
            """
            SELECT      year, month, crawl_date
            FROM        summary_measurements
            WHERE       probe_cc = %s
            ORDER BY    crawl_date DESC, year DESC, month DESC
            LIMIT       1;
            """,
            (country,),
        )
        previous = mode_cursor.fetchone()

        logging.info(
            "%s: Last crawl at %s for year %s month %s",
            country,
            previous["crawl_date"],
            previous["year"],
            previous["month"],
        )

        param = mode_get_param(
            previous_get_mode(crawl_date, **previous),
            crawl_date,
            previous["year"],
            previous["month"],
        )
        logging.info(
            "%s: operating_mode=%s, start=%s, end=%s",
            country,
            param["mode"],
            param["start"],
            param["end"],
        )

    with conn.cursor() as fetch_cursor:
        fetch_cursor.execute(
            """
            SELECT     distinct url
            FROM       sites s
            JOIN       (
                SELECT     country_code, url, MAX(import_date) AS import_date
                FROM       sites
                GROUP BY   country_code, url
            ) smax
            USING      (import_date, url, country_code)
            WHERE      LOWER(country_code) IN (%s, 'global')
            """,
            (country.lower(),),
        )

        urls = tuple(row["url"] for row in fetch_cursor)

    logging.info(
        "%s: Fetching measurements summary from %s to %s",
        country,
        param["start"],
        param["end"],
    )
    response = await session.get(
        "https://api.ooni.io/api/v1/aggregation",
        params={
            "probe_cc": country.upper(),
            "test_name": "web_connectivity",
            "since": param["start"].isoformat(),
            "until": param["end"].isoformat(),
            "axis_x": "probe_asn",
            "axis_y": "input",
        },
    )

    logging.info(
        "%s: API balance x-ratelimit-remaining=%s",
        country,
        response.headers.get("x-ratelimit-remaining", "unknown"),
    )

    if not response.ok:
        logging.error(
            "%s: Error fetching measurements summary from %s to %s (%s %s), skipping",
            country,
            param["start"],
            param["end"],
            response.status,
            response.reason,
        )
    else:

        conn.begin()
        result_response = await response.json()
        rows = tuple(
            row_construct(country, _result, param, crawl_date, str(response.url))
            for _result in result_response.get("result", [])
            if _result["input"] in urls
        )
        with conn.cursor() as replace_cursor:
            logging.info(
                "%s: Updating %s measurements summary reports to the database",
                country,
                len(rows),
            )
            for fields, result in rows:
                replace_cursor.execute(
                    f"""
                    REPLACE
                    INTO        summary_measurements({','.join(field for field in fields)})
                    VALUES      ({','.join('%s' for _ in fields)})
                    """,
                    tuple(result[field] for field in fields),
                )
        conn.commit()

    conn.begin()
    with conn.cursor() as isp_cursor:
        logging.info("%s: Clearing previous isp cache", country)
        isp_cursor.execute(
            "DELETE FROM isp WHERE LOWER(country_code) = %s",
            (country,),
        )

        logging.info("%s: populating isp cache", country)
        isp_cursor.execute(
            """
            INSERT
            INTO        isp(country_code, isp, asn)
            SELECT      DISTINCT m.probe_cc,
                        COALESCE(a.autonomous_system_organization, 'unknown'),
                        REPLACE(m.probe_asn, 'AS', '')
            FROM        summary_measurements m
            LEFT JOIN   asn a
            ON          REPLACE(a.autonomous_system_number, 'AS', '') = REPLACE(m.probe_asn, 'AS', '')
            WHERE       LOWER(m.probe_cc) = %s
            """,
            (country.lower(),),
        )
    conn.commit()

    conn.begin()
    with conn.cursor() as replace_cursor:
        logging.info(
            "%s: Updating summary before ending this crawling session",
            country,
        )
        replace_cursor.execute(
            """
            REPLACE
            INTO        summary_view(year, country, category, count)
            SELECT      m.year AS year,
                        m.probe_cc AS country,
                        COALESCE(sc.category_code, sg.category_code) AS category,
                        COUNT(DISTINCT input) AS count
            FROM        summary_measurements m
            LEFT JOIN   (
                            SELECT  url, category_code
                            FROM    sites
                            JOIN    (
                                SELECT     country_code, url, MAX(import_date) AS import_date
                                FROM       sites
                                GROUP BY   country_code, url
                            ) AS sgmax
                            USING   (country_code, url, import_date)
                            WHERE   LOWER(country_code) = 'global'
                        ) AS sg
            ON          (m.input = sg.url)
            LEFT JOIN   (
                            SELECT  url, category_code
                            FROM    sites
                            JOIN    (
                                SELECT     country_code, url, MAX(import_date) AS import_date
                                FROM       sites
                                GROUP BY   country_code, url
                            ) AS scmax
                            USING   (country_code, url, import_date)
                            WHERE   LOWER(country_code) = %s
                        ) AS sc
            ON          (m.input = sc.url)
            JOIN        isp i
            ON          (LOWER(m.probe_cc) = LOWER(i.country_code) AND REPLACE(m.probe_asn, 'AS', '') = i.asn)
            WHERE       LOWER(m.probe_cc) = %s
                        AND m.year = %s
                        AND m.anomaly_count > 0
            GROUP BY    m.year, m.probe_cc, category
            """,
            (
                country.lower(),
                country.lower(),
                param["start"].year,
            ),
        )
    conn.commit()


def mode_get_param(mode, current_date, year, month):
    result = {"mode": mode}

    if mode == MODE_CRAWLING:
        result = dict(
            result,
            start=datetime(current_date.year, current_date.month, 1),
            end=month_adder(current_date.year, current_date.month, 1),
        )
    elif mode == MODE_CLOSING:
        result = dict(
            result,
            start=month_subtractor(current_date.year, current_date.month, 1),
            end=datetime(current_date.year, current_date.month, 1),
        )
    else:
        result = dict(
            result,
            start=month_adder(year, month, 1),
            end=month_adder(year, month, 2),
        )

    return result


def month_adder(year, month, n):
    assert n <= 12
    try:
        return datetime(year, month + n, 1)
    except ValueError:
        return datetime(year + 1, 1 + (n - 1), 1)


def month_subtractor(year, month, n):
    assert n <= 12
    try:
        return datetime(year, month - n, 1)
    except ValueError:
        return datetime(year - 1, month + (12 - n), 1)


def previous_get_mode(current_date, year, month, crawl_date):
    assert crawl_date < current_date

    result = MODE_CLOSING
    last_day = month_adder(year, month, 1)

    if condition_get_crawl(
        current_date, datetime(year, month, 1), last_day, crawl_date
    ):
        result = MODE_CRAWLING
    elif condition_get_seeding(
        current_date, datetime(year, month, 1), last_day, crawl_date
    ):
        result = MODE_SEEDING

    return result


def row_construct(country, row, param, crawl_date, source):
    result = dict(
        row,
        year=int(param["start"].year),
        probe_cc=country,
        probe_asn=str(row["probe_asn"]).upper().replace("AS", ""),
        month=param["start"].month,
        crawl_date=crawl_date,
        source=source,
    )

    return result.keys(), result


async def run():
    crawl_date = datetime.now()

    conn = pymysql.connect(
        host=os.environ.get("DB_HOST", "localhost"),
        port=int(os.environ.get("DB_PORT", 3306)),
        user=os.environ.get("DB_USER", "root"),
        password=os.environ.get("DB_PASS", "abc123"),
        db=os.environ.get("DB_NAME", "censorship"),
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor,
    )

    logging.info("Crawling start")

    async with aiohttp.ClientSession() as session:
        countries = os.environ.get("COUNTRIES", "HK,KH,ID,MM,MY,TH,VN").split(",")
        for i, country in enumerate(countries):
            await crawl_country(crawl_date, country, conn, session)
            if not i == len(countries) - 1:
                sleep(country)

    logging.info("Crawling ends")


def main():
    asyncio.run(run())


if __name__ == "__main__":
    main()
