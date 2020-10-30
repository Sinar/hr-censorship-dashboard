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
    sleep_time = int(os.environ.get("SLEEP_TIME", "15"))
    time.sleep(randint(sleep_time, sleep_time + 15))


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

    async with conn.cursor() as fetch_cursor, aiohttp.ClientSession() as session:
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

            response = session.get(
                "https://api.ooni.io/api/v1/measurements",
                params={
                    "probe_cc": os.environ.get("COUNTRY_CODE", "MY").upper(),
                    "input": row["url"],
                },
            )

            if not response.ok:
                logging.info(
                    "%s: Error fetching measurements for %s, skipping",
                    os.environ.get("COUNTRY_CODE", "MY"),
                    row["url"],
                )

            conn.begin()
            with conn.cursor() as _insert_cursor:
                logging.info(
                    "%s: Updating measurements for %s",
                    os.environ.get("COUNTRY_CODE", "MY"),
                    row["url"],
                )
                # FIXME
            conn.commit()

            sleep()

    conn.begin()
    with conn.cursor() as _cur:
        logging.info(
            "%s: Updating summary before ending this crawling session",
            os.environ.get("COUNTRY_CODE", "MY"),
        )
        # FIXME
    conn.commit()

    conn.begin()
    with conn.cursor() as _cur:
        logging.info(
            "%s: Clearing previous isp cache", os.environ.get("COUNTRY_CODE", "MY")
        )
        _cur.execute(
            "DELETE FROM isp WHERE LOWER(country_code) = %s",
            (os.environ.get("COUNTRY_CODE", "MY").lower(),),
        )

        logging.info("%s: populating isp cache", os.environ.get("COUNTRY_CODE", "MY"))
        # FIXME
    conn.commit()


def main():
    asyncio.run(run())


if __name__ == "__main__":
    main()
