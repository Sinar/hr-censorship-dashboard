import asyncio
import logging
import os
import time
from random import randint

import aiohttp
import pymysql

logging.basicConfig(
    level=logging.DEBUG, format="%(asctime)s - %(levelname)s - %(message)s"
)


def sleep():
    logging.info("%s: Taking a break", os.environ.get("COUNTRY_CODE", "MY"))
    sleep_time = int(os.environ.get("SLEEP_TIME", "15"))
    time.sleep(
        randint(sleep_time, sleep_time + int(os.environ.get("SLEEP_RANGE", "5")))
    )


def row_construct(row, url):
    result = dict(
        row,
        year=int(os.environ.get("YEAR", "2020")),
        input=url,
        probe_cc=os.environ.get("COUNTRY_CODE", "MY"),
    )

    return result.keys(), result


async def run():

    conn = pymysql.connect(
        host=os.environ.get("DB_HOST", "localhost"),
        port=int(os.environ.get("DB_PORT", 3306)),
        user=os.environ.get("DB_USER", "root"),
        password=os.environ.get("DB_PASS", "abc123"),
        db=os.environ.get("DB_NAME", "censorship"),
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor,
    )

    async with aiohttp.ClientSession() as session:
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
                (os.environ.get("COUNTRY_CODE", "MY").lower(),),
            )

            for row in fetch_cursor:
                logging.info(
                    "%s: Fetching measurements for %s",
                    os.environ.get("COUNTRY_CODE", "MY"),
                    row["url"],
                )

                response = await session.get(
                    "https://api.ooni.io/api/v1/aggregation",
                    params={
                        "probe_cc": os.environ.get("COUNTRY_CODE", "MY").upper(),
                        "input": row["url"],
                        "test_name": "web_connectivity",
                        "since": f"{os.environ.get('YEAR', 2020)}-01-01",
                        "until": f"{os.environ.get('YEAR', 2020)}-12-31",
                        "axis_x": "probe_asn",
                    },
                )

                if not response.ok:
                    logging.info(
                        "%s: Error fetching measurements of %s, skipping",
                        os.environ.get("COUNTRY_CODE", "MY"),
                        row["url"],
                    )
                    sleep()
                    continue

                conn.begin()
                result = await response.json()
                with conn.cursor() as replace_cursor:
                    logging.info(
                        "%s: Updating measurements for %s",
                        os.environ.get("COUNTRY_CODE", "MY"),
                        row["url"],
                    )

                    for fields, result in (
                        row_construct(_result, row["url"])
                        for _result in result.get("result", [])
                    ):
                        replace_cursor.execute(
                            f"""
                            REPLACE
                            INTO        summary_measurements({','.join(field for field in fields)})
                            VALUES      ({','.join('%s' for _ in fields)})
                            """,
                            tuple(result[field] for field in fields),
                        )
                conn.commit()

                sleep()

    conn.begin()
    with conn.cursor() as isp_cursor:
        logging.info(
            "%s: Clearing previous isp cache", os.environ.get("COUNTRY_CODE", "MY")
        )
        isp_cursor.execute(
            "DELETE FROM isp WHERE LOWER(country_code) = %s",
            (os.environ.get("COUNTRY_CODE", "MY").lower(),),
        )

        logging.info("%s: populating isp cache", os.environ.get("COUNTRY_CODE", "MY"))
        isp_cursor.execute(
            """
            INSERT INTO isp(country_code, isp, asn)
                SELECT      DISTINCT m.probe_cc,
                            COALESCE(a.autonomous_system_organization, 'unknown'),
                            REPLACE(m.probe_asn, 'AS', '')
                FROM        summary_measurements m
                LEFT JOIN   asn a
                ON          REPLACE(a.autonomous_system_number, 'AS', '') = REPLACE(m.probe_asn, 'AS', '')
                WHERE       LOWER(m.probe_cc) = %s
            """,
            (os.environ.get("COUNTRY_CODE", "MY").lower(),),
        )
    conn.commit()

    conn.begin()
    with conn.cursor() as replace_cursor:
        logging.info(
            "%s: Updating summary before ending this crawling session",
            os.environ.get("COUNTRY_CODE", "MY"),
        )
        replace_cursor.execute(
            """
            REPLACE INTO summary_view(year, country, category, count)
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
                            AND i.isp != 'unknown'
                GROUP BY    m.year, m.probe_cc, category
            """,
            (
                os.environ.get("COUNTRY_CODE", "MY").lower(),
                os.environ.get("COUNTRY_CODE", "MY").lower(),
                os.environ.get("YEAR", 2020),
            ),
        )
    conn.commit()


def main():
    asyncio.run(run())


if __name__ == "__main__":
    main()
