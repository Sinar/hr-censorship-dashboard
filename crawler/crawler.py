import os
import time
import logging

import dateutil.parser
import pymysql
import requests

logging.basicConfig(
    level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

FIELDS = ('anomaly', 'confirmed', 'failure', 'input', 'measurement_id',
          'measurement_start_time', 'measurement_url', 'probe_asn', 'probe_cc',
          'report_id', 'test_name')

conn = pymysql.connect(
    host=os.environ.get('DB_HOST', 'localhost'),
    port=int(os.environ.get('DB_PORT', 3306)),
    user=os.environ.get('DB_USER', 'root'),
    password=os.environ.get('DB_PASS', 'abc123'),
    db=os.environ.get('DB_NAME', 'censorship'),
    charset='utf8mb4',
    cursorclass=pymysql.cursors.DictCursor)

with conn:
    with conn.cursor() as _fetch_cursor:
        _fetch_cursor.execute(
            '''
                              SELECT     *
                              FROM       sites s
                              JOIN       (
                                  SELECT     country_code, url, MAX(import_date) AS import_date
                                  FROM       sites
                                  GROUP BY   country_code, url
                              ) smax
                              USING      (import_date, url, country_code)
                              WHERE      country_code = %s
                              ''', (os.environ.get('COUNTRY_CODE', 'MY'), ))

        for i, row in enumerate(_fetch_cursor.fetchall()):
            logging.info('%s: Fetching measurements for %s',
                         os.environ.get('COUNTRY_CODE', 'MY'), row['url'])
            response = requests.get(
                'https://api.ooni.io/api/v1/measurements',
                params={
                    'probe_cc': row['country_code'],
                    'input': row['url']
                })

            if not response.ok:
                logging.info(
                    '%s: Error fetching measurements for %s, skipping',
                    os.environ.get('COUNTRY_CODE', 'MY'), row['url'])
                continue

            conn.begin()
            with conn.cursor() as _insert_cursor:
                logging.info('%s: Updating measurements for %s',
                             os.environ.get('COUNTRY_CODE', 'MY'), row['url'])
                for result in response.json().get('results', []):
                    _insert_cursor.execute(
                        '''
                        REPLACE
                        INTO     measurements({})
                        VALUES   ({})
                        '''.format(', '.join(FIELDS), ', '.join(
                            '%s' for _ in range(len(FIELDS)))),
                        tuple(
                            dateutil.parser.parse(result[field]) if field ==
                            'measurement_start_time' else result[field]
                            for field in FIELDS))

            conn.commit()

            time.sleep(float(os.environ.get('SLEEP_TIME', 2)))

        # write summary
        conn.begin()
        with conn.cursor() as _cur:
            logging.info(
                '%s: Updating summary before ending this crawling session',
                os.environ.get('COUNTRY_CODE', 'MY'))
            _cur.execute(
                '''
                REPLACE INTO summary_view(year, country, category, count)
                    SELECT      YEAR(measurement_start_time) AS year,
                                m.probe_cc AS country,
                                s.category_code AS category,
                                COUNT(DISTINCT m.input) AS count
                    FROM        measurements m
                    JOIN        sites s
                    ON          (m.input = s.url
                                    AND m.probe_cc = s.country_code)
                    WHERE       YEAR(measurement_start_time) = YEAR(NOW())
                                AND m.probe_cc = 'MY'
                                AND (anomaly = TRUE OR confirmed = TRUE)
                    GROUP BY    YEAR(measurement_start_time), m.probe_cc, s.category_code;
                ''', (os.environ.get('COUNTRY_CODE', 'MY'), ))
        conn.commit()