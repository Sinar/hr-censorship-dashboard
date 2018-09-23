from collections import defaultdict
import os
from datetime import datetime, timedelta

import hug
import pymysql.cursors
import pymysql


@hug.directive()
def db(**kwargs):
    return pymysql.connect(
        host=os.environ.get('DB_HOST', 'localhost'),
        port=int(os.environ.get('DB_PORT', 3306)),
        user=os.environ.get('DB_USER', 'root'),
        password=os.environ.get('DB_PASS', 'abc123'),
        db=os.environ.get('DB_NAME', 'censorship'),
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor)


@hug.local()
@hug.get('/api/anomaly/country/{country}', output=hug.output_format.json)
def country_get_anomaly(hug_db, country):
    as_list = defaultdict(list)
    with hug_db.cursor() as _cursor:
        _cursor.execute(
            '''
            SELECT      m.*
            FROM        measurements m
            JOIN        (
                SELECT      probe_asn, measurement_url, MAX(measurement_start_time) AS latest
                FROM        measurements
                WHERE       LOWER(probe_cc) = %s
                GROUP BY    probe_asn, measurement_url
            ) mmax
            ON          m.probe_asn = mmax.probe_asn
            AND         m.measurement_url = mmax.measurement_url
            AND         m.measurement_start_time = mmax.latest
            WHERE       LOWER(probe_cc) = %s AND anomaly = TRUE AND measurement_start_time >= %s
            ORDER BY    measurement_start_time DESC
            ''', (country.lower(), country.lower(),
                  datetime.now() - timedelta(hours=12)))

        for row in _cursor.fetchall():
            as_list[row['probe_asn']].append(row)

    return {
        'country':
        country,
        'as_list': [{
            'as_number': asn,
            'measurements': rows
        } for asn, rows in as_list.items()]
    }


@hug.local()
@hug.get(
    '/api/anomaly/country/{country}/asn/{asn}', output=hug.output_format.json)
def asn_get_anomaly(hug_db, country, asn):
    with hug_db.cursor() as _cursor:
        _cursor.execute(
            '''
            SELECT      m.*
            FROM        measurements m
            JOIN        (
                SELECT      probe_asn, measurement_url, MAX(measurement_start_time) AS latest
                FROM        measurements
                WHERE       LOWER(probe_cc) = %s AND LOWER(probe_asn) = %s
                GROUP BY    probe_asn, measurement_url
            ) mmax
            ON          m.probe_asn = mmax.probe_asn
            AND         m.measurement_url = mmax.measurement_url
            AND         m.measurement_start_time = mmax.latest
            WHERE       LOWER(m.probe_cc) = %s AND LOWER(m.probe_asn) = %s AND anomaly = TRUE AND measurement_start_time >= %s
            ORDER BY    measurement_start_time DESC
            ''', (country.lower(), asn.lower(), country.lower(), asn.lower(),
                  datetime.now() - timedelta(hours=12)))

        return {
            'country': country,
            'as_number': asn,
            'measurements': _cursor.fetchall()
        }


@hug.local()
@hug.get('/api/site/{country}', output=hug.output_format.json)
def country_get_sites(hug_db, country):
    with hug_db.cursor() as _cursor:
        _cursor.execute('''
            SELECT      s.*
            FROM        sites s
            JOIN        (SELECT     MAX(import_date) AS import_date
                         FROM       sites
                         WHERE      LOWER(country_code) = %s) last
            ON          s.import_date = last.import_date
            WHERE       LOWER(country_code) = %s
            ORDER BY    category_code, url
            ''', (country.lower(), country.lower()))

        return {'country': country, 'sites': _cursor.fetchall()}


@hug.local()
@hug.get('/api/history/country/{country}/duration/week')
def history_week_get_country(hug_db, country):
    site_list = defaultdict(defaultdict(list))
    with hug_db.cursor() as _cursor:
        _cursor.execute(
            '''
            SELECT      m.*
            FROM        measurements m
            JOIN        (
                SELECT      probe_asn, measurement_url, MAX(measurement_start_time) AS latest
                FROM        measurements
                WHERE       LOWER(probe_cc) = %s
                GROUP BY    probe_asn, measurement_url
            ) mmax
            ON          m.probe_asn = mmax.probe_asn
            AND         m.measurement_url = mmax.measurement_url
            AND         m.measurement_start_time = mmax.latest
            WHERE       LOWER(probe_cc) = %s AND anomaly = TRUE AND measurement_start_time >= %s
            ORDER BY    measurement_start_time DESC
            ''', (country.lower(), country.lower(),
                  datetime.now() - timedelta(days=7)))

        for row in _cursor.fetchall():
            site_list[row['measurement_url']][row['probe_asn']].append(row)

        return {
            'country':
            country,
            'sites': [{
                'site_url':
                site_url,
                'as_list': [{
                    'as_number': as_number,
                    'measurements': measurements
                } for as_number, measurements in as_list.items()]
            } for site_url, as_list in as_list.items()]
        }


@hug.local()
@hug.get('/api/history/country/{country}/site/{url}/duration/week')
def history_week_get_site(hug_db, country, url):
    as_list = defaultdict(list)
    with hug_db.cursor() as _cursor:
        _cursor.execute(
            '''
            SELECT      m.*
            FROM        measurements m
            JOIN        (
                SELECT      probe_asn, measurement_url, MAX(measurement_start_time) AS latest
                FROM        measurements
                WHERE       LOWER(probe_cc) = %s
                GROUP BY    probe_asn, measurement_url
            ) mmax
            ON          m.probe_asn = mmax.probe_asn
            AND         m.measurement_url = mmax.measurement_url
            AND         m.measurement_start_time = mmax.latest
            WHERE       LOWER(probe_cc) = %s AND anomaly = TRUE
                        AND measurement_start_time >= %s
                        AND measurement_url LIKE '%%%s%%'
            ORDER BY    measurement_start_time DESC
            ''', (country.lower(), country.lower(),
                  datetime.now() - timedelta(days=7), url))

        for row in _cursor.fetchall():
            as_list[row['probe_asn']].append(row)

        return {
            'country':
            country,
            'site_url':
            url,
            'as_list': [{
                'as_number': as_number,
                'measurements': measurements
            } for as_number, measurements in as_list.items()]
        }