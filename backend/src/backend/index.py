import os
from collections import defaultdict
from datetime import date, datetime, timedelta

import cachetools.func
import hug
import pymysql
import pymysql.cursors

api = hug.API(__name__)
api.http.add_middleware(hug.middleware.CORSMiddleware(api, max_age=10))


def db_connect(db):
    return pymysql.connect(**dict(db))


@hug.directive()
def db(**_kwargs):
    return (
        ("host", os.environ.get("DB_HOST", "localhost")),
        ("port", int(os.environ.get("DB_PORT", 3306))),
        ("user", os.environ.get("DB_USER", "root")),
        ("password", os.environ.get("DB_PASS", "abc123")),
        ("db", os.environ.get("DB_NAME", "censorship")),
        ("charset", "utf8mb4"),
        ("cursorclass", pymysql.cursors.DictCursor),
    )


@hug.local()
@hug.get("/api/country", output=hug.output_format.json)
def country_get_list(hug_db):
    with db_connect(hug_db).cursor() as _cursor:
        _cursor.execute(
            """
            SELECT  DISTINCT country_code
            FROM    sites
            WHERE   country_code != 'GLOBAL'
            """
        )

        return {
            "country_list": [
                country["country_code"].lower() for country in _cursor.fetchall()
            ]
        }


@hug.local()
@hug.get("/api/category", output=hug.output_format.json)
def category_get_list(hug_db):
    with db_connect(hug_db).cursor() as _cursor:
        _cursor.execute(
            """
            SELECT  DISTINCT category_code, category_description
            FROM    sites
            """
        )

        return {"category_list": _cursor.fetchall()}


@hug.local()
@hug.get("/api/site/{country}", output=hug.output_format.json)
def country_get_sites(hug_db, country):
    with db_connect(hug_db).cursor() as _cursor:
        site_list = {}
        _cursor.execute(
            """
            SELECT      s.*
            FROM        sites s
            JOIN        (
                SELECT     country_code, url, MAX(import_date) AS import_date
                FROM       sites
                GROUP BY   country_code, url
            ) smax
            USING       (import_date, url, country_code)
            WHERE       LOWER(country_code) = %s
            UNION
            SELECT      s.*
            FROM        sites s
            JOIN        (
                SELECT     country_code, url, MAX(import_date) AS import_date
                FROM       sites
                GROUP BY   country_code, url
            ) smax
            USING       (import_date, url, country_code)
            WHERE       LOWER(country_code) = 'global'
            """,
            (country.lower(),),
        )

        for row in _cursor.fetchall():
            try:
                site_list[row["category_code"]]["site_list"].append(dict(row))
            except KeyError:
                site_list[row["category_code"]] = {
                    "code": row["category_code"],
                    "description": row["category_description"],
                    "site_list": [dict(row)],
                }

        return {
            "country": country,
            "category_list": [category for _code, category in site_list.items()],
        }


@hug.local()
@hug.get("/api/isp/{country}", output=hug.output_format.json)
def country_get_isp(hug_db, country):
    return {
        "country": country,
        "isp": [
            {
                "isp_name": isp_name,
                "as_list": [{"as_number": as_number} for as_number in as_list],
            }
            for isp_name, as_list in db_get_isp(hug_db, country).items()
        ],
    }


@cachetools.func.ttl_cache(
    maxsize=int(os.environ.get("CACHE_SIZE", "512")),
    ttl=int(os.environ.get("CACHE_TTL", "3600")),
)
def db_get_isp(hug_db, country):
    result = defaultdict(list)

    with db_connect(hug_db).cursor() as _cursor:
        _cursor.execute(
            """
            SELECT      isp, asn
            FROM        isp
            WHERE       LOWER(country_code) = %s
            """,
            (country.lower(),),
        )

        row = _cursor.fetchone()
        while row:
            result[row["isp"]].append(row["asn"])

            row = _cursor.fetchone()

    return result


@hug.local()
@hug.get("/api/history/year/{year}/country/{country}")
def history_year_get_country(hug_db, year, country):

    return {
        "country": country,
        "site_list": [
            {
                "site_url": site_url,
                "isp_list": [
                    {"isp": row["isp"], "count": row["count"]} for row in isp_list
                ],
            }
            for site_url, isp_list in db_fetch_country_history(
                hug_db, year, country
            ).items()
        ],
    }


# @cachetools.func.ttl_cache(maxsize=int(os.environ.get('CACHE_SIZE', '512')), ttl=int(os.environ.get('CACHE_TTL', '3600')))
def db_fetch_country_history(hug_db, year, country):
    site_list = defaultdict(list)

    with db_connect(hug_db).cursor() as _cursor:
        _cursor.execute(
            """
            SELECT      m.input, i.isp, COUNT(*) AS count
            FROM        measurements m
            JOIN        isp i
            ON          i.asn = m.probe_asn
            WHERE       LOWER(m.probe_cc) = %s
                        AND (m.anomaly = TRUE OR m.confirmed = TRUE)
                        AND (m.measurement_start_time BETWEEN '%s-01-01' AND '%s-12-31')
            GROUP BY    m.input, isp;
            """,
            (country.lower(), int(year), int(year)),
        )

        row = _cursor.fetchone()
        while row:
            site_list[row["input"]].append(row)

            row = _cursor.fetchone()

    return site_list


@hug.local()
@hug.get("/api/history/year/{year}/country/{country}/site")
def history_year_country_get_site(request, hug_db, year, country):
    site = request.params["site"]

    return {
        "year": year,
        "country": country,
        "site": site,
        "history": db_fetch_site_history(hug_db, year, country, site),
    }


def db_fetch_site_history(hug_db, year, country, site):
    result = defaultdict(list)

    with db_connect(hug_db).cursor() as _cursor:
        _cursor.execute(
            """
            SELECT      *
            FROM        measurements
            WHERE       LOWER(probe_cc) = %s
                        AND (anomaly = TRUE OR confirmed = TRUE)
                        AND (measurement_start_time BETWEEN '%s-01-01' AND '%s-12-31')
                        AND input LIKE %s
            ORDER BY    measurement_start_time
            """,
            (
                country.lower(),
                int(year),
                int(year),
                site if isinstance(site, str) else "%".join(site),
            ),
        )

        row = _cursor.fetchone()
        while row:
            result[row["probe_asn"]].append(row)

            row = _cursor.fetchone()

    return result


@hug.local()
@hug.get("/api/summary/{year}")
def summary_get(hug_db, year):
    country_list = defaultdict(dict)

    for row in db_fetch_summary(hug_db, year):
        country_list[row["country"].lower()][row["category"]] = row["count"]

    return {
        "year": year,
        "country_list": [
            {
                "country": country,
                "category_list": [
                    {"category": category, "count": count}
                    for category, count in category_list.items()
                ],
            }
            for country, category_list in country_list.items()
        ],
    }


def db_fetch_summary(hug_db, year):
    with db_connect(hug_db).cursor() as _cursor:
        _cursor.execute(
            """
            SELECT      country, category, count
            FROM        summary_view
            WHERE       year = %s AND country != 'GLOBAL';
            """,
            (year,),
        )

        return _cursor.fetchall()
